import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Compass, Heart, Mail, MapPin, Phone, Target } from "lucide-react";
import storeInterior from "@/assets/store-interior.jpg";
import { siteContentQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | S & J Baby Mart & Njau Children's Clinic" },
      {
        name: "description",
        content:
          "Our mission, vision, store hours and Nairobi location — S & J Baby Mart for baby clothing and essentials, with Njau Children's Clinic for paediatric care.",
      },
      { property: "og:title", content: "About S & J Baby Mart & Njau Children's Clinic" },
      {
        property: "og:description",
        content:
          "Baby clothing, essentials and gentle paediatric care under one roof in Nairobi — read our mission, vision and visiting hours.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: site } = useQuery(siteContentQuery);
  const contact = site?.contact;
  const phone = contact?.phone ?? "+254711706413";
  const email = contact?.email ?? "info@sjclinic.co.ke";
  const address = contact?.address ?? "Nairobi, Kenya";
  const hours = contact?.hours ?? "Mon–Sat, 9:00am – 6:00pm";
  const clinicHours = site?.clinic.hours ?? "Mon–Fri 8:00am–5:00pm";

  return (
    <div>
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-leaf shadow-soft">
            <Heart className="size-3.5" aria-hidden="true" /> About us
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-tight text-primary md:text-5xl">
            Caring for children, supporting families
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            S &amp; J Baby Mart brings together quality baby clothing and essentials with the gentle
            paediatric care of Njau Children&apos;s Clinic — so families in Nairobi can shop and get
            trusted care in one place.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-2 lg:items-center">
        <div className="overflow-hidden rounded-[2rem] shadow-lift">
          <img
            src={storeInterior}
            alt="Inside the S & J Baby Mart store in Nairobi"
            className="size-full object-cover"
          />
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-secondary text-leaf">
              <Target className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-2xl text-primary">Our mission</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              To make quality baby clothing, essentials and trusted paediatric care easy to access
              for every family we serve — with honest pricing, warm service and advice parents can
              rely on.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-secondary text-sky">
              <Compass className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-2xl text-primary">Our vision</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              To be the family destination parents in Nairobi turn to first — where a child can be
              dressed, cared for and celebrated, from newborn days through the early years.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl">Visit our store</h2>
            <ul className="mt-6 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-bold">Physical store</p>
                  <p className="opacity-90">{address}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-5 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-bold">Store hours</p>
                  <p className="opacity-90">{hours}</p>
                  <p className="mt-1 opacity-90">Clinic hours: {clinicHours}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-5 text-accent" aria-hidden="true" />
                <a href={`tel:${phone}`} className="hover:text-accent">
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-5 text-accent" aria-hidden="true" />
                <a href={`mailto:${email}`} className="hover:text-accent">
                  {email}
                </a>
              </li>
            </ul>
          </div>
          <div className="rounded-[2rem] bg-white/5 p-8">
            <h2 className="font-display text-2xl">What we offer</h2>
            <ul className="mt-4 space-y-3 text-sm opacity-90">
              <li>Baby clothing, newborn essentials, footwear and accessories</li>
              <li>Delivery across Nairobi, or pick up your order in store</li>
              <li>Paediatric consultations, immunisation and growth checks at the clinic</li>
              <li>The Red Carpet gallery celebrating our little customers</li>
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/shop"
                className="inline-flex rounded-full bg-leaf px-5 py-2.5 text-sm font-bold text-leaf-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                Shop now
              </a>
              <a
                href="/clinic"
                className="inline-flex rounded-full border border-white/30 px-5 py-2.5 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                Visit the clinic
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
