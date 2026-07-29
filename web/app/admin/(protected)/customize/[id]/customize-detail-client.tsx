"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CUSTOMIZATION_STATUSES,
  statusLabel as getStatusLabel,
} from "@/lib/customize/status";

interface MediaItem {
  id: string;
  key: string;
  url: string;
  contentType: string;
}

interface CustomizeDetail {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  garment: string;
  spec: {
    selections: Record<string, string>;
    colorMatchReference: boolean;
  };
  notes: string | null;
  occasion: string | null;
  budgetTier: string | null;
  requiredBy: string | null;
  status: string;
  statusLabel: string;
  badgeColor: string;
  quotedPrice: number | null;
  adminNotes: string | null;
  media: MediaItem[];
  createdAt: string;
  updatedAt: string;
}

interface CustomizeDetailClientProps {
  initialData: CustomizeDetail;
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export function CustomizeDetailClient({
  initialData,
}: CustomizeDetailClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialData.status);
  const [quotedPrice, setQuotedPrice] = useState(
    initialData.quotedPrice?.toString() ?? "",
  );
  const [adminNotes, setAdminNotes] = useState(initialData.adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setServerError("");

    const body: Record<string, unknown> = {};
    if (status !== initialData.status) body.status = status;
    if (quotedPrice !== (initialData.quotedPrice?.toString() ?? "")) {
      body.quotedPrice = quotedPrice ? parseFloat(quotedPrice) : null;
    }
    if (adminNotes !== (initialData.adminNotes ?? "")) {
      body.adminNotes = adminNotes || null;
    }

    if (Object.keys(body).length === 0) {
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/customize/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setServerError(json.message ?? "Failed to update");
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
            {initialData.garment}
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

      {/* Customer info */}
      <section className="mt-8 grid gap-4 rounded-xl border border-brand-primary/15 bg-brand-bg p-6 text-sm sm:grid-cols-2">
        <div>
          <p className="text-brand-text/60">Customer</p>
          <p className="font-medium text-brand-text">
            {initialData.userName ?? initialData.userEmail ?? "Unknown"}
          </p>
          {initialData.userEmail && (
            <p className="text-xs text-brand-text/40">
              {initialData.userEmail}
            </p>
          )}
        </div>
        <div>
          <p className="text-brand-text/60">Submitted</p>
          <p className="font-medium text-brand-text">
            {formatDate(initialData.createdAt)}
          </p>
        </div>
        {initialData.requiredBy && (
          <div>
            <p className="text-brand-text/60">Needed by</p>
            <p className="font-medium text-brand-text">
              {new Intl.DateTimeFormat("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date(initialData.requiredBy))}
            </p>
          </div>
        )}
        <div>
          <p className="text-brand-text/60">Occasion</p>
          <p className="font-medium text-brand-text">
            {initialData.occasion ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-brand-text/60">Budget</p>
          <p className="font-medium text-brand-text">
            {initialData.budgetTier ?? "—"}
          </p>
        </div>
      </section>

      {/* Spec selections */}
      <section className="mt-6 rounded-xl border border-brand-primary/15 bg-brand-bg p-6">
        <h2 className="text-lg font-semibold text-brand-primary">
          Specifications
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(initialData.spec.selections).map(([key, val]) => (
            <div key={key} className="flex justify-between gap-2">
              <dt className="text-xs uppercase tracking-[0.1em] text-brand-text/50">
                {key}
              </dt>
              <dd className="text-right text-sm font-medium text-brand-text">
                {val}
              </dd>
            </div>
          ))}
        </dl>
        {initialData.spec.colorMatchReference && (
          <p className="mt-3 font-serif text-xs italic text-brand-gold">
            Colour matched to customer reference
          </p>
        )}
      </section>

      {/* Notes */}
      {initialData.notes && (
        <section className="mt-6 rounded-xl border border-brand-primary/15 bg-brand-bg p-6">
          <h2 className="text-lg font-semibold text-brand-primary">
            Customer Notes
          </h2>
          <p className="mt-2 font-serif text-sm italic leading-relaxed text-brand-text/70">
            {initialData.notes}
          </p>
        </section>
      )}

      {/* Reference gallery */}
      {initialData.media.length > 0 && (
        <section className="mt-6 rounded-xl border border-brand-primary/15 bg-brand-bg p-6">
          <h2 className="text-lg font-semibold text-brand-primary">
            Reference Images ({initialData.media.length})
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {initialData.media.map((m) => (
              <a
                key={m.id}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-brand-primary/10"
              >
                <img
                  src={m.url}
                  alt=""
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Update status / quote / notes */}
      <section className="mt-6 rounded-xl border border-brand-primary/15 bg-brand-bg p-6">
        <h2 className="text-lg font-semibold text-brand-primary">
          Update Brief
        </h2>
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-text">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-brand-primary/15 bg-white px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold"
            >
              {CUSTOMIZATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-text">
              Quoted Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={quotedPrice}
              onChange={(e) => setQuotedPrice(e.target.value)}
              placeholder="Enter price when ready"
              className="w-full rounded-lg border border-brand-primary/15 bg-white px-4 py-2.5 text-sm text-brand-text outline-none transition-colors placeholder:text-brand-text/20 focus:border-brand-gold"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-text">
              Admin Notes
            </label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes — not visible to the customer"
              className="w-full rounded-lg border border-brand-primary/15 bg-white px-4 py-2.5 text-sm text-brand-text outline-none transition-colors placeholder:text-brand-text/20 focus:border-brand-gold"
            />
          </div>

          {serverError && (
            <p className="text-sm text-red-600">{serverError}</p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={
                saving ||
                (status === initialData.status &&
                  quotedPrice === (initialData.quotedPrice?.toString() ?? "") &&
                  adminNotes === (initialData.adminNotes ?? ""))
              }
              className="rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Meta */}
      <section className="mt-6 border-t border-brand-primary/10 pt-4">
        <p className="font-mono text-[10px] text-brand-text/20">
          Created {formatDate(initialData.createdAt)} · Updated{" "}
          {formatDate(initialData.updatedAt)}
        </p>
      </section>
    </div>
  );
}
