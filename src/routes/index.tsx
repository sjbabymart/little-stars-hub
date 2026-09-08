import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  CalendarHeart,
  HeartPulse,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Truck,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import shopCard from "@/assets/card-shop.jpg";
import clinicCard from "@/assets/card-clinic.jpg";
import storeInterior from "@/assets/store-interior.jpg";
import { ProductCard } from "@/components/site/ProductCard";
import { catalogQuery, siteContentQuery } from "@/lib/queries";
import { abs, OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

const homeOrganizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: "Njau Children's Clinic",
  url: SITE_URL,
  logo: OG_IMAGE,
  image: OG_IMAGE,
  telephone: "+254711706413",
  email: "info@sjbaby.co.ke",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nairobi",
    addressRegion: "Nairobi County",
    addressCountry: "KE",
  },
  areaServed: "Nairobi",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+254711706413",
    contactType: "customer service",
    availableLanguage: ["en", "sw"],
  },
};

const homeWebSiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "Njau Children's Clinic",
  url: SITE_URL,
  inLanguage: "en",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE_NAME} — Baby & Kids' Clothing, Nairobi | Njau Children's Clinic` },
      {
        name: "description",
        content:
          "Shop quality baby & kids' clothing, essentials and fashion in Nairobi at S & J Baby Mart — plus gentle paediatric care at Njau Children's Clinic. Call +254711706413.",
      },
      {
        property: "og:title",
        content: `${SITE_NAME} — Baby & Kids' Clothing, Nairobi | Paediatric Clinic`,
      },
      {
        property: "og:description",
        content:
          "Shop baby & kids' clothing and essentials in Nairobi and book gentle paediatric appointments at Njau Children's Clinic.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: abs("/") },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:title", content: `${SITE_NAME} — Baby & Kids' Clothing in Nairobi` },
      {
        name: "twitter:description",
        content: "Baby clothing store & paediatric clinic in Nairobi, Kenya. Shop online or call +254711706413.",
      },
      { "script:ld+json": homeOrganizationLd },
      { "script:ld+json": homeWebSiteLd },
    ],
    links: [{ rel: "canonical", href: abs("/") }],
  }),
  component: Index,
});

