import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Camera, MessageCircle } from "lucide-react";
import { redCarpetQuery, siteContentQuery } from "@/lib/queries";

export const Route = createFileRoute("/red-carpet")({
  head: () => ({
    meta: [
      { title: "Red Carpet Kids Gallery | S & J Baby Mart" },
      {
        name: "description",
        content:
          "The Red Carpet gallery celebrates children's fashion moments from S & J Baby Mart, Nairobi — shared only with parental consent.",
      },
      { property: "og:title", content: "Red Carpet Kids Gallery | S & J Baby Mart" },
      {
        property: "og:description",
        content: "Little stars in their best looks — our consent-based children's fashion gallery.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/red-carpet" },
    ],
    links: [{ rel: "canonical", href: "/red-carpet" }],
  }),
  component: RedCarpetPage,
});

function RedCarpetPage() {
  const { data: images } = useQuery(redCarpetQuery);
  const { data: site } = useQuery(siteContentQuery);
  const wa = site?.contact.whatsapp ?? "254711706413";

  const photos = images ?? [];

  return (
    <div>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
            <Camera className="size-3.5" aria-hidden="true" /> Red Carpet gallery
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-tight md:text-5xl">
            Little stars, big moments
          </h1>
          <p className="mt-4 max-w-2xl text-base opacity-90">
            A celebration of our little customers in their best looks — shared only with parental
            consent. Want your child featured? Send us their photo on WhatsApp.
          </p>
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent("Hello S & J Baby Mart, I'd like to submit a Red Carpet photo of my child.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 text-sm font-bold text-leaf-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            <MessageCircle className="size-4" aria-hidden="true" /> Submit a photo
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        {photos.length === 0 ? (
          <div className="mx-auto max-w-md rounded-[2rem] border border-border bg-card p-10 text-center">
            <Camera className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 font-display text-xl text-primary">No photos yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The gallery is being prepared. Check back soon, or send us your little star&apos;s
              photo on WhatsApp to be featured.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {photos.map((p) => (
              <figure
                key={p.id}
                className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft"
              >
                <div className="overflow-hidden bg-muted">
                  <img
                    src={p.image_url}
                    alt={`${p.child_name} — ${p.event_name ?? "Red Carpet"}`}
                    className="aspect-4/5 size-full object-cover"
                  />
                </div>
                <figcaption className="p-4">
                  <p className="font-display text-lg text-primary">{p.child_name}</p>
                  {p.event_name && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-leaf">
                      {p.event_name}
                    </p>
                  )}
                  {p.caption && (
                    <p className="mt-2 text-sm text-muted-foreground">{p.caption}</p>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
