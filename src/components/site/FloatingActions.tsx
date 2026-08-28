import { useQuery } from "@tanstack/react-query";
import { CalendarHeart, MessageCircle, Phone } from "lucide-react";
import { siteContentQuery } from "@/lib/queries";

export function FloatingActions() {
  const { data } = useQuery(siteContentQuery);
  const phone = data?.contact.phone ?? "+254711706413";
  const wa = data?.contact.whatsapp ?? "254711706413";

  const waLink = (text: string) => `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2.5">
      <a
        href={waLink(
          "Hello Njau Children's Clinic, I would like to book an appointment for my child.",
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 rounded-full bg-sunset px-4 py-3 text-sm font-bold text-sunset-foreground shadow-lift transition-transform hover:-translate-y-0.5"
      >
        <CalendarHeart className="size-5" />
        <span className="hidden sm:inline">Book appointment</span>
      </a>
      <a
        href={waLink("Hello S & J Baby Mart, I'd like to make an enquiry.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="inline-flex items-center gap-2 rounded-full bg-leaf px-4 py-3 text-sm font-bold text-leaf-foreground shadow-lift transition-transform hover:-translate-y-0.5"
      >
        <MessageCircle className="size-5" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>
      <a
        href={`tel:${phone}`}
        aria-label={`Call ${phone}`}
        className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-3 text-sm font-bold text-navy-foreground shadow-lift transition-transform hover:-translate-y-0.5"
      >
        <Phone className="size-5" />
        <span className="hidden sm:inline">Call us</span>
      </a>
    </div>
  );
}
