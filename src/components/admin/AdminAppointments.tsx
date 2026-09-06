import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { adminListAppointments, adminUpdateAppointment } from "@/lib/admin.functions";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AppointmentRow = {
  id: string;
  parent_name: string;
  child_name: string;
  child_age: string | null;
  phone: string;
  service: string;
  preferred_date: string;
  preferred_time: string | null;
  confirmed_date: string | null;
  confirmed_time: string | null;
  status: string;
};

const statusLabel = (s: string) => s.replace(/_/g, " ");

function appointmentDate(a: AppointmentRow): string | null {
  return a.confirmed_date ?? a.preferred_date ?? null;
}

function ConfirmForm({
  a,
  busy,
  onConfirm,
}: {
  a: AppointmentRow;
  busy: boolean;
  onConfirm: (id: string, date: string, time: string) => void;
}) {
  const [date, setDate] = useState(a.preferred_date);
  const [time, setTime] = useState(a.preferred_time ?? "09:00");

  return (
    <div className="mt-3 flex flex-wrap items-end gap-3 rounded-xl bg-secondary/50 p-3">
      <div className="grid gap-1">
        <Label htmlFor={`c-date-${a.id}`} className="text-xs text-muted-foreground">
          Confirmed date
        </Label>
        <Input
          id={`c-date-${a.id}`}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-9 w-44 text-sm"
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor={`c-time-${a.id}`} className="text-xs text-muted-foreground">
          Confirmed time
        </Label>
        <Input
          id={`c-time-${a.id}`}
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="h-9 w-32 text-sm"
        />
      </div>
      <Button
        type="button"
        size="sm"
        disabled={busy || !date}
        onClick={() => onConfirm(a.id, date, time)}
      >
        {busy ? "Confirming…" : "Confirm"}
      </Button>
    </div>
  );
}

export function AdminAppointments() {
  const qc = useQueryClient();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const appts = useQuery({
    queryKey: ["admin", "appointments"],
    queryFn: () => adminListAppointments(),
  });

  const rows = (appts.data ?? []) as unknown as AppointmentRow[];

  const confirm = useMutation({
    mutationFn: (v: { id: string; date: string; time: string }) =>
      adminUpdateAppointment({
        data: { id: v.id, status: "confirmed", confirmedDate: v.date, confirmedTime: v.time },
      }),
    onSuccess: () => {
      toast.success("Appointment confirmed");
      void qc.invalidateQueries({ queryKey: ["admin", "appointments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: "pending" | "confirmed" | "completed" | "cancelled" }) =>
      adminUpdateAppointment({ data: v }),
    onSuccess: () => {
      toast.success("Appointment updated");
      void qc.invalidateQueries({ queryKey: ["admin", "appointments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const byDate = useMemo(() => {
    const map = new Map<string, AppointmentRow[]>();
    for (const a of rows) {
      const d = appointmentDate(a);
      if (!d) continue;
      const list = map.get(d) ?? [];
      list.push(a);
      map.set(d, list);
    }
    return map;
  }, [rows]);

  const pending = rows.filter((a) => a.status === "pending");
  const confirmed = rows
    .filter((a) => a.status === "confirmed" || a.status === "completed")
    .sort((a, b) => (appointmentDate(a) ?? "").localeCompare(appointmentDate(b) ?? ""));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-primary">Clinic appointments</h2>
          <p className="text-sm text-muted-foreground">
            {rows.length} requests · {pending.length} awaiting confirmation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label="Previous month"
            onClick={() => setMonth((m) => subMonths(m, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-36 text-center text-sm font-bold">{format(month, "MMMM yyyy")}</span>
          <Button
            variant="outline"
            size="sm"
            aria-label="Next month"
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-border">
        <div className="grid grid-cols-7 gap-px">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="bg-muted/60 px-2 py-2 text-center text-xs font-bold text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayAppts = byDate.get(key) ?? [];
            return (
              <div
                key={key}
                className={`min-h-24 bg-card p-1.5 ${isSameMonth(day, month) ? "" : "opacity-40"}`}
              >
                <span
                  className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday(day) ? "bg-primary text-primary-foreground" : "text-primary"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-1">
                  {dayAppts.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      title={`${a.parent_name} — ${a.service}`}
                      className="truncate rounded bg-secondary px-1.5 py-0.5 text-[10px] text-foreground"
                    >
                      {a.parent_name}
                      {a.confirmed_time ? ` · ${a.confirmed_time}` : ""}
                    </div>
                  ))}
                  {dayAppts.length > 3 && (
                    <div className="px-1 text-[10px] text-muted-foreground">
                      +{dayAppts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <section className="mt-8">
        <h3 className="font-display text-xl text-primary">
          Requests to confirm ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No pending requests.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pending.map((a) => (
              <li key={a.id} className="rounded-2xl border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {a.parent_name} · {a.child_name}
                      {a.child_age ? ` (${a.child_age})` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">{a.phone}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{a.service}</p>
                    <p className="text-xs text-muted-foreground">
                      Preferred: {formatDate(a.preferred_date)}
                      {a.preferred_time ? ` · ${a.preferred_time}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline">{statusLabel(a.status)}</Badge>
                </div>
                <ConfirmForm
                  a={a}
                  busy={confirm.isPending}
                  onConfirm={(id, date, time) => confirm.mutate({ id, date, time })}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {confirmed.length > 0 && (
        <section className="mt-8">
          <h3 className="font-display text-xl text-primary">Booked appointments</h3>
          <div className="mt-4 overflow-x-auto rounded-2xl border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3">Child</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">When</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {confirmed.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-3">
                      {a.child_name}
                      <div className="text-xs text-muted-foreground">{a.parent_name}</div>
                      <div className="text-xs text-muted-foreground">{a.phone}</div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{a.service}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {a.confirmed_date ? formatDate(a.confirmed_date) : formatDate(a.preferred_date)}
                      {a.confirmed_time ? ` · ${a.confirmed_time}` : ""}
                    </td>
                    <td className="p-3">
                      <select
                        aria-label={`Status for ${a.child_name}`}
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                        value={a.status}
                        onChange={(e) =>
                          setStatus.mutate({
                            id: a.id,
                            status: e.target.value as "confirmed" | "completed" | "cancelled",
                          })
                        }
                      >
                        {["confirmed", "completed", "cancelled"].map((s) => (
                          <option key={s} value={s}>
                            {statusLabel(s)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
