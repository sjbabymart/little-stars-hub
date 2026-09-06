import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarHeart, MessageCircle } from "lucide-react";
import { siteContentQuery } from "@/lib/queries";
import { requestAppointment } from "@/lib/clinic.functions";

const TIME_SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

const FALLBACK_SERVICES = [
  "General paediatric consultation",
  "Immunisation",
  "Growth & development check",
  "Well-baby clinic",
];

export function AppointmentRequestForm() {
  const { data } = useQuery(siteContentQuery);
  const wa = data?.contact.whatsapp ?? "254711706413";
  const clinicServices = data?.clinic.services ?? [];

  const services = clinicServices.length ? clinicServices : FALLBACK_SERVICES;

  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [service, setService] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [message, setMessage] = useState("");

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const send = useMutation({
    mutationFn: () =>
      requestAppointment({
        data: {
          parentName: parentName.trim(),
          phone: phone.trim(),
          childName: childName.trim(),
          childAge: childAge.trim(),
          service,
          preferredDate,
          preferredTime,
          message: message.trim(),
        },
      }),
    onSuccess: () => {
      toast.success("Appointment request sent. The clinic will confirm your date and time.");
      setParentName("");
      setPhone("");
      setChildName("");
      setChildAge("");
      setService("");
      setPreferredDate("");
      setPreferredTime("");
      setMessage("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!service) {
      toast.error("Please choose a service");
      return;
    }
    send.mutate();
  }

  const field =
    "rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[2rem] border border-border bg-card p-6 shadow-soft md:p-8"
      aria-labelledby="request-appointment-heading"
    >
      <h2 id="request-appointment-heading" className="font-display text-2xl text-primary">
        Request an appointment
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell us a few details and pick a preferred day. Our team will confirm your exact date and
        time.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="parentName" className="text-sm font-semibold text-foreground">
            Parent / guardian name
          </label>
          <input
            id="parentName"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            required
            autoComplete="name"
            placeholder="e.g. Mary Njeri"
            className={field}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="apptPhone" className="text-sm font-semibold text-foreground">
            Phone number
          </label>
          <input
            id="apptPhone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="+2547…"
            className={field}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="childName" className="text-sm font-semibold text-foreground">
            Child&apos;s name
          </label>
          <input
            id="childName"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            required
            placeholder="e.g. Liam"
            className={field}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="childAge" className="text-sm font-semibold text-foreground">
            Child&apos;s age
          </label>
          <input
            id="childAge"
            value={childAge}
            onChange={(e) => setChildAge(e.target.value)}
            required
            placeholder="e.g. 8 months"
            className={field}
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <label htmlFor="service" className="text-sm font-semibold text-foreground">
            Service
          </label>
          <select
            id="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            required
            className={field}
          >
            <option value="">Choose a service…</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="preferredDate" className="text-sm font-semibold text-foreground">
            Preferred date
          </label>
          <input
            id="preferredDate"
            type="date"
            min={today}
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            required
            className={field}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="preferredTime" className="text-sm font-semibold text-foreground">
            Preferred time
          </label>
          <select
            id="preferredTime"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className={field}
          >
            <option value="">Any time</option>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <label htmlFor="apptMessage" className="text-sm font-semibold text-foreground">
            Anything we should know? <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="apptMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="e.g. symptoms, preferred doctor, special needs"
            className={field}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={send.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 text-sm font-bold text-leaf-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <CalendarHeart className="size-4" aria-hidden="true" />
          {send.isPending ? "Sending…" : "Request appointment"}
        </button>
        <a
          href={`https://wa.me/${wa}?text=${encodeURIComponent("Hello Njau Children's Clinic, I would like to request an appointment.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-primary hover:bg-secondary"
        >
          <MessageCircle className="size-4" aria-hidden="true" /> Or use WhatsApp
        </a>
      </div>
    </form>
  );
}
