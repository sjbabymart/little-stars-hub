import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, Phone, ShoppingBag, X } from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { siteContentQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/red-carpet", label: "Red Carpet" },
  { to: "/clinic", label: "Clinic" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { data } = useQuery(siteContentQuery);
  const phone = data?.contact.phone ?? "+254711706413";
  const announcement = data?.shop.announcement;

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-xs">
          <p className="font-medium tracking-wide">
            {announcement || "Quality baby clothing & paediatric care — Nairobi, Kenya"}
          </p>
          <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 hover:text-accent">
            <Phone className="size-3.5" /> {phone}
          </a>
        </div>
      </div>

      <div className="border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
          <Logo imgClassName="h-16 w-auto md:h-20" />

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <a
                key={l.to}
                href={l.to}
                className="rounded-full px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/clinic"
              className="hidden rounded-full bg-leaf px-4 py-2 text-sm font-bold text-leaf-foreground shadow-soft transition-transform hover:-translate-y-0.5 md:inline-flex"
            >
              Book appointment
            </a>
            <a
              href="/cart"
              className="relative inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm font-semibold text-primary hover:bg-secondary"
            >
              <ShoppingBag className="size-4" />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-coral text-[11px] font-bold text-coral-foreground">
                  {count}
                </span>
              )}
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="inline-flex items-center rounded-full border border-border p-2 text-primary lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <div className={cn("lg:hidden", open ? "block" : "hidden")}>
          <nav className="mx-auto grid max-w-7xl gap-1 border-t border-border px-4 py-3">
            {links.map((l) => (
              <a
                key={l.to}
                href={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-foreground/80"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
