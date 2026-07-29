"use client";

import type { ReactNode } from "react";

interface SwatchOption {
  value: string;
  label: string;
  art?: ReactNode;
}

interface SwatchGridProps {
  options: SwatchOption[];
  selected: string | null;
  onSelect: (value: string) => void;
}

export default function SwatchGrid({
  options,
  selected,
  onSelect,
}: SwatchGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4">
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(active ? "" : opt.value)}
            className={`group flex flex-col items-center gap-2 rounded-xl border p-3 transition-all active:scale-[0.97] ${
              active
                ? "border-brand-primary bg-brand-primary/5 shadow-sm ring-1 ring-brand-primary/20"
                : "border-brand-primary/10 bg-white hover:border-brand-gold"
            }`}
          >
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-lg transition-colors ${
                active
                  ? "text-brand-primary"
                  : "text-brand-text/30 group-hover:text-brand-gold"
              }`}
            >
              {opt.art}
            </div>
            <span
              className={`text-xs font-medium leading-tight text-center ${
                active ? "text-brand-primary" : "text-brand-text/60"
              }`}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
