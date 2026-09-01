import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, MessageCircle, Phone, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { catalogQuery, siteContentQuery } from "@/lib/queries";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Baby Clothing & Essentials | S & J Baby Mart Nairobi" },
      {
        name: "description",
        content:
          "Browse baby clothing, essentials and fashion categories at S & J Baby Mart, Nairobi. Order on WhatsApp — online checkout is coming soon.",
      },
      { property: "og:title", content: "Shop Baby Clothing & Essentials | S & J Baby Mart" },
      {
        property: "og:description",
        content:
          "Browse our baby clothing and essentials categories in Nairobi. Order today on WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { data: site } = useQuery(siteContentQuery);
  const { data: catalog } = useQuery(catalogQuery);
  const wa = site?.contact.whatsapp ?? "254711706413";
  const phone = site?.contact.phone ?? "+254711706413";
  const categories = catalog?.categories ?? [];
  const products = (catalog?.products ?? []).slice(0, 8);

  const waLink = `https://wa.me/${wa}?text=${encodeURIComponent("Hello S & J Baby Mart, I'd like to place an order.")}`;

  return (
    <div>
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-leaf shadow-soft">
            <ShoppingBag className="size-3.5" aria-hidden="true" /> The Baby Mart
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-tight text-primary md:text-5xl">
            Shop baby clothing, essentials &amp; fashion
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Carefully chosen pieces for newborns and growing little ones, right here in Nairobi.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div
          role="status"
          className="flex flex-col gap-4 rounded-3xl border border-sunset/40 bg-sunset/10 p-5 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-sunset" aria-hidden="true" />
            <div>
              <p className="font-display text-lg text-primary">Website still under construction</p>
              <p className="text-sm text-muted-foreground">
                Online checkout isn&apos;t ready yet. Send us the items you love on WhatsApp or call
                us and we&apos;ll take care of the order and delivery.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-2.5 text-sm font-bold text-leaf-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <MessageCircle className="size-4" aria-hidden="true" /> Order on WhatsApp
            </a>
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Phone className="size-4" aria-hidden="true" /> {phone}
            </a>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="font-display text-2xl text-primary md:text-3xl">Shop by category</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
              >
                <div className="aspect-16/9 bg-muted">
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt={c.name}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-primary">{c.name}</h3>
                  {c.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                  )}
                  <a
                    href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hello S & J Baby Mart, I'd like to see what's available in ${c.name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Enquire about {c.name}
                  </a>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground">Categories are being added soon.</p>
            )}
          </div>
        </section>

        {products.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl text-primary md:text-3xl">In store now</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
