import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { adminDeleteZone, adminListZones, adminSaveZone } from "@/lib/admin.functions";
import { formatKes } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

type Zone = {
  id: string;
  name: string;
  fee_kes: number;
  estimated_time: string | null;
  active: boolean;
  sort_order: number;
};

type FormState = {
  id?: string;
  name: string;
  fee: string;
  estimatedTime: string;
  sortOrder: string;
  active: boolean;
};

const emptyForm: FormState = {
  name: "",
  fee: "0",
  estimatedTime: "",
  sortOrder: "0",
  active: true,
};

export function AdminZones() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);

  const zones = useQuery({ queryKey: ["admin", "zones"], queryFn: () => adminListZones() });

  const save = useMutation({
    mutationFn: (f: FormState) =>
      adminSaveZone({
        data: {
          ...(f.id ? { id: f.id } : {}),
          name: f.name.trim(),
          feeKes: Number(f.fee) || 0,
          estimatedTime: f.estimatedTime.trim(),
          sortOrder: Number(f.sortOrder) || 0,
          active: f.active,
        },
      }),
    onSuccess: () => {
      toast.success("Delivery zone saved");
      setForm(null);
      void qc.invalidateQueries({ queryKey: ["admin", "zones"] });
      void qc.invalidateQueries({ queryKey: ["delivery-zones"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteZone({ data: { id } }),
    onSuccess: () => {
      toast.success("Zone deleted");
      void qc.invalidateQueries({ queryKey: ["admin", "zones"] });
      void qc.invalidateQueries({ queryKey: ["delivery-zones"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (zones.data ?? []) as Zone[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-primary">Delivery zones</h2>
          <p className="text-sm text-muted-foreground">
            Areas and fees shown at checkout. Free-delivery threshold lives in Settings.
          </p>
        </div>
        <Button onClick={() => setForm({ ...emptyForm })}>
          <Plus className="mr-2 h-4 w-4" /> Add zone
        </Button>
      </div>

      {form && (
        <form
          className="grid gap-4 rounded-2xl border bg-card p-6 shadow-sm md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(form);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="z-name">Zone name</Label>
            <Input
              id="z-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Westlands"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="z-fee">Delivery fee (KES)</Label>
            <Input
              id="z-fee"
              type="number"
              min="0"
              step="1"
              required
              value={form.fee}
              onChange={(e) => setForm({ ...form, fee: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="z-time">Estimated time</Label>
            <Input
              id="z-time"
              value={form.estimatedTime}
              onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })}
              placeholder="Same day"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="z-sort">Sort order</Label>
            <Input
              id="z-sort"
              type="number"
              min="0"
              step="1"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <Switch
              checked={form.active}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
            />
            Active at checkout
          </label>
          <div className="flex gap-3 md:col-span-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save zone"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setForm(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Zone</th>
              <th className="p-3">Fee</th>
              <th className="p-3">Estimated time</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((z) => (
              <tr key={z.id} className="border-t">
                <td className="p-3 font-medium">{z.name}</td>
                <td className="p-3">{formatKes(z.fee_kes)}</td>
                <td className="p-3 text-muted-foreground">{z.estimated_time ?? "—"}</td>
                <td className="p-3">
                  <Badge variant={z.active ? "default" : "secondary"}>
                    {z.active ? "Active" : "Hidden"}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Edit"
                    onClick={() =>
                      setForm({
                        id: z.id,
                        name: z.name,
                        fee: String(z.fee_kes),
                        estimatedTime: z.estimated_time ?? "",
                        sortOrder: String(z.sort_order),
                        active: z.active,
                      })
                    }
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Delete"
                    onClick={() => {
                      if (confirm(`Delete zone "${z.name}"?`)) remove.mutate(z.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-6 text-center text-muted-foreground" colSpan={5}>
                  {zones.isLoading ? "Loading…" : "No delivery zones yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
