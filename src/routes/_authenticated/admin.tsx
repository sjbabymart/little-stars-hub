import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAdminOverview, getMyRoles } from "@/lib/admin.functions";
import { formatKes } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminZones } from "@/components/admin/AdminZones";
import { AdminRedCarpet } from "@/components/admin/AdminRedCarpet";
import { AdminAppointments, AdminOrders } from "@/components/admin/AdminOrders";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | S & J Baby Mart" },
      {
        name: "description",
        content: "Manage products, delivery zones, orders and Red Carpet submissions.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "zones", label: "Delivery zones" },
  { id: "red-carpet", label: "Red Carpet" },
  { id: "orders", label: "Orders" },
  { id: "appointments", label: "Appointments" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("overview");
  const roles = useQuery({ queryKey: ["my-roles"], queryFn: () => getMyRoles() });
  const isAdmin = (roles.data ?? []).includes("admin");

  if (roles.isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-muted-foreground">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-primary">No admin access</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This account is signed in but has not been given manager access yet.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-primary">Management dashboard</h1>
          <p className="text-sm text-muted-foreground">
            S &amp; J Baby Mart &amp; Njau Children&apos;s Clinic
          </p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/" });
          }}
        >
          Sign out
        </Button>
      </div>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Dashboard sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "overview" && <Overview />}
        {tab === "products" && <AdminProducts />}
        {tab === "zones" && <AdminZones />}
        {tab === "red-carpet" && <AdminRedCarpet />}
        {tab === "orders" && <AdminOrders />}
        {tab === "appointments" && <AdminAppointments />}
      </div>
    </div>
  );
}

function Overview() {
  const overview = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => getAdminOverview(),
  });
  const c = overview.data?.counts;
  const cards = [
    { label: "Products", value: c?.products ?? 0 },
    { label: "Orders", value: c?.orders ?? 0 },
    { label: "Pending orders", value: c?.pendingOrders ?? 0 },
    { label: "Appointments", value: c?.appointments ?? 0 },
    { label: "Pending appointments", value: c?.pendingAppointments ?? 0 },
    { label: "Photos to review", value: c?.pendingRedCarpet ?? 0 },
    { label: "Unread messages", value: c?.unreadMessages ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 font-display text-3xl text-primary">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="font-display text-xl text-primary">Recent orders</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {(overview.data?.recentOrders ?? []).map((o) => (
            <li key={o.id} className="flex flex-wrap justify-between gap-2 border-b pb-2">
              <span className="font-medium">{o.order_number}</span>
              <span className="text-muted-foreground">{o.customer_name}</span>
              <span>{formatKes(o.total_kes)}</span>
              <span className="text-muted-foreground">{o.status}</span>
            </li>
          ))}
          {(overview.data?.recentOrders ?? []).length === 0 && (
            <li className="text-muted-foreground">
              {overview.isLoading ? "Loading…" : "No orders yet."}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
