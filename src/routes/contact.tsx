import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { siteContentQuery } from "@/lib/queries";
import { sendContactMessage } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | S & J Baby Mart, Nairobi" },
      {
        name: "description",
        content:
          "Contact S & J Baby Mart and Njau Children's Clinic in Nairobi. Call +254711706413 or email info@sjbaby.co.ke.",
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
  component: ContactPage,
});

function ContactPage() {
  const { data: site } = useQuery(siteContentQuery);
  const contact = site?.contact;
  const phone = contact?.phone ?? "+254711706413";
  const email = contact?.email ?? "info@sjbaby.co.ke";
  const address = contact?.address ?? "Nairobi, Kenya";
  const hours = contact?.hours ?? "Mon–Sat, 9:00am – 6:00pm";
  const wa = contact?.whatsapp ?? "254711706413";

  const [name, setName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromPhone, setFromPhone] = useState("");
  const [message, setMessage] = useState("");

  const send = useMutation({
    mutationFn: () =>
      sendContactMessage({
        data: {
          name: name.trim(),
          email: fromEmail.trim(),
          phone: fromPhone.trim(),
          message: message.trim(),
        },
      }),
    onSuccess: () => {
      toast.success("Message sent. We'll get back to you soon.");
      setName("");
      setFromEmail("");
      setFromPhone("");
      setMessage("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send.mutate();
  }

  const field =
    "rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div>
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-leaf shadow-soft">
            <MessageCircle className="size-3.5" aria-hidden="true" /> Contact us
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-tight text-primary md:text-5xl">
            We&apos;d love to hear from you
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Questions about an order, a product or the clinic? Call, WhatsApp, email or send us a
            message below.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          {[
            { icon: MapPin, label: "Visit us", value: address },
            { icon: Phone, label: "Call us", value: phone, href: `tel:${phone}` },
            { icon: Mail, label: "Email us", value: email, href: `mailto:${email}` },
            { icon: Clock, label: "Opening hours", value: hours },
          ].map((row) => (
            <div key={row.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-secondary text-leaf">
                <row.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {row.label}
              </p>
              {row.href ? (
                <a href={row.href} className="mt-1 block text-sm font-semibold text-primary hover:text-leaf">
                  {row.value}
                </a>
              ) : (
                <p className="mt-1 text-sm font-semibold text-primary">{row.value}</p>
              )}
            </div>
          ))}

          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent("Hello S & J Baby Mart, I'd like to make an enquiry.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-leaf px-5 py-3 text-sm font-bold text-leaf-foreground shadow-soft"
          >
            <MessageCircle className="size-4" aria-hidden="true" /> Chat on WhatsApp
          </a>
        </div>

        <form onSubmit={onSubmit} className="rounded-[2rem] border border-border bg-card p-6 shadow-soft md:p-8">
          <h2 className="font-display text-2xl text-primary">Send us a message</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill in the form and our team will get back to you.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor="c-name" className="text-sm font-semibold">
                Your name
              </label>
              <input
                id="c-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Your full name"
                className={field}
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="c-phone" className="text-sm font-semibold">
                Phone <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="c-phone"
                value={fromPhone}
                onChange={(e) => setFromPhone(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
                placeholder="+2547…"
                className={field}
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <label htmlFor="c-email" className="text-sm font-semibold">
                Email <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="c-email"
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                className={field}
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <label htmlFor="c-message" className="text-sm font-semibold">
                Message
              </label>
              <textarea
                id="c-message"
                required
                minLength={5}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                className={field}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={send.isPending}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            <Send className="size-4" aria-hidden="true" />
            {send.isPending ? "Sending…" : "Send message"}
          </button>
        </form>
      </section>
    </div>
  );
}
