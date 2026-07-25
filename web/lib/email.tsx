import { render } from "@react-email/render";
import { Resend } from "resend";
import type { OrderForEmail } from "@/lib/queries/orders";
import { statusLabel } from "@/lib/order-status";
import { OrderConfirmationEmail } from "@/lib/emails/order-confirmation";
import { OrderStatusUpdateEmail } from "@/lib/emails/order-status-update";
import { OrderCancellationEmail } from "@/lib/emails/order-cancellation";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function fromAddress(): string {
  return process.env.MAIL_FROM_EMAIL ?? "Aarovi <noreply@aarovi.in>";
}

let cached: Resend | null = null;
function getResend(): Resend {
  if (!cached) cached = new Resend(process.env.RESEND_API_KEY!);
  return cached;
}

interface AddressShape {
  fullName?: string;
  phone?: string;
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

function parseAddress(raw: unknown): AddressShape {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return {};
  }
  const obj = raw as Record<string, unknown>;
  return {
    fullName: typeof obj.fullName === "string" ? obj.fullName : undefined,
    phone: typeof obj.phone === "string" ? obj.phone : undefined,
    line1:
      typeof obj.line1 === "string"
        ? obj.line1
        : typeof obj.address === "string"
          ? obj.address
          : undefined,
    city: typeof obj.city === "string" ? obj.city : undefined,
    state: typeof obj.state === "string" ? obj.state : undefined,
    pincode:
      typeof obj.pincode === "string"
        ? obj.pincode
        : typeof obj.pincode === "number"
          ? String(obj.pincode)
          : undefined,
  };
}

interface SendResult {
  ok: boolean;
  error?: string;
}

async function sendTemplate(
  to: string,
  subject: string,
  element: React.ReactElement,
): Promise<SendResult> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "RESEND_API_KEY not set — email skipped" };
  }

  try {
    const [html, text] = await Promise.all([
      render(element),
      render(element, { plainText: true }),
    ]);

    const res = await getResend().emails.send({
      from: fromAddress(),
      to,
      subject,
      html,
      text,
    });

    if (res.error) {
      console.error("[email] resend returned error", {
        to,
        subject,
        error: res.error,
      });
      return { ok: false, error: res.error.message };
    }

    return { ok: true };
  } catch (e) {
    console.error("[email] send failed", { to, subject, error: e });
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function sendOrderConfirmationEmail(
  order: OrderForEmail,
): Promise<SendResult> {
  if (!order.user?.email) return { ok: false, error: "no recipient" };

  const subject = `Your Aarovi order #${order.id.slice(-8)} is confirmed`;

  return sendTemplate(
    order.user.email,
    subject,
    <OrderConfirmationEmail
      orderId={order.id}
      placedAt={order.createdAt.toISOString()}
      paymentMethod={order.paymentMethod}
      total={order.total}
      items={order.items.map((i) => ({
        id: i.id,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
        product: {
          id: i.product.id,
          name: i.product.name,
          slug: i.product.slug,
          images: i.product.images,
        },
      }))}
      address={parseAddress(order.address)}
    />,
  );
}

export async function sendOrderStatusUpdateEmail(
  order: OrderForEmail,
  newStatus: string,
): Promise<SendResult> {
  if (!order.user?.email) return { ok: false, error: "no recipient" };

  const label = statusLabel(newStatus);
  const subject = `Your Aarovi order is now: ${label}`;

  return sendTemplate(
    order.user.email,
    subject,
    <OrderStatusUpdateEmail
      orderId={order.id}
      newStatus={newStatus}
      statusLabel={label}
    />,
  );
}

export async function sendOrderCancellationEmail(
  order: OrderForEmail,
): Promise<SendResult> {
  if (!order.user?.email) return { ok: false, error: "no recipient" };

  const subject = `Your Aarovi order #${order.id.slice(-8)} has been cancelled`;

  return sendTemplate(
    order.user.email,
    subject,
    <OrderCancellationEmail
      orderId={order.id}
      total={order.total}
      paymentMethod={order.paymentMethod}
      items={order.items.map((i) => ({
        id: i.id,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
        product: {
          id: i.product.id,
          name: i.product.name,
          slug: i.product.slug,
          images: i.product.images,
        },
      }))}
      address={parseAddress(order.address)}
    />,
  );
}