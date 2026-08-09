"use client";

import { useState, useEffect, useCallback } from "react";
import { useFocusTrap } from "@/lib/hooks/use-focus-trap";

interface SizeChartModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "women" | "men";
type Unit = "in" | "cm";

interface SizeEntry {
  size: string;
  primary: { in: string; cm: string }; // bust or chest
  waist: { in: string; cm: string };
  hip: { in: string; cm: string };
  shoulder: { in: string; cm: string };
  length: { in: string; cm: string };
}

const WOMEN_SIZES: SizeEntry[] = [
  { size: "XS", primary: { in: "32", cm: "81" }, waist: { in: "26", cm: "66" }, hip: { in: "36", cm: "91" }, shoulder: { in: "13.5", cm: "34" }, length: { in: "42", cm: "107" } },
  { size: "S", primary: { in: "34", cm: "86" }, waist: { in: "28", cm: "71" }, hip: { in: "38", cm: "97" }, shoulder: { in: "14.0", cm: "36" }, length: { in: "43", cm: "109" } },
  { size: "M", primary: { in: "36", cm: "91" }, waist: { in: "30", cm: "76" }, hip: { in: "40", cm: "102" }, shoulder: { in: "14.5", cm: "37" }, length: { in: "44", cm: "112" } },
  { size: "L", primary: { in: "38", cm: "97" }, waist: { in: "32", cm: "81" }, hip: { in: "42", cm: "107" }, shoulder: { in: "15.0", cm: "38" }, length: { in: "44", cm: "112" } },
  { size: "XL", primary: { in: "40", cm: "102" }, waist: { in: "34", cm: "86" }, hip: { in: "44", cm: "112" }, shoulder: { in: "15.5", cm: "39" }, length: { in: "45", cm: "114" } },
  { size: "XXL", primary: { in: "42", cm: "107" }, waist: { in: "36", cm: "91" }, hip: { in: "46", cm: "117" }, shoulder: { in: "16.0", cm: "41" }, length: { in: "45", cm: "114" } },
];

const MEN_SIZES: SizeEntry[] = [
  { size: "S", primary: { in: "36", cm: "91" }, waist: { in: "30", cm: "76" }, hip: { in: "38", cm: "97" }, shoulder: { in: "16.5", cm: "42" }, length: { in: "38", cm: "97" } },
  { size: "M", primary: { in: "38", cm: "97" }, waist: { in: "32", cm: "81" }, hip: { in: "40", cm: "102" }, shoulder: { in: "17.0", cm: "43" }, length: { in: "39", cm: "99" } },
  { size: "L", primary: { in: "40", cm: "102" }, waist: { in: "34", cm: "86" }, hip: { in: "42", cm: "107" }, shoulder: { in: "17.5", cm: "44" }, length: { in: "40", cm: "102" } },
  { size: "XL", primary: { in: "42", cm: "107" }, waist: { in: "36", cm: "91" }, hip: { in: "44", cm: "112" }, shoulder: { in: "18.0", cm: "46" }, length: { in: "41", cm: "104" } },
  { size: "XXL", primary: { in: "44", cm: "112" }, waist: { in: "38", cm: "97" }, hip: { in: "46", cm: "117" }, shoulder: { in: "18.5", cm: "47" }, length: { in: "42", cm: "107" } },
];

const MEASURING_GUIDE = [
  {
    term: "Bust / Chest",
    desc: "Wrap the measuring tape around the fullest part of your chest or bust, keeping the tape straight and snug across your shoulder blades.",
  },
  {
    term: "Natural Waist",
    desc: "Measure around your natural waistline, typically the narrowest point between your ribcage and hips.",
  },
  {
    term: "Hips",
    desc: "Stand with heels together and measure around the fullest circumference of your hips and seat.",
  },
  {
    term: "Shoulder Apex",
    desc: "Measure from the edge of one shoulder socket across the back to the edge of the opposite shoulder socket.",
  },
  {
    term: "Garment Length",
    desc: "Measured vertically from the highest point of the shoulder seam straight down to the garment hem.",
  },
];

