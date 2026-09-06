import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { siteContentQuery } from "@/lib/queries";

export function LegalPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro: string;
  updated: string;
  children: ReactNode;
}) {
  const { data } = useQuery(siteContentQuery);
  const contact = data?.contact;
  const address = contact?.address ?? "Nairobi, Kenya";
  const phone = contact?.phone ?? "+254711706413";
  const email = contact?.email ?? "info@sjbaby.co.ke";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl text-primary md:text-4xl">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{intro}</p>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: {updated}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground">{children}</div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg text-primary">Questions?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Reach us at {address}. Call or WhatsApp {phone} or email {email}.
        </p>
      </div>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-primary">{heading}</h2>
      <div className="mt-3 space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}
