"use client";

interface OptionGridProps {
  options: { value: string; label: string }[];
  selected: string | null;
  onSelect: (value: string) => void;
}

export default function OptionGrid({
  options,
  selected,
  onSelect,
}: OptionGridProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(active ? "" : opt.value)}
            className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.97] ${
              active
                ? "border-brand-primary bg-brand-primary text-white shadow-sm"
                : "border-brand-primary/10 bg-white text-brand-text hover:border-brand-gold hover:text-brand-primary"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
