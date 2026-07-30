"use client";

import { useEffect, useState } from "react";

export interface CustomizationDetailData {
  id: string;
  garment: string;
  rawGarment?: string;
  spec: {
    selections: Record<string, string>;
    colorMatchReference: boolean;
  };
  notes: string | null;
  occasion: string | null;
  budgetTier: string | null;
  requiredBy: string | null;
  statusLabel: string;
  rawStatus: string;
  badgeColor: string;
  quotedPrice: number | null;
  adminNotes: string | null;
  media: Array<{
    id: string;
    key: string;
    url: string;
    contentType: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CustomizeDetailsModalProps {
  requestId: string | null;
  onClose: () => void;
}

const STATUS_STEPS = [
  { id: "SUBMITTED", label: "Brief Submitted", description: "Atelier received brief" },
  { id: "REVIEWING", label: "Atelier Reviewing", description: "Assessing requirements" },
  { id: "QUOTED", label: "Quote Ready", description: "Pricing & timeline set" },
  { id: "ACCEPTED", label: "Brief Accepted", description: "Ready for crafting" },
  { id: "IN_PRODUCTION", label: "In Production", description: "Artisans handcrafting" },
  { id: "COMPLETED", label: "Completed", description: "Finished & dispatched" },
];

function getStepIndex(status: string): number {
  switch (status) {
    case "SUBMITTED":
      return 0;
    case "REVIEWING":
      return 1;
    case "QUOTED":
      return 2;
    case "ACCEPTED":
      return 3;
    case "IN_PRODUCTION":
      return 4;
    case "COMPLETED":
      return 5;
    case "DECLINED":
      return -1;
    default:
      return 0;
  }
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
};

const formatMoney = (n: number) => `\u20B9${n.toLocaleString("en-IN")}`;

export default function CustomizeDetailsModal({
  requestId,
  onClose,
}: CustomizeDetailsModalProps) {
  const [data, setData] = useState<CustomizationDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMediaUrl, setActiveMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;

    let cancelled = false;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/customize/${requestId}`);
        if (!res.ok) {
          throw new Error(`Failed to load request details (${res.status})`);
        }
        const json = await res.json();
        if (!cancelled) {
          setData(json.data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error loading details");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  if (!requestId) return null;

  const currentStepIdx = data ? getStepIndex(data.rawStatus) : 0;
  const isDeclined = data?.rawStatus === "DECLINED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs sm:p-6">
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl transition-all sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-brand-primary/10 bg-brand-bg text-brand-text transition-colors hover:bg-brand-primary/10"
          aria-label="Close details"
        >
          &times;
        </button>

        {loading && (
          <div className="flex min-h-[300px] flex-col items-center justify-center space-y-3 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" />
            <p className="font-mono text-xs uppercase tracking-wider text-brand-text/60">
              Fetching Bespoke Brief Details...
            </p>
          </div>
        )}

        {error && (
          <div className="flex min-h-[250px] flex-col items-center justify-center space-y-4 text-center">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button
              onClick={onClose}
              className="rounded-lg bg-brand-primary px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-primary/90"
            >
              Close
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-8">
            {/* Header */}
            <div className="border-b border-brand-primary/10 pb-6 pr-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-brand-gold">
                  REQ-&mdash;{data.id.slice(-8).toUpperCase()}
                </span>
                <span
                  className={`inline-block rounded-full border px-3 py-0.5 text-xs font-medium ${data.badgeColor}`}
                >
                  {data.statusLabel}
                </span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-semibold text-brand-primary sm:text-3xl">
                Bespoke {data.garment}
              </h2>
              <p className="mt-1 font-mono text-xs text-brand-text/60">
                Submitted on {formatDate(data.createdAt)}
              </p>
            </div>

            {/* Progress Tracker */}
            {isDeclined ? (
              <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-red-800">
                <h4 className="font-medium text-sm text-red-900">Request Declined</h4>
                <p className="mt-1 text-xs text-red-700">
                  {data.adminNotes ||
                    "Our atelier was unable to fulfill this customization request at this time. Please reach out to customer support for further guidance."}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-brand-primary/10 bg-brand-ivory/50 p-5">
                <h3 className="font-mono text-xs uppercase tracking-widest text-brand-gold">
                  Tracking & Progress Status
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div
                        key={step.id}
                        className={`flex flex-col items-center text-center transition-all ${
                          isCurrent
                            ? "scale-105"
                            : isCompleted
                            ? "opacity-90"
                            : "opacity-40"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold transition-colors ${
                            isCurrent
                              ? "bg-brand-primary text-white ring-4 ring-brand-primary/20"
                              : isCompleted
                              ? "bg-brand-gold text-white"
                              : "bg-brand-primary/10 text-brand-text/50"
                          }`}
                        >
                          {isCompleted ? "✓" : idx + 1}
                        </div>
                        <p
                          className={`mt-2 font-medium text-xs ${
                            isCurrent
                              ? "font-semibold text-brand-primary"
                              : "text-brand-text"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quote Alert & Admin Notes */}
            {data.quotedPrice !== null && data.quotedPrice !== undefined && (
              <div className="rounded-xl border border-brand-gold/40 bg-brand-gold/10 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-brand-gold">
                      Quoted Price
                    </span>
                    <h4 className="font-display text-2xl font-bold text-brand-primary">
                      {formatMoney(data.quotedPrice)}
                    </h4>
                  </div>
                  {data.rawStatus === "QUOTED" && (
                    <div className="rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white">
                      Quote Confirmed by Atelier
                    </div>
                  )}
                </div>
                {data.adminNotes && (
                  <p className="mt-3 text-xs italic text-brand-text/80">
                    &ldquo;{data.adminNotes}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Design Specifications Grid */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-brand-gold">
                Garment Specifications
              </h3>
              <div className="mt-3 divide-y divide-brand-primary/10 rounded-xl border border-brand-primary/10 bg-white">
                {Object.entries(data.spec.selections).length > 0 ? (
                  Object.entries(data.spec.selections).map(([key, val]) => (
                    <div
                      key={key}
                      className="flex flex-col justify-between px-5 py-3.5 text-xs sm:flex-row sm:items-center"
                    >
                      <span className="font-mono uppercase tracking-wider text-brand-text/60">
                        {key.replace(/-/g, " ")}
                      </span>
                      <span className="mt-0.5 font-medium text-brand-primary sm:mt-0">
                        {val || "Standard"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-4 text-xs text-brand-text/60">
                    Standard garment selection.
                  </div>
                )}
                {data.spec.colorMatchReference && (
                  <div className="flex flex-col justify-between px-5 py-3.5 text-xs sm:flex-row sm:items-center">
                    <span className="font-mono uppercase tracking-wider text-brand-text/60">
                      Color Match
                    </span>
                    <span className="font-medium text-brand-gold">
                      Match to reference image exactly
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Occasion, Budget & Timeline */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-brand-primary/10 bg-brand-bg/50 p-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-brand-text/50">
                  Occasion
                </span>
                <p className="mt-1 text-sm font-semibold text-brand-primary">
                  {data.occasion || "Not specified"}
                </p>
              </div>
              <div className="rounded-xl border border-brand-primary/10 bg-brand-bg/50 p-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-brand-text/50">
                  Budget Preference
                </span>
                <p className="mt-1 text-sm font-semibold text-brand-primary">
                  {data.budgetTier || "Flexible"}
                </p>
              </div>
              <div className="rounded-xl border border-brand-primary/10 bg-brand-bg/50 p-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-brand-text/50">
                  Required By Date
                </span>
                <p className="mt-1 text-sm font-semibold text-brand-primary">
                  {formatDate(data.requiredBy) || "Standard delivery"}
                </p>
              </div>
            </div>

            {/* Customer Notes */}
            {data.notes && (
              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-brand-gold">
                  Additional Notes
                </h3>
                <div className="mt-2 rounded-xl border border-brand-primary/10 bg-brand-ivory/30 p-4 text-xs leading-relaxed text-brand-text">
                  {data.notes}
                </div>
              </div>
            )}

            {/* Reference Photos Gallery */}
            {data.media && data.media.length > 0 && (
              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-brand-gold">
                  Reference Photos ({data.media.length})
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {data.media.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveMediaUrl(item.url)}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-brand-primary/10 bg-brand-bg focus:outline-hidden"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt="Reference design"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="rounded bg-black/60 px-2 py-1 font-mono text-[10px] text-white">
                          View
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Lightbox */}
      {activeMediaUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveMediaUrl(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeMediaUrl}
              alt="Reference Preview"
              className="max-h-[85vh] w-auto object-contain"
            />
            <button
              onClick={() => setActiveMediaUrl(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
