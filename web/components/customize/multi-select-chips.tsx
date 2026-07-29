"use client";

interface MultiSelectChipsProps {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}

export default function MultiSelectChips({
  options,
  selected,
  onToggle,
}: MultiSelectChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.97] ${
              active
                ? "border-brand-primary bg-brand-primary text-white shadow-sm"
                : "border-brand-primary/10 bg-white text-brand-text hover:border-brand-gold hover:text-brand-primary"
            }`}
          >
            {active && (
              <svg
                className="h-3.5 w-3.5 flex-shrink-0"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m2 7 3 3 7-7" />
              </svg>
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
