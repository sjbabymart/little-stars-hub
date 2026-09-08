import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingBag, Truck } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { catalogQuery, deliveryZonesQuery, siteContentQuery } from "@/lib/queries";
import { formatKes } from "@/lib/format";
import { abs, OG_IMAGE } from "@/lib/seo";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Baby Clothing & Essentials | S & J Baby Mart Nairobi" },
      {
        name: "description",
        content:
          "Shop baby clothing, essentials, footwear and accessories at S & J Baby Mart, Nairobi. Browse by category, add to cart and check out with delivery or pickup.",
      },
      { property: "og:title", content: "Shop Baby Clothing & Essentials | S & J Baby Mart" },
      {
        property: "og:description",
        content:
          "Baby clothing, essentials, footwear and accessories in Nairobi — order online with delivery or store pickup.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: abs("/shop") },
      { property: "og:image", content: OG_IMAGE },
      {
        name: "twitter:title",
        content: "Shop Baby Clothing & Essentials | S & J Baby Mart Nairobi",
      },
      {
        name: "twitter:description",
        content:
          "Baby clothing, essentials, footwear and accessories in Nairobi — order online with delivery or store pickup.",
      },
    ],
    links: [{ rel: "canonical", href: abs("/shop") }],
  }),
  component: ShopPage,
});

type SortKey = "newest" | "price-asc" | "price-desc" | "name";

function ShopPage() {
  const { data: catalog } = useQuery(catalogQuery);
  const { data: site } = useQuery(siteContentQuery);
  const { data: zones } = useQuery(deliveryZonesQuery);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const categories = catalog?.categories ?? [];
  const products = catalog?.products ?? [];
  const threshold = site?.shop.free_delivery_threshold ?? 0;

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = products.filter((p) => {
      const inCat = category === "all" || p.category_id === category;
      const match =
        !term ||
        p.name.toLowerCase().includes(term) ||
        (p.description ?? "").toLowerCase().includes(term) ||
        (p.category_name ?? "").toLowerCase().includes(term);
      return inCat && match;
    });
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price_kes - b.price_kes);
    if (sort === "price-desc") sorted.sort((a, b) => b.price_kes - a.price_kes);
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [products, q, category, sort]);

  return (
    <div>
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-leaf shadow-soft">
            <ShoppingBag className="size-3.5" aria-hidden="true" /> The Baby Mart
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-tight text-primary md:text-5xl">
            Shop baby clothing, essentials &amp; fashion
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Carefully chosen pieces for newborns and growing little ones, delivered across Nairobi.
          </p>
          {threshold > 0 && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-primary shadow-soft">
              <Truck className="size-4 text-leaf" aria-hidden="true" /> Free delivery on orders over{" "}
              {formatKes(threshold)}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Categories */}
        <section aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="font-display text-2xl text-primary md:text-3xl">
            Shop by category
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory("all")}
              aria-pressed={category === "all"}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                category === "all"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-primary hover:bg-secondary"
              }`}
            >
              All products
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                aria-pressed={category === c.id}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  category === c.id
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-primary hover:bg-secondary"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <input
              id="product-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-semibold text-muted-foreground">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>

        {/* Listing */}
        <section className="mt-8" aria-live="polite">
          <p className="text-sm text-muted-foreground">
            {visible.length} {visible.length === 1 ? "product" : "products"}
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {visible.length === 0 && (
            <p className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No products match your search. Try another category or keyword.
            </p>
          )}
        </section>

        {zones && zones.length > 0 && (
          <section className="mt-14 rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-xl text-primary">Delivery areas &amp; fees</h2>
            <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
              {zones.map((z) => (
                <li key={z.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary px-4 py-2.5">
                  <span className="font-semibold text-primary">{z.name}</span>
                  <span>
                    {formatKes(z.fee_kes)}
                    {z.estimated_time ? ` · ${z.estimated_time}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
