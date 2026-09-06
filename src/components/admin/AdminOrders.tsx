import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin.functions";
import { formatDateTime, formatKes } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  delivery_method: string;
  delivery_zone_name: string | null;
  total_kes: number;
  status: string;
  created_at: string;
  items: { id: string; product_name: string; size: string | null; quantity: number }[];
};

const selectClass = "h-9 rounded-md border border-input bg-background px-2 text-sm";

export function AdminOrders() {
  const qc = useQueryClient();
  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: () => adminListOrders() });
  const update = useMutation({
    mutationFn: (v: { id: string; status: (typeof orderStatuses)[number] }) =>
      adminUpdateOrderStatus({ data: v }),
    onSuccess: () => {
      toast.success("Order updated");
      void qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (orders.data ?? []) as unknown as OrderRow[];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-primary">Orders</h2>
        <p className="text-sm text-muted-foreground">{rows.length} orders</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Placed</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t align-top">
                <td className="p-3 font-medium">{o.order_number}</td>
                <td className="p-3">
                  {o.customer_name}
                  <div className="text-xs text-muted-foreground">{o.phone}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.delivery_method === "pickup"
                      ? "Store pickup"
                      : `Delivery · ${o.delivery_zone_name ?? "—"}`}
                  </div>
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {o.items.map((i) => (
                    <div key={i.id}>
                      {i.quantity}× {i.product_name}
                      {i.size ? ` (${i.size})` : ""}
                    </div>
                  ))}
                </td>
                <td className="p-3">{formatKes(o.total_kes)}</td>
                <td className="p-3 text-muted-foreground">{formatDateTime(o.created_at)}</td>
                <td className="p-3">
                  <select
                    aria-label={`Status for order ${o.order_number}`}
                    className={selectClass}
                    value={o.status}
                    onChange={(e) =>
                      update.mutate({
                        id: o.id,
                        status: e.target.value as (typeof orderStatuses)[number],
                      })
                    }
                  >
                    {orderStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-6 text-center text-muted-foreground" colSpan={6}>
                  {orders.isLoading ? "Loading…" : "No orders yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
