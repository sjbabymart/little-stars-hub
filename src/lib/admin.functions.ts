import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "./admin-helpers.server";
import { signImageUrls } from "./supabase-public.server";

const uuid = z.string().uuid();

// ---------- current user's roles (any signed-in user) ----------
export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<string[]> => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    return (data ?? []).map((r) => r.role as string);
  });

// ---------- dashboard overview ----------
export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const s = context.supabase;
    const [products, orders, pendingOrders, appointments, pendingAppointments, carpet, unread] =
      await Promise.all([
        s.from("products").select("id", { count: "exact", head: true }),
        s.from("orders").select("id", { count: "exact", head: true }),
        s.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        s.from("appointments").select("id", { count: "exact", head: true }),
        s
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        s
          .from("red_carpet_images")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        s.from("contact_messages").select("id", { count: "exact", head: true }).eq("read", false),
      ]);
    const { data: recentOrders } = await s
      .from("orders")
      .select("id, order_number, customer_name, total_kes, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6);
    return {
      counts: {
        products: products.count ?? 0,
        orders: orders.count ?? 0,
        pendingOrders: pendingOrders.count ?? 0,
        appointments: appointments.count ?? 0,
        pendingAppointments: pendingAppointments.count ?? 0,
        pendingRedCarpet: carpet.count ?? 0,
        unreadMessages: unread.count ?? 0,
      },
      recentOrders: (recentOrders ?? []).map((o) => ({
        ...o,
        total_kes: Number(o.total_kes),
      })),
    };
  });

// ---------- products ----------
export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("products")
      .select(
        "id, category_id, name, slug, description, price_kes, compare_at_price_kes, image_url, images, stock, sizes, featured, active, created_at, categories(name)",
      )
      .order("created_at", { ascending: false });
    const rows = (data ?? []) as unknown as {
      image_url: string | null;
      images: string[] | null;
      price_kes: number | string;
      compare_at_price_kes: number | string | null;
      categories?: { name: string } | null;
      sizes: string[] | null;
    }[];
    return rows.map((r) => ({
      ...(r as Record<string, unknown>),
      price_kes: Number(r.price_kes),
      compare_at_price_kes:
        r.compare_at_price_kes == null ? null : Number(r.compare_at_price_kes),
      sizes: r.sizes ?? [],
      images: r.images ?? [],
      category_name: r.categories?.name ?? null,
      categories: undefined,
    }));
  });

export const adminSaveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: uuid.optional(),
        name: z.string().trim().min(2).max(160),
        slug: z
          .string()
          .trim()
          .min(2)
          .max(180)
          .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
        categoryId: uuid.nullable(),
        description: z.string().trim().max(2000).optional().or(z.literal("")),
        priceKes: z.number().min(0).max(10_000_000),
        compareAtPriceKes: z.number().min(0).max(10_000_000).nullable(),
        images: z.array(z.string().trim().min(1).max(500)).max(3),
        stock: z.number().int().min(0).max(100000),
        sizes: z.array(z.string().trim().min(1).max(40)).max(20),
        featured: z.boolean(),
        active: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    // Ensure the slug is unique so a new/renamed product never hits the
    // products_slug_key constraint.
    let slug = data.slug;
    const { data: existing } = await context.supabase
      .from("products")
      .select("id, slug")
      .like("slug", `${slug}%`);
    const taken = (existing ?? [])
      .filter((r) => r.id !== data.id)
      .map((r) => r.slug);
    if (taken.includes(slug)) {
      let i = 2;
      while (taken.includes(`${slug}-${i}`)) i++;
      slug = `${slug}-${i}`;
    }

    const payload = {
      name: data.name,
      slug,
      category_id: data.categoryId,
      description: data.description || null,
      price_kes: data.priceKes,
      compare_at_price_kes: data.compareAtPriceKes,
      image_url: data.images[0] ?? null,
      images: data.images,
      stock: data.stock,
      sizes: data.sizes,
      featured: data.featured,
      active: data.active,
    };
    const query = data.id
      ? context.supabase.from("products").update(payload).eq("id", data.id)
      : context.supabase.from("products").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- categories ----------
export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("categories")
      .select("id, name, slug, description, image_url, sort_order, active")
      .order("sort_order");
    return data ?? [];
  });

export const adminSaveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: uuid.optional(),
        name: z.string().trim().min(2).max(120),
        slug: z
          .string()
          .trim()
          .min(2)
          .max(140)
          .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
        description: z.string().trim().max(500).optional().or(z.literal("")),
        sortOrder: z.number().int().min(0).max(1000),
        active: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      sort_order: data.sortOrder,
      active: data.active,
    };
    const query = data.id
      ? context.supabase.from("categories").update(payload).eq("id", data.id)
      : context.supabase.from("categories").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- orders ----------
export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("orders")
      .select(
        "id, order_number, customer_name, phone, email, delivery_method, address, subtotal_kes, delivery_fee_kes, total_kes, status, payment_method, notes, created_at, delivery_zones(name), order_items(id, product_id, product_name, size, quantity, unit_price_kes)",
      )
      .order("created_at", { ascending: false })
      .limit(300);
    return (data ?? []).map((o) => {
      const row = o as unknown as Record<string, unknown> & {
        delivery_zones?: { name: string } | null;
        order_items?: { unit_price_kes: number | string }[];
      };
      return {
        ...row,
        subtotal_kes: Number(row["subtotal_kes"]),
        delivery_fee_kes: Number(row["delivery_fee_kes"]),
        total_kes: Number(row["total_kes"]),
        delivery_zone_name: row.delivery_zones?.name ?? null,
        delivery_zones: undefined,
        items: (row.order_items ?? []).map((i) => ({
          ...(i as Record<string, unknown>),
          unit_price_kes: Number(i.unit_price_kes),
        })),
        order_items: undefined,
      };
    });
  });

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: uuid,
        status: z.enum([
          "pending",
          "confirmed",
          "processing",
          "out_for_delivery",
          "delivered",
          "cancelled",
        ]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- appointments ----------
export const adminListAppointments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("appointments")
      .select(
        "id, parent_name, phone, email, child_name, child_age, service, preferred_date, preferred_time, confirmed_date, confirmed_time, message, status, admin_notes, created_at",
      )
      .order("preferred_date", { ascending: true })
      .limit(300);
    return data ?? [];
  });

