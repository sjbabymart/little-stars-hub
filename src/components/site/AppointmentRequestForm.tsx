import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarHeart } from "lucide-react";
import { siteContentQuery } from "@/lib/queries";

export function AppointmentRequestForm() {
  const { data } = useQuery(siteContentQuery);
  const wa = data?.contact.whatsapp ?? "254711706413";

  const [parentName, setParentName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (parentName.trim().length < 2) {
      setError("Please enter the parent or guardian name.");
      return;
    }
    if (!childAge.trim()) {
      setError("Please enter the child's age.");
      return;
    }
    setError(null);
    const text = `Hello Njau Children's Clinic, I would like to request an appointment.
Parent/Guardian: ${parentName.trim()}
Child's age: ${childAge.trim()}${note.trim() ? `\nNotes: ${note.trim()}` : ""}`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

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
        Share a few details and we&apos;ll continue on WhatsApp to confirm a time.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="parentName" className="text-sm font-semibold text-foreground">
            Parent / guardian name
          </label>
          <input
            id="parentName"
            name="parentName"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            required
            autoComplete="name"
            placeholder="e.g. Mary Njeri"
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="childAge" className="text-sm font-semibold text-foreground">
            Child&apos;s age
          </label>
          <input
            id="childAge"
            name="childAge"
            value={childAge}
            onChange={(e) => setChildAge(e.target.value)}
            required
            placeholder="e.g. 8 months"
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <label htmlFor="note" className="text-sm font-semibold text-foreground">
            What do you need help with? <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="note"
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. immunisation, general check-up, preferred day"
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-coral">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 text-sm font-bold text-leaf-foreground shadow-soft transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <CalendarHeart className="size-4" aria-hidden="true" />
        Send via WhatsApp
      </button>
    </form>
  );
}
