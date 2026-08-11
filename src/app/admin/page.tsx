import { SalesChart } from "@/components/admin/SalesChart";
import { getAdminStats } from "@/lib/admin";
import { formatPkr } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        {stats.usingSeed && (
          <p className="mt-2 text-sm text-muted">
            Running on seed catalog — add Supabase credentials for live orders & analytics.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Products", value: String(stats.products) },
          { label: "Orders", value: String(stats.orders) },
          { label: "Revenue", value: formatPkr(stats.revenue) },
          { label: "Pending reviews", value: String(stats.pendingReviews) },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-border bg-card p-5"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 font-display text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display text-xl font-semibold">
          Revenue · last 30 days
        </h2>
        <SalesChart data={stats.salesSeries} />
      </div>
    </div>
  );
}
