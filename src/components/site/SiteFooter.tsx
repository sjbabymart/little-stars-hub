import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Logo } from "./Logo";
import { siteContentQuery } from "@/lib/queries";

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
          <div className="inline-flex rounded-2xl bg-card p-3">
            <Logo imgClassName="h-12 w-auto" />
          </div>
          <p className="mt-4 max-w-xs text-sm text-navy-foreground/75">
            Clothing, essentials and fashion for little ones — alongside gentle paediatric care at
            Njau Children&apos;s Clinic.
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg text-navy-foreground">Shop</h3>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/75">
            <li>
              <Link to="/shop" className="hover:text-accent">
                All products
              </Link>
            </li>
            <li>
              <Link to="/red-carpet" className="hover:text-accent">
                Red Carpet gallery
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-accent">
                Cart
              </Link>
            </li>
            <li>
              <Link to="/checkout" className="hover:text-accent">
                Checkout
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg text-navy-foreground">Clinic</h3>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/75">
            <li>
              <Link to="/clinic" className="hover:text-accent">
                Services &amp; appointments
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-accent">
                About us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-accent">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-accent">
                Staff sign in
              </Link>
            </li>
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
