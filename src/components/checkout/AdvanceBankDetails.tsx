import { ADVANCE_BANK } from "@/lib/constants";

export function AdvanceBankDetails({
  orderId,
  className = "mt-3",
}: {
  orderId?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-background p-3 text-left text-sm text-foreground ${className}`}
    >
      <p>
        {orderId ? (
          <>
            Send the order total to this bank account and send a screenshot of
            the payment along with order ID{" "}
            <strong className="whitespace-nowrap">{orderId}</strong> on
            WhatsApp so we can confirm and dispatch your order.
          </>
        ) : (
          <>
            Send the order total to this bank account. After you place the
            order, send a screenshot of the payment along with your order ID
            on WhatsApp so we can confirm and dispatch your order.
          </>
        )}
      </p>
      <dl className="mt-3 space-y-2">
        <div>
          <dt className="text-muted">Bank</dt>
          <dd className="font-semibold">{ADVANCE_BANK.bank}</dd>
        </div>
        <div>
          <dt className="text-muted">Title</dt>
          <dd className="font-semibold">{ADVANCE_BANK.title}</dd>
        </div>
        <div>
          <dt className="text-muted">Account number</dt>
          <dd className="break-all font-semibold tracking-wide">
            {ADVANCE_BANK.accountNumber}
          </dd>
        </div>
      </dl>
    </div>
  );
}
