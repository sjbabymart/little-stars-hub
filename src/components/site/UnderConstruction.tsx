import { MessageCircle, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { siteContentQuery } from "@/lib/queries";

export function UnderConstruction({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { data } = useQuery(siteContentQuery);
  const phone = data?.contact.phone ?? "+254711706413";
  const wa = data?.contact.whatsapp ?? "254711706413";

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="inline-flex rounded-full bg-sunset px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sunset-foreground">
        Website still under construction
      </span>
      <h1 className="mt-5 font-display text-4xl text-primary md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-xl text-base text-muted-foreground">{description}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-2.5 text-sm font-bold text-leaf-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp us
        </a>
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Phone className="size-4" aria-hidden="true" /> {phone}
        </a>
      </div>
    </section>
  );
}
