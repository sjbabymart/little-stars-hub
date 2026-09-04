import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Trash2, X } from "lucide-react";
import {
  adminDeleteRedCarpet,
  adminListRedCarpet,
  adminSetRedCarpetStatus,
} from "@/lib/admin.functions";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Photo = {
  id: string;
  child_name: string;
  event_name: string | null;
  image_url: string | null;
  caption: string | null;
  status: string;
  created_at: string;
};

export function AdminRedCarpet() {
  const qc = useQueryClient();
  const photos = useQuery({
    queryKey: ["admin", "red-carpet"],
    queryFn: () => adminListRedCarpet(),
  });

  function refresh() {
    void qc.invalidateQueries({ queryKey: ["admin", "red-carpet"] });
    void qc.invalidateQueries({ queryKey: ["red-carpet"] });
  }

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: "pending" | "approved" | "rejected" }) =>
      adminSetRedCarpetStatus({ data: v }),
    onSuccess: () => {
      toast.success("Photo updated");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteRedCarpet({ data: { id } }),
    onSuccess: () => {
      toast.success("Photo deleted");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (photos.data ?? []) as unknown as Photo[];
  const pending = rows.filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-primary">Red Carpet submissions</h2>
        <p className="text-sm text-muted-foreground">
          {pending} awaiting review. Only approved photos with parental consent appear publicly.
        </p>
      </div>

      {rows.length === 0 && (
        <p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
          {photos.isLoading ? "Loading…" : "No submissions yet."}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            {p.image_url ? (
              <img
                src={p.image_url}
                alt={`Red Carpet submission for ${p.child_name}`}
                className="h-56 w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-56 items-center justify-center bg-muted text-sm text-muted-foreground">
                No image
              </div>
            )}
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium">{p.child_name}</h3>
                <Badge
                  variant={
                    p.status === "approved"
                      ? "default"
                      : p.status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {p.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {p.event_name ?? "—"} · {formatDate(p.created_at)}
              </p>
              {p.caption && <p className="text-sm">{p.caption}</p>}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  disabled={p.status === "approved"}
                  onClick={() => setStatus.mutate({ id: p.id, status: "approved" })}
                >
                  <Check className="mr-1 h-4 w-4" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={p.status === "rejected"}
                  onClick={() => setStatus.mutate({ id: p.id, status: "rejected" })}
                >
                  <X className="mr-1 h-4 w-4" /> Reject
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Delete photo"
                  onClick={() => {
                    if (confirm("Delete this photo permanently?")) remove.mutate(p.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
