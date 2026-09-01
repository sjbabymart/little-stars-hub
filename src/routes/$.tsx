import { createFileRoute } from "@tanstack/react-router";
import { UnderConstruction } from "@/components/site/UnderConstruction";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Page not found | S & J Baby Mart & Njau Children's Clinic" },
      {
        name: "description",
        content:
          "This page isn't ready yet. Contact S & J Baby Mart and Njau Children's Clinic in Nairobi on +254711706413.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Page not found | S & J Baby Mart" },
      {
        property: "og:description",
        content: "This part of our website is still under construction.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => (
    <UnderConstruction
      title="This page isn't ready yet"
      description="We're still building this part of the S & J Baby Mart and Njau Children's Clinic website. In the meantime, talk to us directly on WhatsApp or by phone."
    />
  ),
});
