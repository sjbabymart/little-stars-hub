import { createFileRoute } from "@tanstack/react-router";
import { UnderConstruction } from "@/components/site/UnderConstruction";

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
  component: () => (
    <UnderConstruction
      title="Red Carpet gallery"
      description="Our children's fashion gallery is coming soon. Want your little star featured? Send us a message on WhatsApp — we only publish photos with parental consent."
    />
  ),
});
