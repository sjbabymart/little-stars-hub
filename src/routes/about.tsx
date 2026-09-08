import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Compass, Heart, Mail, MapPin, Phone, Sparkles, Target } from "lucide-react";
import storeInterior from "@/assets/store-interior.jpg";
import { siteContentQuery } from "@/lib/queries";
import { abs, OG_IMAGE } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | S & J Baby Mart & Njau Children's Clinic" },
      {
        name: "description",
        content:
          "The story of S & J Baby Mart and Njau Children's Clinic — a family-run baby store and paediatric clinic in Nairobi, Kenya.",
      },
      { property: "og:title", content: "About S & J Baby Mart & Njau Children's Clinic" },
      {
        property: "og:description",
        content:
          "A family-run baby and children's store alongside a gentle paediatric clinic — read our story, mission and visiting hours.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: abs("/about") },
      { property: "og:image", content: OG_IMAGE },
      {
        name: "twitter:title",
        content: "About S & J Baby Mart & Njau Children's Clinic",
      },
      {
        name: "twitter:description",
        content:
          "A family-run baby and children's store alongside a gentle paediatric clinic in Nairobi.",
      },
    ],
    links: [{ rel: "canonical", href: abs("/about") }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: site } = useQuery(siteContentQuery);
  const contact = site?.contact;
  const phone = contact?.phone ?? "+254711706413";
  const email = contact?.email ?? "info@sjbaby.co.ke";
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
            A family shop for little ones, built on care
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            S &amp; J Baby Mart and Njau Children&apos;s Clinic are two parts of one family promise —
            that every child in our community is dressed comfortably, cared for gently, and
            celebrated wholeheartedly.
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
        <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
          <h2 className="font-display text-3xl text-primary">Our story</h2>
          <p>
            S &amp; J Baby Mart began the way most family businesses do — at home, with a simple
            wish: that every child should be dressed comfortably, beautifully and affordably. What
            started as carefully picked outfits for our own little ones grew into a baby and
            children&apos;s store that parents across Nairobi now trust.
          </p>
          <p>
            Beside the shop, Njau Children&apos;s Clinic was born from the same belief — that caring
            for a child means caring for the whole family. From routine check-ups, immunisation and
            growth monitoring to advice when a little one is unwell, our clinic offers gentle,
            professional paediatric care.
          </p>
          <p>
            Today the two sit side by side, under one roof, so busy parents can shop for quality
            children&apos;s clothing and essentials and access trusted healthcare in a single visit.
            It&apos;s retail with heart, and healthcare with warmth.
          </p>
        </div>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-secondary text-leaf">
              <Target className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-2xl text-primary">Our mission</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              To make quality baby clothing, essentials and trusted paediatric care easy to reach
              for every family we serve — with honest pricing, warm service, and advice parents can
              rely on.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-secondary text-sky">
              <Compass className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-2xl text-primary">Our vision</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              To be the family destination Nairobi parents turn to first — where a child can be
              dressed, cared for and celebrated, from their very first days through the early years.
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
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                Baby clothing, newborn essentials, footwear and accessories
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                Delivery across Nairobi, or pick up your order in store
              </li>
              <li className="flex items-start gap-2">
                <Heart className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                Paediatric consultations, immunisation and growth checks at the clinic
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                The Red Carpet gallery celebrating our little customers
              </li>
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
