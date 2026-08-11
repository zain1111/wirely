import { CouponForm } from "@/components/admin/CouponForm";
import { getAdminCoupons } from "@/lib/admin";

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Coupons</h1>
      <CouponForm />
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background/70">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-semibold">{c.code}</td>
                <td className="px-4 py-3">{c.type}</td>
                <td className="px-4 py-3">{c.value}</td>
                <td className="px-4 py-3">
                  {c.used_count}
                  {c.usage_limit != null ? ` / ${c.usage_limit}` : ""}
                </td>
                <td className="px-4 py-3">{c.is_active ? "Yes" : "No"}</td>
              </tr>
            ))}
            {!coupons.length && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-muted">
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