export const adminUpdateAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: uuid,
        status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
        adminNotes: z.string().trim().max(800).optional().or(z.literal("")),
        confirmedDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date")
          .optional()
          .or(z.literal("")),
        confirmedTime: z.string().trim().max(40).optional().or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload: Record<string, unknown> = {
      status: data.status,
      admin_notes: data.adminNotes || null,
    };
    if (data.confirmedDate) payload.confirmed_date = data.confirmedDate;
    if (data.confirmedTime) payload.confirmed_time = data.confirmedTime;
    const { error } = await context.supabase
      .from("appointments")
      .update(payload)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- delivery zones ----------
export const adminListZones = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("delivery_zones")
      .select("id, name, fee_kes, estimated_time, active, sort_order")
      .order("sort_order");
    return (data ?? []).map((z) => ({ ...z, fee_kes: Number(z.fee_kes) }));
  });

export const adminSaveZone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: uuid.optional(),
        name: z.string().trim().min(2).max(120),
        feeKes: z.number().min(0).max(100000),
        estimatedTime: z.string().trim().max(120).optional().or(z.literal("")),
        sortOrder: z.number().int().min(0).max(1000),
        active: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload = {
      name: data.name,
      fee_kes: data.feeKes,
      estimated_time: data.estimatedTime || null,
      sort_order: data.sortOrder,
      active: data.active,
    };
    const query = data.id
      ? context.supabase.from("delivery_zones").update(payload).eq("id", data.id)
      : context.supabase.from("delivery_zones").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteZone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("delivery_zones").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- red carpet ----------
export const adminListRedCarpet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("red_carpet_images")
      .select("id, child_name, event_name, image_url, caption, status, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    const rows = (data ?? []) as { image_url: string | null }[];
    await signImageUrls(context.supabase, "red-carpet", rows);
    return rows;
  });

export const adminSetRedCarpetStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ id: uuid, status: z.enum(["pending", "approved", "rejected"]) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("red_carpet_images")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteRedCarpet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row } = await context.supabase
      .from("red_carpet_images")
      .select("image_url")
      .eq("id", data.id)
      .maybeSingle();
    const { error } = await context.supabase
      .from("red_carpet_images")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    const url = row?.image_url;
    if (url && !url.startsWith("/") && !url.startsWith("http")) {
      await context.supabase.storage.from("red-carpet").remove([url]);
    }
    return { ok: true };
  });

// ---------- contact messages ----------
export const adminListMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("contact_messages")
      .select("id, name, email, phone, message, read, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    return data ?? [];
  });

export const adminMarkMessageRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: uuid, read: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("contact_messages")
      .update({ read: data.read })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- site settings ----------
const contactSchema = z.object({
  phone: z.string().trim().max(40),
  whatsapp: z.string().trim().max(20),
  email: z.string().trim().max(160),
  address: z.string().trim().max(300),
  hours: z.string().trim().max(160),
});
const shopSchema = z.object({
  announcement: z.string().trim().max(200),
  free_delivery_threshold: z.number().min(0).max(10_000_000),
  currency: z.string().trim().max(10),
});
const clinicSchema = z.object({
  name: z.string().trim().min(2).max(160),
  tagline: z.string().trim().max(200),
  hours: z.string().trim().max(200),
  phone: z.string().trim().max(40),
  services: z.array(z.string().trim().min(2).max(120)).max(20),
});

export const adminGetSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["contact", "shop", "clinic"]);
    const map = new Map(
      (data ?? []).map((r) => [r.key, r.value as Record<string, unknown>]),
    );
    const contact = (map.get("contact") ?? {}) as Record<string, unknown>;
    const shop = (map.get("shop") ?? {}) as Record<string, unknown>;
    const clinic = (map.get("clinic") ?? {}) as Record<string, unknown>;
    return {
      contact: {
        phone: (contact.phone as string) ?? "",
        whatsapp: (contact.whatsapp as string) ?? "",
        email: (contact.email as string) ?? "",
        address: (contact.address as string) ?? "",
        hours: (contact.hours as string) ?? "",
      },
      shop: {
        announcement: (shop.announcement as string) ?? "",
        free_delivery_threshold: Number(shop.free_delivery_threshold ?? 0),
        currency: (shop.currency as string) ?? "KSh",
      },
      clinic: {
        name: (clinic.name as string) ?? "",
        tagline: (clinic.tagline as string) ?? "",
        hours: (clinic.hours as string) ?? "",
        phone: (clinic.phone as string) ?? "",
        services: (clinic.services as string[]) ?? [],
      },
    };
  });

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .discriminatedUnion("key", [
        z.object({ key: z.literal("contact"), value: contactSchema }),
        z.object({ key: z.literal("shop"), value: shopSchema }),
        z.object({ key: z.literal("clinic"), value: clinicSchema }),
      ])
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("site_settings")
      .upsert({ key: data.key, value: data.value });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
