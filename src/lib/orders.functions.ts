import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { createPublicClient } from "./supabase-public.server";
import type { OrderDto, OrderItemDto } from "./dto";

const orderInputSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .min(9)
    .max(20)
    .regex(/^[+\d][\d\s-]*$/, "Enter a valid phone number"),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  deliveryMethod: z.enum(["delivery", "pickup"]),
  deliveryZoneId: z.string().uuid().optional().nullable(),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  paymentMethod: z.enum(["pay_on_delivery", "mpesa", "whatsapp"]),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        size: z.string().max(40).optional().nullable(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(50),
});

async function callerUserId(): Promise<string | null> {
  // Derive ownership only from a verified bearer token; never trust the body.
  const authHeader = getRequestHeader("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  if (token.split(".").length !== 3) return null;
  const supabase = createPublicClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

function makeOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `SJ-${stamp}-${rand}`;
}

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => orderInputSchema.parse(input))
  .handler(async ({ data }): Promise<OrderDto> => {
    const supabase = createPublicClient();

    // Re-price everything server-side from the database.
    const productIds = [...new Set(data.items.map((i) => i.productId))];
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("id, name, price_kes, active, stock")
      .in("id", productIds)
      .eq("active", true);
    if (prodError) throw new Error("Could not validate products");
    const productMap = new Map((products ?? []).map((p) => [p.id, p]));
    for (const item of data.items) {
      const p = productMap.get(item.productId);
      if (!p) throw new Error("One of the items in your cart is no longer available");
    }

    const items: OrderItemDto[] = data.items.map((i) => {
      const p = productMap.get(i.productId)!;
      return {
        product_id: p.id,
        product_name: p.name,
        size: i.size ?? null,
        quantity: i.quantity,
        unit_price_kes: Number(p.price_kes),
      };
    });
    const subtotal = items.reduce((sum, i) => sum + i.unit_price_kes * i.quantity, 0);

    // Delivery fee: pickup is free; free delivery above the shop threshold.
    let deliveryFee = 0;
    let zoneId: string | null = null;
    if (data.deliveryMethod === "delivery") {
      if (!data.deliveryZoneId) throw new Error("Please choose a delivery area");
      const { data: zone } = await supabase
        .from("delivery_zones")
        .select("id, fee_kes")
        .eq("id", data.deliveryZoneId)
        .eq("active", true)
        .maybeSingle();
      if (!zone) throw new Error("Selected delivery area is not available");
      zoneId = zone.id;
      deliveryFee = Number(zone.fee_kes);
      const { data: setting } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "shop")
        .maybeSingle();
      const threshold = Number(
        (setting?.value as { free_delivery_threshold?: number } | null)?.free_delivery_threshold ??
          0,
      );
      if (threshold > 0 && subtotal >= threshold) deliveryFee = 0;
      if (!data.address?.trim()) throw new Error("Please enter your delivery address");
    }

    const userId = await callerUserId();
    const orderNumber = makeOrderNumber();
    const total = subtotal + deliveryFee;

    // Generate the order id server-side and insert without a `.select()` return:
    // anonymous shoppers have INSERT (but not SELECT) access on `orders`, so a
    // PostgREST `insert(...).select().single()` fails after the row is written.
    const orderId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      order_number: orderNumber,
      user_id: userId,
      customer_name: data.customerName,
      phone: data.phone,
      email: data.email || null,
      delivery_method: data.deliveryMethod,
      delivery_zone_id: zoneId,
      address: data.address || null,
      subtotal_kes: subtotal,
      delivery_fee_kes: deliveryFee,
      total_kes: total,
      payment_method: data.paymentMethod,
      notes: data.notes || null,
    });
    if (orderError) throw new Error("Could not place your order. Please try again.");

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(items.map((i) => ({ ...i, order_id: orderId })));
    if (itemsError) throw new Error("Could not place your order. Please try again.");

    return {
      id: orderId,
      order_number: orderNumber,
      customer_name: data.customerName,
      phone: data.phone,
      email: data.email || null,
      delivery_method: data.deliveryMethod,
      delivery_zone_id: zoneId,
      address: data.address || null,
      subtotal_kes: subtotal,
      delivery_fee_kes: deliveryFee,
      total_kes: total,
      status: "pending",
      payment_method: data.paymentMethod,
      notes: data.notes || null,
      created_at: createdAt,
      items,
    };
  });
