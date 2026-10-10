import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { getAdminOrder } from "@/lib/admin";
import { formatPkr, formatPublicOrderNumber } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const items = order.order_items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Order</p>
          <h1 className="font-display text-3xl font-bold">
            {formatPublicOrderNumber(order.order_number)}
          </h1>
        </div>
        <Link href="/admin/orders" className="btn-secondary text-sm">
          All orders
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Items</h2>
          {items.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No line items on this order.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {items.map((item) => (
                <li key={item.id ?? `${item.product_slug}-${item.product_name}`} className="flex items-start justify-between gap-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{item.product_name}</p>
                    {item.variation_label && (
                      <p className="text-muted">{item.variation_label}</p>
                    )}
                    <p className="text-muted">
                      Qty {item.quantity} · {formatPkr(item.unit_price)} each
                    </p>
                  </div>
                  <p className="font-semibold">{formatPkr(item.line_total)}</p>
                </li>
              ))}
            </ul>
          )}
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatPkr(order.subtotal_before_discount)}</dd>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted">
                  Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}
                </dt>
                <dd>−{formatPkr(order.discount_amount)}</dd>
              </div>
            )}
            {order.cod_fee > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted">COD fee</dt>
                <dd>{formatPkr(order.cod_fee)}</dd>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPkr(order.total_price)}</dd>
            </div>
          </dl>
        </section>

        <section className="space-y-4 rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Customer</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-muted">Name</dt>
              <dd className="font-medium">{order.customer_name}</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="font-medium">{order.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Phone</dt>
              <dd className="font-medium">{order.phone}</dd>
            </div>
            <div>
              <dt className="text-muted">Address</dt>
              <dd className="font-medium">
                {order.address}
                <br />
                {order.city}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Payment</dt>
              <dd className="font-medium uppercase">{order.payment_method}</dd>
            </div>
            {order.attribution && Object.keys(order.attribution).length > 0 && (
              <div>
                <dt className="text-muted">Ad click</dt>
                <dd className="font-medium">
                  {Object.entries(order.attribution)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(" · ")}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-muted">Placed</dt>
              <dd className="font-medium">
                {new Date(order.created_at).toLocaleString("en-PK")}
              </dd>
            </div>
          </dl>
          <div>
            <p className="mb-2 text-sm text-muted">Status</p>
            <OrderStatusSelect orderId={order.id} status={order.status} />
          </div>
        </section>
      </div>
    </div>
  );
}
