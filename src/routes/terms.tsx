import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | S & J Baby Mart" },
      {
        name: "description",
        content:
          "The terms and conditions for using the S & J Baby Mart online store and Njau Children's Clinic services in Nairobi, Kenya.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/terms" },
      { name: "robots", content: "index" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro="These terms govern your use of the S & J Baby Mart website and online store, and the Njau Children's Clinic services."
      updated="6 September 2026"
    >
      <LegalSection heading="Use of this website">
        <p>
          By using this website you agree to these terms. You must be at least 18 years old, or be
          using the site under the supervision of a parent or guardian, to place an order or book an
          appointment.
        </p>
      </LegalSection>

      <LegalSection heading="Products & pricing">
        <p>
          We try to display products and prices accurately. Prices are shown in Kenyan Shillings
          (KSh) and may change without notice. We reserve the right to correct errors and to refuse
          or cancel an order where a product is listed incorrectly or is no longer available.
        </p>
      </LegalSection>

      <LegalSection heading="Orders & payments">
        <p>
          Orders are subject to availability and confirmation by our team. Payment options include
          payment on delivery or pickup, M-Pesa and WhatsApp arrangements. Our team may contact you
          to confirm your order and final prices before dispatch.
        </p>
      </LegalSection>

      <LegalSection heading="Delivery & pickup">
        <p>
          Delivery is currently available across Nairobi in the zones listed at checkout. Delivery
          fees and estimated times are shown before you place your order. Pickup from our store is
          free.
        </p>
      </LegalSection>

      <LegalSection heading="Clinic services">
        <p>
          Information on this website is provided for general guidance and is not a substitute for
          professional medical advice, diagnosis or treatment. Always consult a qualified health
          professional about your child's health.
        </p>
      </LegalSection>

      <LegalSection heading="Liability">
        <p>
          To the fullest extent permitted by law, S & J Baby Mart and Njau Children's Clinic are not
          liable for indirect or consequential loss arising from your use of this website or our
          services.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>These terms are governed by the laws of Kenya.</p>
      </LegalSection>
    </LegalPage>
  );
}
