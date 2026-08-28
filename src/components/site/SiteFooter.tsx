import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import logoWhite from "@/assets/sj-logo-white.png.asset.json";
import { siteContentQuery } from "@/lib/queries";

const shopLinks = [
  { href: "/shop", label: "All products" },
  { href: "/red-carpet", label: "Red Carpet gallery" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
];

const clinicLinks = [
  { href: "/clinic", label: "Services & appointments" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
  { href: "/auth", label: "Staff sign in" },
];

export function SiteFooter() {
  const { data } = useQuery(siteContentQuery);
  const contact = data?.contact;
  const phone = contact?.phone ?? "+254711706413";
  const email = contact?.email ?? "info@sjclinic.co.ke";
  const address = contact?.address ?? "Nairobi, Kenya";
  const hours = contact?.hours ?? "Mon–Sat, 9:00am – 6:00pm";

  return (
    <footer className="mt-20 bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <a href="/" aria-label="S & J Baby Mart home" className="inline-flex">
            <img
              src={logoWhite.url}
              alt="S & J Baby Mart and Njau Children's Clinic logo"
              className="h-36 w-auto md:h-44"
            />
          </a>
          <p className="mt-4 max-w-xs text-sm text-navy-foreground/75">
            Clothing, essentials and fashion for little ones — alongside gentle paediatric care at
            Njau Children&apos;s Clinic.
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg text-navy-foreground">Shop</h3>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/75">
            {shopLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-accent">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg text-navy-foreground">Clinic</h3>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/75">
            {clinicLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-accent">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg text-navy-foreground">Get in touch</h3>
          <ul className="mt-4 space-y-3 text-sm text-navy-foreground/75">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 text-accent" />
              <a href={`tel:${phone}`} className="hover:text-accent">
                {phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 text-accent" />
              <a href={`mailto:${email}`} className="hover:text-accent">
                {email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 text-accent" />
              {address}
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 text-accent" />
              {hours}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-navy-foreground/60">
          © {new Date().getFullYear()} S &amp; J Baby Mart · Njau Children&apos;s Clinic. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
