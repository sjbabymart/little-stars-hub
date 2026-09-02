import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, MessageCircle } from "lucide-react";
import type { OrderDto } from "@/lib/dto";
import { formatKes } from "@/lib/format";
import { siteContentQuery } from "@/lib/queries";

export const Route = createFileRoute("/order-confirmed")({
  head: () => ({
    meta: [
      { title: "Order Confirmed | S & J Baby Mart" },
      {
        name: "description",
        content:
          "Thank you for your order at S & J Baby Mart. Our team will call you to confirm delivery or pickup.",
      },
      { property: "og:title", content: "Order Confirmed | S & J Baby Mart" },
      { property: "og:description", content: "Thank you for shopping with S & J Baby Mart." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/order-confirmed" }],
  }),
  component: OrderConfirmedPage,
});

function OrderConfirmedPage() {
  const [order, setOrder] = useState<OrderDto | null>(null);
  const { data: site } = useQuery(siteContentQuery);
  const wa = site?.contact.whatsapp ?? "254711706413";

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("sjm-last-order");
      if (raw) setOrder(JSON.parse(raw) as OrderDto);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-[2rem] border border-border bg-card p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto size-12 text-leaf" aria-hidden="true" />
        <h1 className="mt-4 font-display text-3xl text-primary">Thank you for your order!</h1>
        {order ? (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Your order number is{" "}
              <span className="font-bold text-primary">{order.order_number}</span>. We&apos;ll call{" "}
              {order.phone} shortly to confirm{" "}
              {order.delivery_method === "delivery" ? "delivery" : "pickup"}.
            </p>
            <dl className="mx-auto mt-8 max-w-md space-y-2 text-left text-sm">
              {(order.items ?? []).map((i) => (
                <div key={`${i.product_id}-${i.size ?? ""}`} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">
                    {i.product_name}
                    {i.size ? ` · ${i.size}` : ""} × {i.quantity}
                  </dt>
                  <dd className="font-semibold text-primary">
                    {formatKes(i.unit_price_kes * i.quantity)}
                  </dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-2">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="font-semibold text-primary">
                  {formatKes(order.delivery_fee_kes)}
                </dd>
              </div>
              <div className="flex justify-between text-base">
                <dt className="font-bold text-primary">Total</dt>
                <dd className="font-bold text-primary">{formatKes(order.total_kes)}</dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Your order has been received. Our team will be in touch to confirm the details.
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="/shop"
            className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Continue shopping
          </a>
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hello S & J Baby Mart, I've just placed order ${order?.order_number ?? ""}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-2.5 text-sm font-bold text-leaf-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <MessageCircle className="size-4" aria-hidden="true" /> Message us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
