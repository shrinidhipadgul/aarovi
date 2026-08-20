import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/get-session";
import { fetchOrder, type OrderWithItems } from "@/lib/queries/orders";
import { getTimeline, statusLabel, isTerminalStatus } from "@/lib/order-status";

interface Props {
  params: Promise<{ orderId: string }>;
}

interface AddressFields {
  fullName?: string;
  phone?: string;
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

function parseAddress(raw: unknown): AddressFields {
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

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

const formatMoney = (n: number) =>
  `\u20B9${n.toLocaleString("en-IN")}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Order ${orderId}`,
    description: "Track the status of your order.",
    robots: { index: false, follow: false },
  };
}

export default async function OrderStatusPage({ params }: Props) {
  const { orderId } = await params;
  const session = await getSession();

  if (!session?.user?.id) {
    const callbackURL = encodeURIComponent(`/status/${orderId}`);
    redirect(`/sign-in?callbackURL=${callbackURL}`);
  }

  const order = await fetchOrder(orderId);

  if (!order) {
    notFound();
  }

  if (order.userId !== session.user.id) {
    notFound();
  }

  return (
    <OrderStatusView order={order} />
  );
}

function OrderStatusView({ order }: { order: OrderWithItems }) {
  const timeline = getTimeline(order.status);
  const address = parseAddress(order.address);
  const placed = new Date(order.createdAt);
  const estimatedDelivery = new Date(
    placed.getTime() + 7 * 24 * 60 * 60 * 1000,
  );
  const showEta = !isTerminalStatus(order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-brand-text/60 transition-colors hover:text-brand-primary"
      >
        <span aria-hidden>&larr;</span> Continue shopping
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-primary sm:text-4xl">
            Track Your Order
          </h1>
          <p className="mt-1 text-sm text-brand-text/60">
            Order&nbsp;#{order.id}
          </p>
        </div>
        <span className="inline-block rounded-full bg-brand-gold/10 px-4 py-1.5 text-sm font-medium capitalize text-brand-gold">
          {statusLabel(order.status)}
        </span>
      </div>

      {showEta && (
        <p className="mt-4 rounded-lg border border-brand-primary/10 bg-brand-bg px-4 py-3 text-sm text-brand-text/70">
          Estimated delivery by{" "}
          <span className="font-semibold text-brand-primary">
            {formatDate(estimatedDelivery)}
          </span>
        </p>
      )}

      <section className="mt-8">
        <h2 className="sr-only">Order status timeline</h2>
        <ol className="relative">
          {timeline.map((step, index) => {
            const isLast = index === timeline.length - 1;
            return (
              <li key={step.key} className="flex gap-4 pb-8 last:pb-0">
                {!isLast && (
                  <span
                    aria-hidden
                    className={`absolute left-[15px] top-8 h-[calc(100%-4rem)] w-0.5 ${
                      step.state === "completed"
                        ? "bg-brand-primary"
                        : "bg-brand-primary/15"
                    }`}
                  />
                )}
                <span
                  className={`relative z-10 mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 text-sm ${
                    step.state === "completed"
                      ? "border-brand-primary bg-brand-primary text-white"
                      : step.state === "current"
                        ? "border-brand-gold bg-white text-brand-gold"
                        : "border-brand-primary/15 bg-white text-brand-text/30"
                  }`}
                >
                  {step.state === "completed" ? (
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4L8.5 12 15.3 5.3a1 1 0 0 1 1.4 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <div className="pt-1">
                  <p
                    className={`text-sm font-semibold ${
                      step.state === "upcoming"
                        ? "text-brand-text/40"
                        : "text-brand-primary"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.state === "current" && (
                    <p className="mt-0.5 text-xs text-brand-gold">In progress</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-10 grid gap-8 border-t border-brand-primary/10 pt-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-brand-primary">
            Order details
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-brand-text/60">Order placed</dt>
              <dd className="text-right font-medium text-brand-text">
                {formatDate(placed)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-text/60">Payment method</dt>
              <dd className="text-right font-medium text-brand-text">
                {order.paymentMethod === "UPI_QR"
                  ? "UPI / QR Payment"
                  : order.paymentMethod === "RAZORPAY"
                    ? "Online Payment"
                    : order.paymentMethod}
              </dd>
            </div>
            {order.paymentId && (
              <div className="flex justify-between gap-4">
                <dt className="text-brand-text/60">Transaction ID</dt>
                <dd className="text-right font-mono text-xs text-brand-text/80">
                  {order.paymentId}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-brand-text/60">Total amount</dt>
              <dd className="text-right font-semibold text-brand-primary">
                {formatMoney(order.total)}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-brand-primary">
            Delivery address
          </h2>
          <address className="mt-4 space-y-1 text-sm not-italic text-brand-text">
            {address.fullName && (
              <p className="font-medium">{address.fullName}</p>
            )}
            {address.line1 && <p>{address.line1}</p>}
            {(address.city || address.state) && (
              <p>
                {address.city}
                {address.city && address.state ? ", " : ""}
                {address.state}
                {address.pincode ? ` — ${address.pincode}` : ""}
              </p>
            )}
            {address.phone && (
              <p className="pt-1 text-brand-text/60">Phone: {address.phone}</p>
            )}
          </address>
        </div>
      </section>

      <section className="mt-10 border-t border-brand-primary/10 pt-8">
        <h2 className="text-lg font-semibold text-brand-primary">
          Items in this order
        </h2>
        <ul className="mt-4 divide-y divide-brand-primary/10">
          {order.items.map((item) => {
            const image = item.product.images?.[0];
            return (
              <li
                key={item.id}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="h-20 w-16 flex-none overflow-hidden rounded-lg border border-brand-primary/10 bg-brand-bg">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-brand-text/30">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/product/${item.product.id}`}
                    className="text-sm font-medium text-brand-primary transition-colors hover:text-brand-gold"
                  >
                    {item.product.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-brand-text/60">
                    Size: {item.size} &middot; Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-brand-text">
                  {formatMoney(item.price * item.quantity)}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}