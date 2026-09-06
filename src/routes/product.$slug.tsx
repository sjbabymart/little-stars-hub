import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, MessageCircle, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { productQuery, siteContentQuery } from "@/lib/queries";
import { formatKes } from "@/lib/format";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(productQuery(params.slug)),
  head: ({ loaderData, params }) => {
    const product = loaderData?.product;
    if (!product) {
      return {
        meta: [
          { title: "Product unavailable | S & J Baby Mart" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const description =
      product.description ?? `${product.name} available at S & J Baby Mart, Nairobi.`;
    return {
      meta: [
        { title: `${product.name} | S & J Baby Mart` },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: `${product.name} | S & J Baby Mart` },
        { property: "og:description", content: description.slice(0, 155) },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/product/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/product/${params.slug}` }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const { data } = useQuery(productQuery(slug));
  const { data: site } = useQuery(siteContentQuery);
  const { addItem } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => setActiveImg(0), [slug]);

  // Prefer loader-prefetched data so the page renders instantly on client
  // navigation (avoids a brief "Product not found" flash before the query loads).
  const product = data?.product ?? loaderData?.product ?? null;
  const related = data?.related ?? loaderData?.related ?? [];
  const wa = site?.contact.whatsapp ?? "254711706413";

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-primary">Product not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This item may have been removed or is out of stock.
        </p>
        <a
          href="/shop"
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Back to shop
        </a>
      </div>
    );
  }

  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : product.image_url
        ? [product.image_url]
        : [];
  const soldOut = product.stock <= 0;
  const discounted =
    product.compare_at_price_kes != null && product.compare_at_price_kes > product.price_kes;

  function onAdd() {
    if (!product) return;
    if (product.sizes.length > 0 && !size) {
      toast.error("Please choose a size first");
      return;
    }
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        priceKes: product.price_kes,
        imageUrl: product.image_url,
        size,
      },
      qty,
    );
    toast.success(`${product.name} added to cart`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <a href="/shop" className="hover:text-primary">
          Shop
        </a>
        <span aria-hidden="true"> / </span>
        <span className="text-primary">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-[2rem] border border-border bg-muted">
            {gallery[activeImg] ? (
              <img
                src={gallery[activeImg]}
                alt={product.name}
                className="aspect-4/5 size-full object-cover"
              />
            ) : (
              <div className="grid aspect-4/5 place-items-center text-sm text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`overflow-hidden rounded-xl border-2 ${
                    i === activeImg ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={src} alt="" className="size-16 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.category_name && (
            <span className="text-xs font-bold uppercase tracking-wider text-leaf">
              {product.category_name}
            </span>
          )}
          <h1 className="mt-2 font-display text-3xl text-primary md:text-4xl">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatKes(product.price_kes)}</span>
            {discounted && (
              <span className="text-lg text-muted-foreground line-through">
                {formatKes(product.compare_at_price_kes)}
              </span>
            )}
          </div>
          {product.description && (
            <p className="mt-5 text-base text-muted-foreground">{product.description}</p>
          )}

          {product.sizes.length > 0 && (
            <fieldset className="mt-7">
              <legend className="text-sm font-bold text-foreground">Choose a size</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      size === s
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-primary hover:bg-secondary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border bg-card">
              <button
                type="button"
                onClick={() => setQty((v) => Math.max(1, v - 1))}
                aria-label="Decrease quantity"
                className="px-4 py-2 text-lg font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                −
              </button>
              <span aria-live="polite" className="min-w-8 text-center text-sm font-bold">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((v) => Math.min(20, v + 1))}
                aria-label="Increase quantity"
                className="px-4 py-2 text-lg font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={onAdd}
              disabled={soldOut}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ShoppingBag className="size-4" aria-hidden="true" />
              {soldOut ? "Out of stock" : "Add to cart"}
            </button>
            <a
              href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hello S & J Baby Mart, I'm interested in ${product.name} (${formatKes(product.price_kes)}).`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 text-sm font-bold text-leaf-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <MessageCircle className="size-4" aria-hidden="true" /> Ask on WhatsApp
            </a>
          </div>

          <ul className="mt-7 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="size-4 text-leaf" aria-hidden="true" />
              {soldOut ? "Currently out of stock" : `${product.stock} in stock`}
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-leaf" aria-hidden="true" /> Delivery across Nairobi or
              pickup in store
            </li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl text-primary">You may also like</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
