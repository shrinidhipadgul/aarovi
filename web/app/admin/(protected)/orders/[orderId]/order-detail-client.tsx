"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  WRITABLE_STATUSES,
  type TimelineStep,
} from "@/lib/order-status";

interface OrderItem {
  id: string;
  productId: string;
  size: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
}

interface AddressFields {
  fullName?: string;
  phone?: string;
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface OrderDetail {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  total: number;
  status: string;
  statusLabel: string;
  badgeColor: string;
  timeline: TimelineStep[];
  address: unknown;
  paymentMethod: string;
  paymentId: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface OrderDetailClientProps {
  initialData: OrderDetail;
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

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

const formatMoney = (n: number) => `\u20B9${n.toLocaleString("en-IN")}`;

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Order Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderDetailClient({ initialData }: OrderDetailClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialData.status);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const address = parseAddress(initialData.address);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === initialData.status) return;

    setSaving(true);
    setServerError("");
    setFieldErrors({});

    try {
      const res = await fetch(`/api/admin/orders/${initialData.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.errors) setFieldErrors(json.errors);
        setServerError(json.message ?? "Failed to update status");
        return;
      }

      router.refresh();
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-primary">
            Order #{initialData.id.slice(-8)}
          </h1>
          <p className="mt-1 font-mono text-xs text-brand-text/60">
            {initialData.id}
          </p>
        </div>
        <span
          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${initialData.badgeColor}`}
        >
          {initialData.statusLabel}
        </span>
      </div>

      <section className="mt-8 rounded-xl border border-brand-primary/15 bg-brand-bg p-6">
        <h2 className="text-lg font-semibold text-brand-primary">
          Status timeline
        </h2>
        <ol className="relative mt-4">
          {initialData.timeline.map((step, index) => {
            const isLast = index === initialData.timeline.length - 1;
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
          {initialData.status === "cancelled" && (
            <li className="flex items-center gap-3 text-sm font-semibold text-red-700">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 border-red-300 bg-red-50">
                ×
              </span>
              Order cancelled
            </li>
          )}
        </ol>
      </section>

      <section className="mt-6 rounded-xl border border-brand-primary/15 bg-brand-bg p-6">
        <h2 className="text-lg font-semibold text-brand-primary">
          Update status
        </h2>
        <form onSubmit={handleUpdateStatus} className="mt-3 flex flex-wrap items-start gap-3">
          <div className="flex-1">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setFieldErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.status;
                  return copy;
                });
              }}
              className="w-full rounded-lg border border-brand-primary/15 bg-white px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold"
            >
              {WRITABLE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s] ?? s}
                </option>
              ))}
            </select>
            {fieldErrors.status && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.status.join(" ")}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={saving || status === initialData.status}
            className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Update status"}
          </button>
        </form>
        {serverError && (
          <p className="mt-2 text-sm text-red-600">{serverError}</p>
        )}
      </section>

      <section className="mt-6 grid gap-6 border-t border-brand-primary/10 pt-6 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-brand-primary">
            Order details
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-brand-text/60">Order placed</dt>
              <dd className="text-right font-medium text-brand-text">
                {formatDate(initialData.createdAt)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-text/60">Payment method</dt>
              <dd className="text-right font-medium uppercase text-brand-text">
                {initialData.paymentMethod}
              </dd>
            </div>
            {initialData.paymentId && (
              <div className="flex justify-between gap-4">
                <dt className="text-brand-text/60">Payment id</dt>
                <dd className="text-right font-mono text-xs text-brand-text/70">
                  {initialData.paymentId}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-brand-text/60">Total amount</dt>
              <dd className="text-right font-semibold text-brand-primary">
                {formatMoney(initialData.total)}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-brand-primary">Customer</h2>
          <div className="mt-4 space-y-1 text-sm text-brand-text">
            {initialData.userName && (
              <p className="font-medium">{initialData.userName}</p>
            )}
            {initialData.userEmail && (
              <p className="text-brand-text/70">{initialData.userEmail}</p>
            )}
            {!initialData.userName && !initialData.userEmail && (
              <p className="text-brand-text/40">Unknown customer</p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 border-t border-brand-primary/10 pt-6">
        <h2 className="text-lg font-semibold text-brand-primary">
          Delivery address
        </h2>
        <address className="mt-4 space-y-1 text-sm not-italic text-brand-text">
          {address.fullName && <p className="font-medium">{address.fullName}</p>}
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
      </section>

      <section className="mt-8 border-t border-brand-primary/10 pt-6">
        <h2 className="text-lg font-semibold text-brand-primary">
          Items in this order
        </h2>
        <ul className="mt-4 divide-y divide-brand-primary/10">
          {initialData.items.map((item) => {
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
                  <p className="text-sm font-medium text-brand-primary">
                    {item.product.name}
                  </p>
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