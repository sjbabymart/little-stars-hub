import { createFileRoute } from "@tanstack/react-router";
import { UnderConstruction } from "@/components/site/UnderConstruction";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | S & J Baby Mart, Nairobi" },
      {
        name: "description",
        content:
          "Contact S & J Baby Mart and Njau Children's Clinic in Nairobi. Call +254711706413 or email info@sjclinic.co.ke.",
      },
      { property: "og:title", content: "Contact S & J Baby Mart & Njau Children's Clinic" },
      {
        property: "og:description",
        content: "Reach us in Nairobi by phone, WhatsApp or email — we're happy to help.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: () => (
    <UnderConstruction
      title="Contact us"
      description="Our full contact page is on the way. For now, message us on WhatsApp, call us, or email info@sjclinic.co.ke."
    />
  ),
});
