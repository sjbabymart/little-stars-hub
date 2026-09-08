import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Baby,
  Clock,
  HeartPulse,
  MapPin,
  MessageCircle,
  Phone,
  Stethoscope,
  Syringe,
} from "lucide-react";
import clinicInterior from "@/assets/clinic-interior.jpg";
import { AppointmentRequestForm } from "@/components/site/AppointmentRequestForm";
import { siteContentQuery } from "@/lib/queries";
import { abs, OG_IMAGE, SITE_URL } from "@/lib/seo";

const clinicMedicalLd = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: "Njau Children's Clinic",
  url: `${SITE_URL}/clinic`,
  image: OG_IMAGE,
  telephone: "+254711706413",
  email: "info@sjbaby.co.ke",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nairobi",
    addressRegion: "Nairobi County",
    addressCountry: "KE",
  },
  medicalSpecialty: "Pediatric",
  openingHours: "Mo-Fr 08:00-17:00",
  isAcceptingNewPatients: true,
};

const FALLBACK_SERVICES = [
  {
    icon: Stethoscope,
    title: "General paediatric consultation",
    body: "Assessment and treatment for common childhood illnesses and concerns.",
  },
  {
    icon: Syringe,
    title: "Immunisation",
    body: "Routine childhood vaccinations following the national schedule.",
  },
  {
    icon: Baby,
    title: "Growth & development checks",
    body: "Weight, height and milestone monitoring for babies and toddlers.",
  },
  {
    icon: HeartPulse,
    title: "Well-baby clinic",
    body: "Regular check-ups plus feeding and nutrition guidance for families.",
  },
];

export const Route = createFileRoute("/clinic")({
  head: () => ({
    meta: [
      { title: "Njau Children's Clinic | Paediatric Care in Nairobi" },
      {
        name: "description",
        content:
          "Njau Children's Clinic offers paediatric consultations, immunisation and growth checks in Nairobi. Request an appointment on WhatsApp: +254711706413.",
      },
      { property: "og:title", content: "Njau Children's Clinic | Paediatric Care in Nairobi" },
      {
        property: "og:description",
        content:
          "Gentle paediatric care for children in Nairobi — consultations, immunisation, growth and development checks.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: abs("/clinic") },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:title", content: "Njau Children's Clinic | Paediatric Care in Nairobi" },
      {
        name: "twitter:description",
        content: "Paediatric consultations, immunisation and growth checks in Nairobi — book an appointment.",
      },
      { "script:ld+json": clinicMedicalLd },
    ],
    links: [{ rel: "canonical", href: abs("/clinic") }],
  }),
  component: ClinicPage,
});

function ClinicPage() {
  const { data: site } = useQuery(siteContentQuery);
  const contact = site?.contact;
  const clinic = site?.clinic;
  const wa = contact?.whatsapp ?? "254711706413";
  const phone = contact?.phone ?? "+254711706413";
  const address = contact?.address ?? "Nairobi, Kenya";
  const hours = clinic?.hours ?? "Mon–Fri 8:00am–5:00pm";

  const bookLink = `https://wa.me/${wa}?text=${encodeURIComponent("Hello Njau Children's Clinic, I would like to book an appointment for my child.")}`;

  const dbServices = (clinic?.services ?? []) as unknown as Array<
    string | { name?: string; description?: string }
  >;
  const services = dbServices.length
    ? dbServices.map((s) => ({
        icon: Stethoscope,
        title: typeof s === "string" ? s : (s.name ?? "Service"),
        body: typeof s === "string" ? "" : (s.description ?? ""),
      }))
    : FALLBACK_SERVICES;

  return (
    <div>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
              <HeartPulse className="size-3.5" aria-hidden="true" /> Njau Children&apos;s Clinic
            </span>
            <h1 className="mt-5 font-display text-4xl leading-tight md:text-5xl">
              {clinic?.tagline ?? "Caring for children, supporting families"}
            </h1>
            <p className="mt-4 max-w-xl text-base opacity-90">
              Gentle, attentive paediatric care in Nairobi — from routine check-ups and
              immunisations to advice when your little one is unwell.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={bookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 text-sm font-bold text-leaf-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                <MessageCircle className="size-4" aria-hidden="true" /> Book on WhatsApp
              </a>
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                <Phone className="size-4" aria-hidden="true" /> {phone}
              </a>
            </div>
            <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <div>
                  <dt className="font-bold">Clinic hours</dt>
                  <dd className="opacity-90">{hours}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <div>
                  <dt className="font-bold">Location</dt>
                  <dd className="opacity-90">{address}</dd>
                </div>
              </div>
            </dl>
          </div>
          <div className="overflow-hidden rounded-[2rem] shadow-lift">
            <img
              src={clinicInterior}
              alt="Njau Children's Clinic consultation room"
              className="size-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-display text-3xl text-primary">Our services</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Care designed around children and the families who love them.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-secondary text-leaf">
                <s.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg text-primary">{s.title}</h3>
              {s.body && <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>}
            </div>
          ))}
        </div>
      </section>

      <section id="appointment" className="scroll-mt-24 bg-secondary">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <AppointmentRequestForm />
        </div>
      </section>
    </div>
  );
}
