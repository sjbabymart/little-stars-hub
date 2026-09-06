import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | S & J Baby Mart" },
      {
        name: "description",
        content:
          "How S & J Baby Mart and Njau Children's Clinic collect, use and protect your personal information in Nairobi, Kenya.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/privacy" },
      { name: "robots", content: "index" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This policy explains how S & J Baby Mart and Njau Children's Clinic handle the personal information you share with us."
      updated="6 September 2026"
    >
      <LegalSection heading="Information we collect">
        <p>
          We collect information you provide directly, such as your name, phone number, email
          address and delivery address when you place an order, request an appointment or contact
          us. We also collect basic order and appointment details needed to serve you.
        </p>
        <p>
          Like most websites, we may automatically receive technical information such as your
          browser type and the pages you visit, to help us keep the site working and improve it.
        </p>
      </LegalSection>

      <LegalSection heading="How we use your information">
        <p>We use your information to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Process and deliver your orders and handle payments.</li>
          <li>Confirm clinic appointments and provide healthcare services.</li>
          <li>Respond to your questions and follow up with you.</li>
          <li>Improve our products, services and website.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Sharing your information">
        <p>
          We do not sell your personal information. We only share it where necessary to fulfil your
          order or appointment — for example with delivery partners — or where required by law.
        </p>
      </LegalSection>

      <LegalSection heading="Children's information">
        <p>
          Appointment details about children (such as name and age) are collected with the consent
          of a parent or guardian and are used only to provide paediatric care. Red Carpet gallery
          photos are only published with explicit consent.
        </p>
      </LegalSection>

      <LegalSection heading="Data security & your rights">
        <p>
          We take reasonable steps to protect your information. You may request access to, correction
          of, or deletion of your personal information at any time by contacting us.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
