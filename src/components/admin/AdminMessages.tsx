import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminListMessages, adminMarkMessageRead } from "@/lib/admin.functions";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type MessageRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  read: boolean;
  created_at: string;
};

export function AdminMessages() {
  const qc = useQueryClient();
  const messages = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: () => adminListMessages(),
  });

  const toggleRead = useMutation({
    mutationFn: (v: { id: string; read: boolean }) => adminMarkMessageRead({ data: v }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "messages"] });
      void qc.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (messages.data ?? []) as unknown as MessageRow[];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-primary">Contact messages</h2>
        <p className="text-sm text-muted-foreground">{rows.length} messages</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
          {messages.isLoading ? "Loading…" : "No messages yet."}
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((m) => (
            <li
              key={m.id}
              className={`rounded-2xl border bg-card p-4 ${m.read ? "" : "border-leaf/60"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {m.name}
                    {!m.read && (
                      <Badge variant="default" className="ml-2">
                        New
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[m.phone, m.email].filter(Boolean).join(" · ") || "No contact details"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(m.created_at)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleRead.mutate({ id: m.id, read: !m.read })}
                >
                  {m.read ? "Mark unread" : "Mark read"}
                </Button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
