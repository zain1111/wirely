export function CouponForm() {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-semibold">Coupons</h2>
      <p className="mt-2 text-sm text-muted">
        Static mode — coupons are disabled. Checkout uses WhatsApp confirmation
        without discount codes.
      </p>
    </div>
  );
}
