import {
  ORDER_ADMIN_EMAIL,
  ORDER_FROM_EMAIL,
  SITE_NAME,
  SITE_URL,
  WHATSAPP_NUMBER,
} from "./constants";
import { formatPkr } from "./utils";

export type OrderEmailPayload = {
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
  advancePaymentDiscountAmount?: number;
  items: {
    product_name: string;
    variation_label?: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function lineName(item: OrderEmailPayload["items"][number]): string {
  return item.variation_label
    ? `${item.product_name} (${item.variation_label})`
    : item.product_name;
}

function mailLogoUrl(): string {
  return `${SITE_URL}/brand/logo.png`;
}

function whatsappDisplay(): string {
  const digits = WHATSAPP_NUMBER.replace(/\D/g, "");
  if (digits.startsWith("92") && digits.length >= 12) {
    return `+92 ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  return `+${digits}`;
}

function whatsappLink(orderNumber: number | string, phone: string): string {
  const text = `Hi Wirely, I placed order #${orderNumber}. My phone number for confirmation is: ${phone}`;
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

function buildOrderRowsHtml(items: OrderEmailPayload["items"]): string {
  return items
    .map((line) => {
      const name = escapeHtml(lineName(line));
      const qty = line.quantity;
      const unit = escapeHtml(formatPkr(line.unit_price));
      const sub = escapeHtml(formatPkr(line.line_total));
      return (
        "<tr>" +
        `<td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;font-family:Inter,Segoe UI,sans-serif;font-size:14px;color:#1a1f2e;">${name}</td>` +
        `<td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;text-align:center;font-family:Inter,Segoe UI,sans-serif;font-size:14px;color:#1a1f2e;">${qty}</td>` +
        `<td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;text-align:right;font-family:Inter,Segoe UI,sans-serif;font-size:14px;color:#1a1f2e;">${unit}</td>` +
        `<td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;text-align:right;font-family:Inter,Segoe UI,sans-serif;font-size:14px;color:#1a1f2e;font-weight:600;">${sub}</td>` +
        "</tr>"
      );
    })
    .join("");
}

function buildOrderLinesPlain(items: OrderEmailPayload["items"]): string {
  return items
    .map(
      (line) =>
        `${lineName(line)}  ×${line.quantity}  ${formatPkr(line.unit_price)} each  ${formatPkr(line.line_total)}`,
    )
    .join("\n");
}

function pricingBreakdown(order: OrderEmailPayload) {
  const codFee = order.paymentMethod === "cod" ? Math.max(0, order.codFee) : 0;
  const couponDiscountAmount = Math.max(0, order.discount);
  const advancePaymentDiscountAmount = Math.max(
    0,
    order.advancePaymentDiscountAmount ?? 0,
  );
  const showCouponDiscount =
    couponDiscountAmount > 0 &&
    order.couponCode !== null &&
    order.couponCode !== undefined &&
    order.couponCode !== "";
  const showAdvanceDiscount = advancePaymentDiscountAmount > 0;
  const showCod = codFee > 0;
  const showBreakdown =
    showCouponDiscount || showAdvanceDiscount || showCod;

  let subtotalBeforeDiscount = order.subtotal;
  if (subtotalBeforeDiscount <= 0) {
    subtotalBeforeDiscount =
      order.total +
      couponDiscountAmount +
      advancePaymentDiscountAmount -
      codFee;
  }

  return {
    codFee,
    couponDiscountAmount,
    advancePaymentDiscountAmount,
    showCouponDiscount,
    showAdvanceDiscount,
    showCod,
    showBreakdown,
    subtotalBeforeDiscount,
  };
}

export function buildCustomerOrderEmail(order: OrderEmailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    codFee,
    couponDiscountAmount,
    advancePaymentDiscountAmount,
    showCouponDiscount,
    showAdvanceDiscount,
    showCod,
    showBreakdown,
    subtotalBeforeDiscount,
  } = pricingBreakdown(order);

  const logoUrl = escapeHtml(mailLogoUrl());
  const totalFormatted = escapeHtml(formatPkr(order.total));
  const orderRows = buildOrderRowsHtml(order.items);
  const subtotalFormatted = escapeHtml(formatPkr(subtotalBeforeDiscount));
  const couponDiscountFormatted = escapeHtml(formatPkr(couponDiscountAmount));
  const advanceDiscountFormatted = escapeHtml(
    formatPkr(advancePaymentDiscountAmount),
  );
  const couponLabel = escapeHtml(
    (order.couponCode ?? "").trim().toUpperCase(),
  );
  const codFormatted = escapeHtml(formatPkr(codFee));
  const waLink = whatsappLink(order.orderNumber, order.phone);
  const waDisplay = whatsappDisplay();

  const whatNextBullets =
    order.paymentMethod === "cod"
      ? '<li style="margin-bottom:8px;"><strong>Cash on delivery:</strong> Delivery is free. Most orders arrive in <strong>2&ndash;4 days</strong>. Please keep the exact order total ready; payment is collected when your parcel arrives.</li>' +
        '<li style="margin-bottom:8px;"><strong>We&rsquo;ll reach out:</strong> A representative may contact you to confirm your address and delivery.</li>' +
        `<li style="margin-bottom:0;"><strong>WhatsApp:</strong> You can also message us on WhatsApp at <a href="tel:+${WHATSAPP_NUMBER.replace(/\D/g, "")}" style="color:#1a3a5c;font-weight:600;">${escapeHtml(waDisplay)}</a> &mdash; include the <strong>phone number you used on this order</strong> so we can match and confirm your order quickly.</li>`
      : '<li style="margin-bottom:8px;"><strong>Advance payment:</strong> You received <strong>10% off</strong> for paying in advance. Your order will be processed after we receive payment.</li>' +
        '<li style="margin-bottom:8px;"><strong>We&rsquo;ll reach out:</strong> A customer representative will contact you shortly to complete payment and confirm details.</li>' +
        `<li style="margin-bottom:0;"><strong>WhatsApp:</strong> You can also message us on WhatsApp at <a href="tel:+${WHATSAPP_NUMBER.replace(/\D/g, "")}" style="color:#1a3a5c;font-weight:600;">${escapeHtml(waDisplay)}</a> &mdash; include the <strong>phone number you used on this order</strong> so we can match and confirm your order quickly.</li>`;

  const html =
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"></head><body style="margin:0;padding:0;background:#f5f2eb;">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f2eb;padding:24px 12px;">' +
    '<tr><td align="center">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e4dc;box-shadow:0 4px 24px rgba(26,31,46,.06);">' +
    '<tr><td style="padding:28px 28px 20px;text-align:center;background:linear-gradient(180deg,#faf8f4 0%,#ffffff 100%);">' +
    `<img src="${logoUrl}" alt="${SITE_NAME}" width="160" height="auto" style="max-width:160px;height:auto;display:inline-block;border:0;" />` +
    "</td></tr>" +
    '<tr><td style="padding:0 28px 8px;font-family:Inter,Segoe UI,sans-serif;">' +
    `<h1 style="margin:0 0 8px;font-size:22px;line-height:1.3;color:#1a3a5c;font-weight:700;">Thank you, ${escapeHtml(order.customerName)}!</h1>` +
    `<p style="margin:0;font-size:15px;line-height:1.55;color:#5c6478;">We&rsquo;ve received your order <strong style="color:#1a3a5c;">#${escapeHtml(String(order.orderNumber))}</strong> and we&rsquo;re on it.</p>` +
    "</td></tr>" +
    '<tr><td style="padding:16px 28px 8px;">' +
    '<p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8b9199;font-family:Inter,Segoe UI,sans-serif;">Order summary</p>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e4dc;border-radius:12px;overflow:hidden;">' +
    '<tr style="background:#f7f5f0;">' +
    '<th align="left" style="padding:10px 12px;font-size:12px;font-weight:600;color:#5c6478;font-family:Inter,Segoe UI,sans-serif;">Item</th>' +
    '<th align="center" style="padding:10px 8px;font-size:12px;font-weight:600;color:#5c6478;font-family:Inter,Segoe UI,sans-serif;">Qty</th>' +
    '<th align="right" style="padding:10px 12px;font-size:12px;font-weight:600;color:#5c6478;font-family:Inter,Segoe UI,sans-serif;">Price</th>' +
    '<th align="right" style="padding:10px 12px;font-size:12px;font-weight:600;color:#5c6478;font-family:Inter,Segoe UI,sans-serif;">Subtotal</th>' +
    "</tr>" +
    orderRows +
    (showBreakdown
      ? `<tr><td colspan="3" style="padding:14px 12px;text-align:right;font-family:Inter,Segoe UI,sans-serif;font-size:14px;color:#5c6478;">Subtotal</td><td style="padding:14px 12px;text-align:right;font-family:Inter,Segoe UI,sans-serif;font-size:14px;color:#1a1f2e;">${subtotalFormatted}</td></tr>`
      : "") +
    (showAdvanceDiscount
      ? `<tr><td colspan="3" style="padding:8px 12px;text-align:right;font-family:Inter,Segoe UI,sans-serif;font-size:14px;color:#5c6478;">Advance payment (10% off)</td><td style="padding:8px 12px;text-align:right;font-family:Inter,Segoe UI,sans-serif;font-size:14px;color:#166534;">&minus;${advanceDiscountFormatted}</td></tr>`
      : "") +
    (showCouponDiscount
      ? `<tr><td colspan="3" style="padding:8px 12px;text-align:right;font-family:Inter,Segoe UI,sans-serif;font-size:14px;color:#5c6478;">Discount (${couponLabel})</td><td style="padding:8px 12px;text-align:right;font-family:Inter,Segoe UI,sans-serif;font-size:14px;color:#166534;">&minus;${couponDiscountFormatted}</td></tr>`
      : "") +
    (showCod
      ? `<tr><td colspan="3" style="padding:8px 12px;text-align:right;font-family:Inter,Segoe UI,sans-serif;font-size:14px;color:#5c6478;">Cash on delivery (per order)</td><td style="padding:8px 12px;text-align:right;font-family:Inter,Segoe UI,sans-serif;font-size:14px;color:#1a1f2e;">+${codFormatted}</td></tr>`
      : "") +
    `<tr><td colspan="3" style="padding:14px 12px;text-align:right;font-family:Inter,Segoe UI,sans-serif;font-size:14px;color:#5c6478;">${showBreakdown ? "Order total" : "Total"}</td>` +
    `<td style="padding:14px 12px;text-align:right;font-family:Inter,Segoe UI,sans-serif;font-size:18px;font-weight:700;color:#1a3a5c;">${totalFormatted}</td></tr>` +
    "</table>" +
    "</td></tr>" +
    '<tr><td style="padding:8px 28px 24px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f6fb;border:1px solid #c5d9ec;border-radius:12px;">' +
    '<tr><td style="padding:18px 20px;font-family:Inter,Segoe UI,sans-serif;">' +
    '<p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1a3a5c;">What happens next</p>' +
    '<ul style="margin:0;padding:0 0 0 18px;color:#3d4a5c;font-size:14px;line-height:1.65;">' +
    whatNextBullets +
    "</ul>" +
    '<div style="margin-top:16px;text-align:center;">' +
    `<a href="${escapeHtml(waLink)}" style="display:inline-block;background:#1a3a5c;color:#faf8f4 !important;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:999px;font-family:Inter,Segoe UI,sans-serif;">Message us on WhatsApp</a>` +
    "</div>" +
    "</td></tr></table>" +
    "</td></tr>" +
    '<tr><td style="padding:0 28px 28px;font-family:Inter,Segoe UI,sans-serif;font-size:12px;line-height:1.5;color:#8b9199;text-align:center;">' +
    "Questions? Reply to this email is not monitored. Use WhatsApp or wait for our team to contact you." +
    `<br /><br />&copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.` +
    "</td></tr>" +
    "</table>" +
    "</td></tr></table></body></html>";

  const linesPlain = buildOrderLinesPlain(order.items);
  const totalsPlainBlock: string[] = [];
  if (showBreakdown) {
    totalsPlainBlock.push(`Subtotal: ${formatPkr(subtotalBeforeDiscount)}`);
  }
  if (showAdvanceDiscount) {
    totalsPlainBlock.push(
      `Advance payment (10% off): -${formatPkr(advancePaymentDiscountAmount)}`,
    );
  }
  if (showCouponDiscount) {
    totalsPlainBlock.push(
      `Discount (${(order.couponCode ?? "").trim().toUpperCase()}): -${formatPkr(couponDiscountAmount)}`,
    );
  }
  if (showCod) {
    totalsPlainBlock.push(`Cash on delivery fee: ${formatPkr(codFee)}`);
  }
  totalsPlainBlock.push(
    `${showBreakdown ? "ORDER TOTAL" : "TOTAL"}: ${formatPkr(order.total)}`,
  );
  totalsPlainBlock.push("");

  const text = [
    `${SITE_NAME} — Order confirmation`,
    "",
    `Thank you, ${order.customerName}!`,
    "",
    `We have received your order #${order.orderNumber} at wire-ly.shop.`,
    "",
    "ORDER SUMMARY",
    "-".repeat(40),
    linesPlain,
    "-".repeat(40),
    ...totalsPlainBlock,
    "WHAT HAPPENS NEXT",
    order.paymentMethod === "cod"
      ? "- Free delivery; most orders arrive in 2–4 days. Pay when your order arrives."
      : "- You saved 10% with advance payment. We will contact you with payment details.",
    "- A customer representative may contact you to confirm details and delivery.",
    `- Or message us on WhatsApp: ${waDisplay} (include the phone number you used on this order so we can match it).`,
    "",
    `WhatsApp (tap or copy): ${waLink}`,
    "",
    "Replies to this email address are not monitored. Use WhatsApp or wait for our call.",
    "",
    `© ${new Date().getFullYear()} ${SITE_NAME} — ${SITE_URL}`,
  ].join("\n");

  return {
    subject: `We received your order #${order.orderNumber} — ${SITE_NAME}`,
    html,
    text,
  };
}

export function buildAdminOrderEmail(order: OrderEmailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    codFee,
    couponDiscountAmount,
    advancePaymentDiscountAmount,
    showCouponDiscount,
    showAdvanceDiscount,
    showCod,
    showBreakdown,
    subtotalBeforeDiscount,
  } = pricingBreakdown(order);

  const logoUrl = escapeHtml(mailLogoUrl());
  const totalFormatted = escapeHtml(formatPkr(order.total));
  const subtotalFormatted = escapeHtml(formatPkr(subtotalBeforeDiscount));
  const couponDiscountFormatted = escapeHtml(formatPkr(couponDiscountAmount));
  const advanceDiscountFormatted = escapeHtml(
    formatPkr(advancePaymentDiscountAmount),
  );
  const couponLabel = escapeHtml(
    (order.couponCode ?? "").trim().toUpperCase(),
  );
  const codFormatted = escapeHtml(formatPkr(codFee));

  const adminLinesText = order.items
    .map(
      (line) =>
        `${escapeHtml(lineName(line))} × ${line.quantity} — ${escapeHtml(formatPkr(line.line_total))}<br />`,
    )
    .join("");

  const html =
    '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f0f0;">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="padding:20px;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="600" style="max-width:600px;background:#fff;border-radius:12px;border:1px solid #ddd;overflow:hidden;">' +
    '<tr><td style="padding:20px 24px;background:#1a3a5c;text-align:center;">' +
    `<img src="${logoUrl}" alt="${SITE_NAME}" width="140" style="max-width:140px;height:auto;border:0;" />` +
    "</td></tr>" +
    '<tr><td style="padding:24px;font-family:Inter,Segoe UI,sans-serif;">' +
    `<h2 style="margin:0 0 16px;font-size:18px;color:#1a1f2e;">New order #${escapeHtml(String(order.orderNumber))}</h2>` +
    '<table style="width:100%;font-size:14px;color:#333;line-height:1.6;">' +
    `<tr><td style="padding:4px 0;width:120px;"><strong>Customer</strong></td><td>${escapeHtml(order.customerName)}</td></tr>` +
    `<tr><td style="padding:4px 0;"><strong>Email</strong></td><td><a href="mailto:${escapeHtml(order.email)}">${escapeHtml(order.email)}</a></td></tr>` +
    `<tr><td style="padding:4px 0;"><strong>Phone</strong></td><td>${escapeHtml(order.phone)}</td></tr>` +
    `<tr><td style="padding:4px 0;vertical-align:top;"><strong>Address</strong></td><td>${escapeHtml(order.address)}<br />${escapeHtml(order.city)}</td></tr>` +
    `<tr><td style="padding:4px 0;"><strong>Payment</strong></td><td>${order.paymentMethod === "cod" ? "Cash on delivery" : "Advance payment"}</td></tr>` +
    (showBreakdown
      ? `<tr><td style="padding:4px 0;"><strong>Subtotal</strong></td><td>${subtotalFormatted}</td></tr>`
      : "") +
    (showAdvanceDiscount
      ? `<tr><td style="padding:4px 0;"><strong>Advance (10%)</strong></td><td>&minus;${advanceDiscountFormatted}</td></tr>`
      : "") +
    (showCouponDiscount
      ? `<tr><td style="padding:4px 0;"><strong>Discount</strong></td><td>&minus;${couponDiscountFormatted} (${couponLabel})</td></tr>`
      : "") +
    (showCod
      ? `<tr><td style="padding:4px 0;"><strong>COD fee</strong></td><td>${codFormatted}</td></tr>`
      : "") +
    `<tr><td style="padding:4px 0;"><strong>${showBreakdown ? "Order total" : "Total"}</strong></td><td style="font-size:18px;font-weight:700;color:#1a3a5c;">${totalFormatted}</td></tr>` +
    "</table>" +
    '<p style="margin:20px 0 8px;font-size:13px;font-weight:700;color:#555;">Line items</p>' +
    `<div style="background:#f9f9f9;border:1px solid #eee;border-radius:8px;padding:12px 14px;font-size:14px;color:#333;line-height:1.7;">${adminLinesText}</div>` +
    '<p style="margin:20px 0 0;font-size:12px;color:#888;">Open the admin panel to update status and fulfil this order.</p>' +
    "</td></tr></table>" +
    "</td></tr></table></body></html>";

  const linesPlain = buildOrderLinesPlain(order.items);
  const adminTotalsPlain = [
    `Payment: ${order.paymentMethod === "cod" ? "Cash on delivery" : "Advance payment"}`,
  ];
  if (showBreakdown) {
    adminTotalsPlain.push(`Subtotal: ${formatPkr(subtotalBeforeDiscount)}`);
  }
  if (showAdvanceDiscount) {
    adminTotalsPlain.push(
      `Advance (10%): -${formatPkr(advancePaymentDiscountAmount)}`,
    );
  }
  if (showCouponDiscount) {
    adminTotalsPlain.push(
      `Discount: -${formatPkr(couponDiscountAmount)} (${(order.couponCode ?? "").trim().toUpperCase()})`,
    );
  }
  if (showCod) {
    adminTotalsPlain.push(`COD fee: ${formatPkr(codFee)}`);
  }
  adminTotalsPlain.push(
    `${showBreakdown ? "Order total" : "Total"}: ${formatPkr(order.total)}`,
  );

  const text = [
    `[${SITE_NAME}] New order #${order.orderNumber}`,
    "",
    `Customer: ${order.customerName}`,
    `Email: ${order.email}`,
    `Phone: ${order.phone}`,
    `Address: ${order.address}, ${order.city}`,
    ...adminTotalsPlain,
    "",
    "Line items:",
    linesPlain,
    "",
    "Open your admin panel to fulfil this order.",
  ].join("\n");

  return {
    subject: `[${SITE_NAME}] New order #${order.orderNumber} — ${formatPkr(order.total)}`,
    html,
    text,
  };
}

async function sendViaResend(payload: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY missing" };
  }

  const body: Record<string, unknown> = {
    from: `${SITE_NAME} <${ORDER_FROM_EMAIL}>`,
    to: [payload.to],
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  };
  if (payload.replyTo) {
    body.reply_to = payload.replyTo;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: text };
  }

  return { ok: true };
}

export async function sendOrderEmails(
  order: OrderEmailPayload,
): Promise<{ sent: boolean; error?: string }> {
  const admin = ORDER_ADMIN_EMAIL.trim();
  const customerEmail = order.email.trim();

  if (!process.env.RESEND_API_KEY) {
    console.info("[email] RESEND_API_KEY missing — skipped sending");
    return { sent: false, error: "Email not configured" };
  }

  const adminMail = buildAdminOrderEmail(order);
  const customerMail = buildCustomerOrderEmail(order);

  try {
    if (admin) {
      const adminResult = await sendViaResend({
        to: admin,
        subject: adminMail.subject,
        html: adminMail.html,
        text: adminMail.text,
        replyTo: customerEmail,
      });
      if (!adminResult.ok) {
        console.error("[email] admin send failed:", adminResult.error);
      }
    }

    const customerResult = await sendViaResend({
      to: customerEmail,
      subject: customerMail.subject,
      html: customerMail.html,
      text: customerMail.text,
    });

    if (!customerResult.ok) {
      return { sent: false, error: customerResult.error };
    }

    return { sent: true };
  } catch (e) {
    return {
      sent: false,
      error: e instanceof Error ? e.message : "Email failed",
    };
  }
}
