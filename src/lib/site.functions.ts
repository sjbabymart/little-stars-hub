import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createPublicClient, signImagePaths, signImageUrls } from "./supabase-public.server";
import type {
  Category,
  ClinicSettings,
  ContactSettings,
  DeliveryZone,
  Product,
  RedCarpetImageDto,
  ShopSettings,
  SiteContent,
} from "./dto";

const DEFAULT_CONTACT: ContactSettings = {
  phone: "+254711706413",
  whatsapp: "254711706413",
  email: "info@sjbaby.co.ke",
  address: "Nairobi, Kenya",
  hours: "Mon–Sat, 9:00am – 6:00pm",
};
const DEFAULT_SHOP: ShopSettings = {
  announcement: "",
  free_delivery_threshold: 5000,
  currency: "KSh",
};
const DEFAULT_CLINIC: ClinicSettings = {
  name: "Njau Children's Clinic",
  tagline: "Caring for Children, Supporting Families",
  hours: "Mon–Fri 8:00am–5:00pm",
  phone: "+254711706413",
  services: [],
};

export const getSiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteContent> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["contact", "shop", "clinic"]);
    const map = new Map((data ?? []).map((r) => [r.key, r.value as Record<string, unknown>]));
    const merge = <T>(defaults: T, key: string): T => ({
      ...defaults,
      ...((map.get(key) ?? {}) as Partial<T>),
    });
    return {
      contact: merge(DEFAULT_CONTACT, "contact"),
      shop: merge(DEFAULT_SHOP, "shop"),
      clinic: merge(DEFAULT_CLINIC, "clinic"),
    };
  },
);

type ProductRow = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price_kes: number | string;
  compare_at_price_kes: number | string | null;
  image_url: string | null;
  images: string[] | null;
  stock: number;
  sizes: string[] | null;
  featured: boolean;
  active: boolean;
  created_at: string;
  categories?: { name: string } | null;
};

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    category_id: row.category_id,
    category_name: row.categories?.name ?? null,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price_kes: Number(row.price_kes),
    compare_at_price_kes:
      row.compare_at_price_kes == null ? null : Number(row.compare_at_price_kes),
    image_url: row.image_url,
    images: row.images ?? [],
    stock: row.stock,
    sizes: row.sizes ?? [],
    featured: row.featured,
    active: row.active,
    created_at: row.created_at,
  };
}

export const getCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ categories: Category[]; products: Product[] }> => {
    const supabase = createPublicClient();
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, description, image_url, sort_order, active")
        .eq("active", true)
        .order("sort_order"),
      supabase
        .from("products")
        .select(
          "id, category_id, name, slug, description, price_kes, compare_at_price_kes, image_url, images, stock, sizes, featured, active, created_at, categories(name)",
        )
        .eq("active", true)
        .order("created_at", { ascending: false }),
    ]);
    const rows = (prods ?? []) as unknown as ProductRow[];
    await signImageUrls(supabase, "product-images", rows);
    const products = rows.map(toProduct);
    for (const p of products) {
      if (p.images?.length) p.images = await signImagePaths(supabase, "product-images", p.images);
    }
    return {
      categories: (cats ?? []) as Category[],
      products,
    };
  },
);

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<{ product: Product | null; related: Product[] }> => {
    const supabase = createPublicClient();
    const { data: row } = await supabase
      .from("products")
      .select(
        "id, category_id, name, slug, description, price_kes, compare_at_price_kes, image_url, images, stock, sizes, featured, active, created_at, categories(name)",
      )
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();
    if (!row) return { product: null, related: [] };
    const productRow = row as unknown as ProductRow;
    await signImageUrls(supabase, "product-images", [productRow]);

    const { data: relatedRows } = await supabase
      .from("products")
      .select(
        "id, category_id, name, slug, description, price_kes, compare_at_price_kes, image_url, images, stock, sizes, featured, active, created_at, categories(name)",
      )
      .eq("active", true)
      .neq("id", productRow.id)
      .eq("category_id", productRow.category_id ?? "")
      .limit(4);
    const related = (relatedRows ?? []) as unknown as ProductRow[];
    await signImageUrls(supabase, "product-images", related);
    const product = toProduct(productRow);
    if (product.images?.length) {
      product.images = await signImagePaths(supabase, "product-images", product.images);
    }
    const relatedProducts = related.map(toProduct);
    for (const p of relatedProducts) {
      if (p.images?.length) p.images = await signImagePaths(supabase, "product-images", p.images);
    }
    return { product, related: relatedProducts };
  });

export const getDeliveryZones = createServerFn({ method: "GET" }).handler(
  async (): Promise<DeliveryZone[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("delivery_zones")
      .select("id, name, fee_kes, estimated_time, active, sort_order")
      .eq("active", true)
      .order("sort_order");
    return ((data ?? []) as unknown as DeliveryZone[]).map((z) => ({
      ...z,
      fee_kes: Number(z.fee_kes),
    }));
  },
);

export const getApprovedRedCarpet = createServerFn({ method: "GET" }).handler(
  async (): Promise<RedCarpetImageDto[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("red_carpet_images")
      .select("id, child_name, event_name, image_url, caption, status, created_at")
      .eq("status", "approved")
      .eq("consent_given", true)
      .order("created_at", { ascending: false })
      .limit(60);
    const rows = (data ?? []) as RedCarpetImageDto[];
    // red-carpet bucket is admin-read-only; sign approved photos with the admin client.
    const needsSigning = rows.some(
      (r) => r.image_url && !r.image_url.startsWith("/") && !r.image_url.startsWith("http"),
    );
    if (needsSigning) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await signImageUrls(supabaseAdmin, "red-carpet", rows);
    }
    return rows;
  },
);