function Index() {
  const { data: site } = useQuery(siteContentQuery);
  const { data: catalog } = useQuery(catalogQuery);

  const phone = site?.contact.phone ?? "+254711706413";
  const email = site?.contact.email ?? "info@sjbaby.co.ke";
  const address = site?.contact.address ?? "Nairobi, Kenya";
  const wa = site?.contact.whatsapp ?? "254711706413";
  const waLink = `https://wa.me/${wa}?text=${encodeURIComponent("Hello S & J Baby Mart, I'd like to make an enquiry.")}`;

  const homeImages = site?.homeImages;
  const hero = homeImages?.hero || heroImg;
  const shopCardImage = homeImages?.shopCard || shopCard;
  const clinicCardImage = homeImages?.clinicCard || clinicCard;
  const storeInteriorImage = homeImages?.storeInterior || storeInterior;

  const featured = (catalog?.products ?? []).filter((p) => p.featured).slice(0, 4);
  const products = (featured.length ? featured : (catalog?.products ?? [])).slice(0, 4);
  const categories = (catalog?.categories ?? []).slice(0, 5);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-leaf shadow-soft">
              <Sparkles className="size-3.5" /> Clothing · Essentials · Fashion
            </span>
            <h1 className="mt-5 font-display text-4xl leading-tight text-primary md:text-6xl">
              Everything your little one needs — under one roof.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              S &amp; J Baby Mart brings you carefully chosen baby clothing and essentials, while
              Njau Children&apos;s Clinic offers gentle, professional paediatric care for your
              family in {address}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
              >
                Shop the collection <ArrowRight className="size-4" />
              </a>
              <a
                href={`https://wa.me/${wa}?text=${encodeURIComponent("Hello Njau Children's Clinic, I would like to book an appointment.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 text-sm font-bold text-leaf-foreground shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <CalendarHeart className="size-4" /> Book an appointment
              </a>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 text-sm">
              {[
                { k: "Curated", v: "Baby fashion" },
                { k: "Trusted", v: "Paediatric care" },
                { k: "Nairobi", v: "Fast delivery" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl bg-card p-4 shadow-soft">
                  <dt className="font-display text-lg text-primary">{s.k}</dt>
                  <dd className="text-xs text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <img
              src={hero}
              alt="Baby clothing and essentials at S & J Baby Mart in Nairobi"
              className="w-full rounded-[2rem] object-cover shadow-lift"
            />
            <div className="absolute -bottom-5 left-5 hidden items-center gap-3 rounded-2xl bg-card p-4 shadow-lift sm:flex">
              <HeartPulse className="size-8 text-coral" />
              <div>
                <p className="font-display text-sm text-primary">Njau Children&apos;s Clinic</p>
                <p className="text-xs text-muted-foreground">
                  Caring for children, supporting families
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value strip */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BadgeCheck, t: "Quality first", d: "Soft, skin-friendly fabrics only" },
            { icon: Truck, t: "Nairobi delivery", d: "Zone-based fees at checkout" },
            { icon: Stethoscope, t: "Clinic on site", d: "Paediatric consultations" },
            { icon: ShieldCheck, t: "Safe ordering", d: "WhatsApp or online checkout" },
          ].map((f) => (
            <div key={f.t} className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
                <f.icon className="size-5" />
              </span>
              <div>
                <p className="font-display text-base text-primary">{f.t}</p>
                <p className="text-sm text-muted-foreground">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two worlds */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="group relative overflow-hidden rounded-[2rem] shadow-soft">
            <img
              src={shopCardImage}
              alt="Baby clothing rack at S & J Baby Mart"
              className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/85 to-navy/10 p-7 text-navy-foreground">
              <div className="flex h-full flex-col justify-end">
                <h2 className="font-display text-2xl md:text-3xl">The Baby Mart</h2>
                <p className="mt-2 max-w-sm text-sm text-navy-foreground/80">
                  Clothing, essentials and standout fashion pieces for newborns to toddlers.
                </p>
                <a
                  href="/shop"
                  className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-card px-5 py-2.5 text-sm font-bold text-primary"
                >
                  Browse shop <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </article>

          <article className="group relative overflow-hidden rounded-[2rem] shadow-soft">
            <img
              src={clinicCardImage}
              alt="Njau Children's Clinic consultation room"
              className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-leaf/90 to-leaf/10 p-7 text-leaf-foreground">
              <div className="flex h-full flex-col justify-end">
                <h2 className="font-display text-2xl md:text-3xl">Njau Children&apos;s Clinic</h2>
                <p className="mt-2 max-w-sm text-sm text-leaf-foreground/85">
                  Check-ups, immunisation guidance and gentle care — caring for children, supporting
                  families.
                </p>
                <a
                  href="/clinic"
                  className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-card px-5 py-2.5 text-sm font-bold text-leaf"
                >
                  Clinic &amp; appointments <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-4">
          <h2 className="font-display text-2xl text-primary md:text-3xl">Shop by category</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((c) => (
              <a
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
              >
                {c.name}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-primary md:text-3xl">Fresh picks</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A small taste of what&apos;s waiting in store.
            </p>
          </div>
          <a href="/shop" className="text-sm font-bold text-leaf hover:underline">
            View all
          </a>
        </div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.length > 0
            ? products.map((p) => <ProductCard key={p.id} product={p} />)
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-3xl bg-muted" />
              ))}
        </div>
      </section>

      {/* Red carpet teaser */}
      <section className="bg-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
          <img
            src={storeInteriorImage}
            alt="Children's fashion display in store"
            className="rounded-[2rem] object-cover shadow-soft"
          />
          <div>
            <span className="inline-flex rounded-full bg-coral px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-coral-foreground">
              Red Carpet
            </span>
            <h2 className="mt-4 font-display text-3xl text-primary md:text-4xl">
              Your little star, on our Red Carpet.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Share a photo of your child in their S &amp; J outfit. With your consent, we feature
              approved photos in our public gallery — always parent-approved, never automatic.
            </p>
            <a
              href="/red-carpet"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
            >
              See the gallery <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-[2rem] bg-navy p-8 text-navy-foreground md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="font-display text-3xl md:text-4xl">Talk to us today</h2>
              <p className="mt-3 max-w-lg text-navy-foreground/80">
                Questions about a product, delivery or a clinic visit? We&apos;re a message away.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-3 text-sm font-bold text-leaf-foreground"
                >
                  <MessageCircle className="size-4" /> WhatsApp us
                </a>
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 rounded-full bg-card px-5 py-3 text-sm font-bold text-primary"
                >
                  <Phone className="size-4" /> {phone}
                </a>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-navy-foreground/85">
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-accent" /> {phone}
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="size-4 text-accent" />
                <a href={`mailto:${email}`} className="hover:text-accent">
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-accent" /> {address}
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
