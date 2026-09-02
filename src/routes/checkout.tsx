import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatKes } from "@/lib/format";
import { deliveryZonesQuery, siteContentQuery } from "@/lib/queries";
import { placeOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | S & J Baby Mart Nairobi" },
      {
        name: "description",
        content:
          "Complete your S & J Baby Mart order — choose delivery in Nairobi or store pickup and pay on delivery, by M-Pesa or via WhatsApp.",
      },
      { property: "og:title", content: "Checkout | S & J Baby Mart" },
      {
        property: "og:description",
        content: "Complete your order with delivery in Nairobi or store pickup.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/checkout" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const { data: zones } = useQuery(deliveryZonesQuery);
  const { data: site } = useQuery(siteContentQuery);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [zoneId, setZoneId] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pay_on_delivery" | "mpesa" | "whatsapp">(
    "pay_on_delivery",
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const threshold = site?.shop.free_delivery_threshold ?? 0;
  const zone = (zones ?? []).find((z) => z.id === zoneId) ?? null;
  const deliveryFee = useMemo(() => {
    if (deliveryMethod === "pickup" || !zone) return 0;
    if (threshold > 0 && subtotal >= threshold) return 0;
    return zone.fee_kes;
  }, [deliveryMethod, zone, threshold, subtotal]);
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-primary">Nothing to check out</h1>
        <p className="mt-3 text-sm text-muted-foreground">Add a few items to your cart first.</p>
        <a
          href="/shop"
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Go to shop
        </a>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (deliveryMethod === "delivery" && !zoneId) {
      toast.error("Please choose your delivery area");
      return;
    }
    setSubmitting(true);
    try {
      const order = await placeOrder({
        data: {
          customerName: customerName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          deliveryMethod,
          deliveryZoneId: deliveryMethod === "delivery" ? zoneId : null,
          address: deliveryMethod === "delivery" ? address.trim() : "",
          notes: notes.trim(),
          paymentMethod,
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            quantity: i.quantity,
          })),
        },
      });
      try {
        window.sessionStorage.setItem("sjm-last-order", JSON.stringify(order));
      } catch {
        // storage unavailable
      }
      clear();
      await navigate({ to: "/order-confirmed" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place your order");
    } finally {
      setSubmitting(false);
    }
  }

  const field =
    "rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl text-primary md:text-4xl">Checkout</h1>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <fieldset className="rounded-3xl border border-border bg-card p-6">
            <legend className="px-2 font-display text-lg text-primary">Your details</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label htmlFor="name" className="text-sm font-semibold">
                  Full name
                </label>
                <input
                  id="name"
                  required
                  autoComplete="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={field}
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="phone" className="text-sm font-semibold">
                  Phone number
                </label>
                <input
                  id="phone"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+2547…"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={field}
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <label htmlFor="email" className="text-sm font-semibold">
                  Email <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={field}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-3xl border border-border bg-card p-6">
            <legend className="px-2 font-display text-lg text-primary">Delivery</legend>
            <div className="flex flex-wrap gap-2">
              {(["delivery", "pickup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDeliveryMethod(m)}
                  aria-pressed={deliveryMethod === m}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    deliveryMethod === m
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-primary hover:bg-secondary"
                  }`}
                >
                  {m === "delivery" ? "Deliver to me" : "Pick up in store"}
                </button>
              ))}
            </div>

            {deliveryMethod === "delivery" && (
              <div className="mt-5 grid gap-4">
                <div className="grid gap-1.5">
                  <label htmlFor="zone" className="text-sm font-semibold">
                    Delivery area
                  </label>
                  <select
                    id="zone"
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className={field}
                    required
                  >
                    <option value="">Select an area…</option>
                    {(zones ?? []).map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} — {formatKes(z.fee_kes)}
                        {z.estimated_time ? ` · ${z.estimated_time}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="address" className="text-sm font-semibold">
                    Delivery address
                  </label>
                  <textarea
                    id="address"
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Estate / building, street, landmark"
                    className={field}
                  />
                </div>
              </div>
            )}
          </fieldset>

          <fieldset className="rounded-3xl border border-border bg-card p-6">
            <legend className="px-2 font-display text-lg text-primary">Payment</legend>
            <div className="grid gap-2">
              {(
                [
                  ["pay_on_delivery", "Pay on delivery / on pickup"],
                  ["mpesa", "M-Pesa (we'll share details to complete payment)"],
                  ["whatsapp", "Arrange on WhatsApp"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-semibold"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                    className="size-4"
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="mt-5 grid gap-1.5">
              <label htmlFor="notes" className="text-sm font-semibold">
                Order notes <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={field}
              />
            </div>
          </fieldset>
        </div>

        <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl text-primary">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size ?? ""}`} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {i.name}
                  {i.size ? ` · ${i.size}` : ""} × {i.quantity}
                </span>
                <span className="font-semibold text-primary">
                  {formatKes(i.priceKes * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-semibold text-primary">{formatKes(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="font-semibold text-primary">
                {deliveryMethod === "pickup" ? "Free (pickup)" : formatKes(deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <dt className="font-bold text-primary">Total</dt>
              <dd className="font-bold text-primary">{formatKes(total)}</dd>
            </div>
          </dl>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-leaf px-5 py-3 text-sm font-bold text-leaf-foreground disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {submitting ? "Placing order…" : "Place order"}
          </button>
          <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-leaf" aria-hidden="true" />
            Final prices are confirmed by our team before dispatch. We&apos;ll call you to confirm.
          </p>
        </aside>
      </form>
    </div>
  );
}
