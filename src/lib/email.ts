import { SITE_NAME, SITE_URL } from "./constants";
import { formatPkr } from "./utils";

type OrderEmailPayload = {
  orderNumber: number | string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: "advance" | "cod";
  codFee: number;
  discount: number;
  subtotal: number;
  total: number;
  couponCode?: string | null;
  items: {
    product_name: string;
    variation_label?: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
};

function itemsHtml(items: OrderEmailPayload["items"]): string {
  return items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb">
            ${i.product_name}${i.variation_label ? ` (${i.variation_label})` : ""}
            × ${i.quantity}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right">
            ${formatPkr(i.line_total)}
          </td>
        </tr>`,
    )
    .join("");
}

export function buildCustomerOrderEmail(order: OrderEmailPayload): {
  subject: string;
  html: string;
} {
  const payNote =
    order.paymentMethod === "cod"
      ? `Cash on Delivery (+ ${formatPkr(order.codFee)} fee). Please keep the exact amount ready.`
      : "Advance payment — our team will share JazzCash/EasyPaisa/bank details on WhatsApp shortly.";

  return {
    subject: `${SITE_NAME} order #${order.orderNumber} confirmed`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
        <h1 style="font-size:22px;margin-bottom:8px">Thanks, ${order.customerName}!</h1>
        <p>Your order <strong>#${order.orderNumber}</strong> is confirmed.</p>
        <p>${payNote}</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          ${itemsHtml(order.items)}
        </table>
        <p>Subtotal: ${formatPkr(order.subtotal)}</p>
        ${order.discount ? `<p>Discount${order.couponCode ? ` (${order.couponCode})` : ""}: −${formatPkr(order.discount)}</p>` : ""}
        ${order.codFee ? `<p>COD fee: ${formatPkr(order.codFee)}</p>` : ""}
        <p style="font-size:18px"><strong>Total: ${formatPkr(order.total)}</strong></p>
        <p>Ship to: ${order.address}, ${order.city}<br/>Phone: ${order.phone}</p>
        <p><a href="${SITE_URL}">Continue shopping at ${SITE_NAME}</a></p>
      </div>
    `,
  };
}

export function buildAdminOrderEmail(order: OrderEmailPayload): {
  subject: string;
  html: string;
} {
  return {
    subject: `New ${SITE_NAME} order #${order.orderNumber} — ${formatPkr(order.total)}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto">
        <h1>New order #${order.orderNumber}</h1>
        <p><strong>${order.customerName}</strong> · ${order.email} · ${order.phone}</p>
        <p>${order.address}, ${order.city}</p>
        <p>Payment: ${order.paymentMethod.toUpperCase()}</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          ${itemsHtml(order.items)}
        </table>
        <p><strong>Total: ${formatPkr(order.total)}</strong></p>
      </div>
    `,
  };
}

export async function sendOrderEmails(
  order: OrderEmailPayload,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_FROM_EMAIL || "no-reply@wire-ly.shop";
  const admin = process.env.ORDER_ADMIN_EMAIL;

  if (!apiKey) {
    console.info("[email] RESEND_API_KEY missing — skipped sending");
    return { sent: false, error: "Email not configured" };
  }

  const customer = buildCustomerOrderEmail(order);
  const adminMail = buildAdminOrderEmail(order);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${SITE_NAME} <${from}>`,
        to: [order.email],
        subject: customer.subject,
        html: customer.html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { sent: false, error: text };
    }

    if (admin) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${SITE_NAME} <${from}>`,
          to: [admin],
          subject: adminMail.subject,
          html: adminMail.html,
        }),
      });
    }

    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "Email failed" };
  }
}