export default function SizeChartModal({ open, onClose }: SizeChartModalProps) {
  const [tab, setTab] = useState<Tab>("women");
  const [unit, setUnit] = useState<Unit>("in");
  const focusRef = useFocusTrap(open);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const isWomen = tab === "women";
  const rows = isWomen ? WOMEN_SIZES : MEN_SIZES;
  const primaryLabel = isWomen ? `Bust (${unit})` : `Chest (${unit})`;
  const cols = [
    "Size",
    primaryLabel,
    `Waist (${unit})`,
    `Hip (${unit})`,
    `Shoulder (${unit})`,
    `Length (${unit})`,
  ];

  return (
    <div
      ref={focusRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-chart-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-espresso/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-brand-primary/15 bg-brand-ivory p-6 shadow-2xl texture-weave sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-brand-primary/10 pb-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-gold">
              N&deg; 00 &mdash; ATELIER FIT &amp; SIZING
            </p>
            <h2
              id="size-chart-title"
              className="mt-1 font-display text-2xl font-bold tracking-tight text-brand-primary sm:text-3xl"
            >
              Size Guide &amp; Measurements
            </h2>
            <p className="mt-1 font-serif text-xs italic text-brand-text/60 sm:text-sm">
              Standard body measurements for handcrafted ethnic silhouettes.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-primary/15 bg-white text-brand-text/60 transition-colors hover:border-brand-primary hover:text-brand-primary"
            aria-label="Close size guide"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Controls: Gender Tabs & Unit Switcher */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Gender Tabs */}
          <div
            className="inline-flex rounded-lg border border-brand-primary/15 bg-brand-parchment/60 p-1"
            role="tablist"
            aria-label="Gender Sizing"
          >
            <button
              role="tab"
              aria-selected={tab === "women"}
              aria-controls="size-chart-panel-women"
              onClick={() => setTab("women")}
              className={`rounded-md px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.12em] transition-all ${
                tab === "women"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-brand-text/60 hover:text-brand-text"
              }`}
            >
              Women&rsquo;s Ethnic
            </button>
            <button
              role="tab"
              aria-selected={tab === "men"}
              aria-controls="size-chart-panel-men"
              onClick={() => setTab("men")}
              className={`rounded-md px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.12em] transition-all ${
                tab === "men"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-brand-text/60 hover:text-brand-text"
              }`}
            >
              Men&rsquo;s Ethnic
            </button>
          </div>

          {/* Unit Switcher */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-text/50">
              Units:
            </span>
            <div className="inline-flex rounded-lg border border-brand-primary/15 bg-brand-parchment/60 p-0.5">
              <button
                type="button"
                onClick={() => setUnit("in")}
                className={`rounded-md px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                  unit === "in"
                    ? "bg-white text-brand-primary shadow-xs"
                    : "text-brand-text/50 hover:text-brand-text"
                }`}
              >
                Inches
              </button>
              <button
                type="button"
                onClick={() => setUnit("cm")}
                className={`rounded-md px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                  unit === "cm"
                    ? "bg-white text-brand-primary shadow-xs"
                    : "text-brand-text/50 hover:text-brand-text"
                }`}
              >
                CM
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div
          id={`size-chart-panel-${tab}`}
          role="tabpanel"
          className="mt-4 overflow-hidden rounded-xl border border-brand-primary/10 bg-white shadow-xs"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" aria-label={`${tab} ethnic size chart`}>
              <thead>
                <tr className="border-b border-brand-primary/10 bg-brand-parchment/40">
                  {cols.map((col) => (
                    <th
                      key={col}
                      className="whitespace-nowrap px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-primary"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-primary/5 font-sans">
                {rows.map((row) => (
                  <tr
                    key={row.size}
                    className="transition-colors hover:bg-brand-parchment/25"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-brand-primary">
                      {row.size}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-text">
                      {row.primary[unit]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-brand-text/80">
                      {row.waist[unit]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-brand-text/80">
                      {row.hip[unit]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-brand-text/80">
                      {row.shoulder[unit]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-brand-text/80">
                      {row.length[unit]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How to Measure Accordion/Guide */}
        <div className="mt-6 rounded-xl border border-brand-primary/10 bg-brand-parchment/40 p-5">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-brand-gold"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
              How to Measure for Bespoke Wear
            </h3>
          </div>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {MEASURING_GUIDE.map((g) => (
              <div key={g.term} className="text-xs">
                <span className="font-semibold text-brand-text">{g.term}: </span>
                <span className="font-serif italic text-brand-text/70">{g.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bespoke Made-to-Measure Notice */}
        <div className="mt-4 rounded-xl border border-brand-gold/30 bg-brand-gold/5 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-sm text-brand-gold">&#10022;</span>
            <p className="font-serif text-xs leading-relaxed text-brand-text/80">
              <strong className="font-sans font-semibold text-brand-primary">
                Custom Tailoring &amp; Fit Guarantee:
              </strong>{" "}
              If you have unique measurements, select{" "}
              <em className="text-brand-primary">&ldquo;Custom / Made-to-Measure&rdquo;</em>{" "}
              in your brief. Our master atelier will reach out to record your exact specifications before handcrafting.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-brand-primary px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-white transition-all hover:bg-brand-primary/90 active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
