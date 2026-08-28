import type { Product } from "@/lib/dto";
import { formatKes } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const discounted =
    product.compare_at_price_kes != null && product.compare_at_price_kes > product.price_kes;

  return (
    <a
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-4/5 overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        {discounted && (
          <span className="absolute left-3 top-3 rounded-full bg-coral px-3 py-1 text-xs font-bold text-coral-foreground">
            Sale
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-navy px-3 py-1 text-xs font-bold text-navy-foreground">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.category_name && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-leaf">
            {product.category_name}
          </span>
        )}
        <h3 className="font-display text-base leading-snug text-foreground">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-bold text-primary">{formatKes(product.price_kes)}</span>
          {discounted && (
            <span className="text-sm text-muted-foreground line-through">
              {formatKes(product.compare_at_price_kes)}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
