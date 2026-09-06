import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/site/LegalPage";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Exchanges | S & J Baby Mart" },
      {
        name: "description",
        content:
          "How to return or exchange items purchased from S & J Baby Mart in Nairobi — eligibility, timeframe and the process.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/returns" },
      { name: "robots", content: "index" },
    ],
    links: [{ rel: "canonical", href: "/returns" }],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <LegalPage
      title="Returns & Exchanges"
      intro="We want you to be happy with your purchase. This policy explains how to return or exchange an item from S & J Baby Mart."
      updated="6 September 2026"
    >
      <LegalSection heading="Eligibility">
        <p>
          You may return or exchange an item within 7 days of delivery or pickup if it is unused,
          unworn, unwashed and in its original condition with tags attached. For hygiene reasons,
          certain items such as opened baby essentials and accessories may be non-returnable.
        </p>
      </LegalSection>

      <LegalSection heading="How to return or exchange">
        <p>
          Contact us by phone or WhatsApp within 7 days of receiving your order, quoting your order
          number. We will guide you on the next steps. Please keep proof of purchase.
        </p>
      </LegalSection>

      <LegalSection heading="Faulty or incorrect items">
        <p>
          If you receive a faulty, damaged or incorrect item, contact us immediately and we will
          arrange a replacement or refund, including any delivery costs you reasonably incur.
        </p>
      </LegalSection>

      <LegalSection heading="Refunds">
        <p>
          Approved refunds are processed to your original payment method where applicable, or
          arranged with you directly. Refunds may take a few working days to reflect depending on
          your payment provider.
        </p>
      </LegalSection>

      <LegalSection heading="Exchanges">
        <p>
          If you need a different size or colour, we will exchange the item subject to availability.
          Any price difference will be settled between us.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
