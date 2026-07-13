"use client";

import { useState, useEffect, useCallback } from "react";

interface SizeChartModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "women" | "men";

const WOMEN_SIZES = [
  { size: "XS", bust: "30-31", waist: "24-25", hip: "33-34", length: "36" },
  { size: "S", bust: "32-33", waist: "26-27", hip: "35-36", length: "37" },
  { size: "M", bust: "34-35", waist: "28-29", hip: "37-38", length: "38" },
  { size: "L", bust: "36-37", waist: "30-31", hip: "39-40", length: "39" },
  { size: "XL", bust: "38-40", waist: "32-34", hip: "41-43", length: "40" },
  { size: "XXL", bust: "41-43", waist: "35-37", hip: "44-46", length: "41" },
];

const MEN_SIZES = [
  { size: "S", chest: "36-37", waist: "30-31", hip: "36-37", length: "27" },
  { size: "M", chest: "38-39", waist: "32-33", hip: "38-39", length: "28" },
  { size: "L", chest: "40-41", waist: "34-35", hip: "40-41", length: "29" },
  { size: "XL", chest: "42-43", waist: "36-38", hip: "42-43", length: "30" },
  { size: "XXL", chest: "44-46", waist: "39-41", hip: "44-46", length: "31" },
];

export default function SizeChartModal({ open, onClose }: SizeChartModalProps) {
  const [tab, setTab] = useState<Tab>("women");

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
  const cols = isWomen
    ? ["Size", "Bust (in)", "Waist (in)", "Hip (in)", "Length (in)"]
    : ["Size", "Chest (in)", "Waist (in)", "Hip (in)", "Length (in)"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-primary">
            Size Guide
          </h2>
          <button
            onClick={onClose}
            className="text-brand-text/60 transition-colors hover:text-brand-text"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-4 border-b border-brand-primary/10">
          {(["women", "men"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "border-b-2 border-brand-primary text-brand-primary"
                  : "text-brand-text/50 hover:text-brand-text"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-primary/10">
                {cols.map((col) => (
                  <th
                    key={col}
                    className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-brand-text/50"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.size}
                  className="border-b border-brand-primary/5 last:border-0"
                >
                  {(["size", isWomen ? "bust" : "chest", "waist", "hip", "length"] as const).map((key) => (
                      <td
                        key={key}
                        className="whitespace-nowrap px-3 py-2.5 text-brand-text/80"
                      >
                        {(row as Record<string, string>)[key]}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-brand-text/50">
          Measurements in inches. For best fit, measure your body and compare
          with this chart. If between sizes, size up.
        </p>
      </div>
    </div>
  );
}
