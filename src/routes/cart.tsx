import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatKes } from "@/lib/format";
import { siteContentQuery } from "@/lib/queries";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart | S & J Baby Mart" },
      {
        name: "description",
        content:
          "Review the baby clothing and essentials in your S & J Baby Mart cart before checking out with delivery in Nairobi or store pickup.",
      },
      { property: "og:title", content: "Your Cart | S & J Baby Mart" },
      {
        property: "og:description",
        content: "Review your items and check out with delivery in Nairobi or store pickup.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/cart" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, setQuantity, removeItem, clear } = useCart();
  const { data: site } = useQuery(siteContentQuery);
  const threshold = site?.shop.free_delivery_threshold ?? 0;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-primary">Your cart is empty</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Browse our baby clothing and essentials to get started.
        </p>
        <a
          href="/shop"
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Start shopping
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl text-primary md:text-4xl">Your cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {items.map((i) => (
            <li
              key={`${i.productId}-${i.size ?? ""}`}
              className="flex gap-4 rounded-3xl border border-border bg-card p-4"
            >
              <a href={`/product/${i.slug}`} className="shrink-0">
                <div className="size-24 overflow-hidden rounded-2xl bg-muted">
                  {i.imageUrl && (
                    <img src={i.imageUrl} alt={i.name} className="size-full object-cover" />
                  )}
                </div>
              </a>
              <div className="flex flex-1 flex-col">
                <a href={`/product/${i.slug}`} className="font-display text-lg text-primary">
                  {i.name}
                </a>
                {i.size && <p className="text-sm text-muted-foreground">Size: {i.size}</p>}
                <p className="text-sm font-bold text-primary">{formatKes(i.priceKes)}</p>
                <div className="mt-auto flex items-center gap-3 pt-2">
                  <label htmlFor={`qty-${i.productId}-${i.size ?? "n"}`} className="sr-only">
                    Quantity for {i.name}
                  </label>
                  <input
                    id={`qty-${i.productId}-${i.size ?? "n"}`}
                    type="number"
                    min={1}
                    max={20}
                    value={i.quantity}
                    onChange={(e) => setQuantity(i.productId, i.size, Number(e.target.value))}
                    className="w-20 rounded-xl border border-border bg-background px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(i.productId, i.size)}
                    aria-label={`Remove ${i.name} from cart`}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-coral hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Trash2 className="size-4" aria-hidden="true" /> Remove
                  </button>
                </div>
              </div>
              <p className="font-bold text-primary">{formatKes(i.priceKes * i.quantity)}</p>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl text-primary">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-bold text-primary">{formatKes(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="text-muted-foreground">Calculated at checkout</dd>
            </div>
          </dl>
          {threshold > 0 && subtotal < threshold && (
            <p className="mt-4 rounded-2xl bg-secondary p-3 text-xs text-muted-foreground">
              Spend {formatKes(threshold - subtotal)} more for free delivery.
            </p>
          )}
          <a
            href="/checkout"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Proceed to checkout
          </a>
          <div className="mt-3 flex justify-between">
            <a href="/shop" className="text-sm font-semibold text-primary hover:underline">
              Continue shopping
            </a>
            <button
              type="button"
              onClick={clear}
              className="text-sm font-semibold text-muted-foreground hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clear cart
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
