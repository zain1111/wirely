import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { getAdminOrders } from "@/lib/admin";
import { formatPkr } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Orders</h1>
      {!orders.length ? (
        <p className="text-sm text-muted">
          No orders yet. Place a test order after connecting Supabase.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-background/70">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-semibold">
                    #{order.order_number}
                  </td>
                  <td className="px-4 py-3">
                    <p>{order.customer_name}</p>
                    <p className="text-xs text-muted">
                      {order.phone} · {order.city}
                    </p>
                  </td>
                  <td className="px-4 py-3">{formatPkr(order.total_price)}</td>
                  <td className="px-4 py-3 uppercase">{order.payment_method}</td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect
                      orderId={order.id}
                      status={order.status}
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {new Date(order.created_at).toLocaleString("en-PK")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
