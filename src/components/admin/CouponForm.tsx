export function CouponForm() {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-semibold">Coupons</h2>
      <p className="mt-2 text-sm text-muted">
        Coupons require Supabase. Configure database env vars to manage coupon
        codes from this panel.
      </p>
    </div>
  );
}
