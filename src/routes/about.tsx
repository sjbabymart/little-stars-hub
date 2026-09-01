import { createFileRoute } from "@tanstack/react-router";
import { UnderConstruction } from "@/components/site/UnderConstruction";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | S & J Baby Mart & Njau Children's Clinic" },
      {
        name: "description",
        content:
          "Learn about S & J Baby Mart and Njau Children's Clinic in Nairobi — baby clothing, essentials and gentle paediatric care under one roof.",
      },
      { property: "og:title", content: "About S & J Baby Mart & Njau Children's Clinic" },
      {
        property: "og:description",
        content:
          "Our story: quality baby clothing and essentials plus caring paediatric services in Nairobi.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: () => (
    <UnderConstruction
      title="About us"
      description="We're putting our story together. In the meantime, reach us on WhatsApp or by phone and we'll gladly tell you more about the Baby Mart and the clinic."
    />
  ),
});
