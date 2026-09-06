import { useQuery } from "@tanstack/react-query";
import { CalendarHeart, MessageCircle, Phone } from "lucide-react";
import { siteContentQuery } from "@/lib/queries";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function FloatingActions() {
  const { data } = useQuery(siteContentQuery);
  const phone = data?.contact.phone ?? "+254711706413";
  const wa = data?.contact.whatsapp ?? "254711706413";

  const waLink = (text: string) => `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;

  return (
    <nav
      aria-label="Quick contact actions"
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2.5"
    >
      <a
        href="/clinic#appointment"
        aria-label="Book an appointment"
        className={`group inline-flex items-center gap-2 rounded-full bg-sunset px-4 py-3 text-sm font-bold text-sunset-foreground shadow-lift transition-transform hover:-translate-y-0.5 ${focusRing}`}
      >
        <CalendarHeart className="size-5" aria-hidden="true" />
        <span className="hidden sm:inline">Book appointment</span>
      </a>
      <a
        href={waLink("Hello S & J Baby Mart, I'd like to make an enquiry.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className={`inline-flex items-center gap-2 rounded-full bg-leaf px-4 py-3 text-sm font-bold text-leaf-foreground shadow-lift transition-transform hover:-translate-y-0.5 ${focusRing}`}
      >
        <MessageCircle className="size-5" aria-hidden="true" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>
      <a
        href={`tel:${phone}`}
        aria-label={`Call us on ${phone}`}
        className={`inline-flex items-center gap-2 rounded-full bg-navy px-4 py-3 text-sm font-bold text-navy-foreground shadow-lift transition-transform hover:-translate-y-0.5 ${focusRing}`}
      >
        <Phone className="size-5" aria-hidden="true" />
        <span className="hidden sm:inline">Call us</span>
      </a>
    </nav>
  );
}
