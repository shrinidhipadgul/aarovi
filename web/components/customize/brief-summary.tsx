"use client";

import { useStore } from "@nanostores/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  customizeDraft,
  completedSteps,
} from "@/lib/stores/customize";
import { TAXONOMY, getOptionLabel } from "@/lib/customize/taxonomy";
import { getPublicUrl } from "@/lib/uploads/storage";

const TOTAL_STEPS = 7;

function key(prefix: string, id: string): string {
  return `${prefix}-${id}`;
}

interface BriefSummaryProps {
  onSubmit: () => void;
  submitting: boolean;
}

export default function BriefSummary({
  onSubmit,
  submitting,
}: BriefSummaryProps) {
  const draft = useStore(customizeDraft);
  const completed = useStore(completedSteps);

  const selectionGroups = TAXONOMY.filter(
    (g) => g.id !== "occasion" && g.id !== "budget",
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] font-semibold text-brand-primary">
          Your Brief
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.ul
          key={JSON.stringify(draft.selections)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-3"
        >
          {selectionGroups.map((group) => {
            const val = draft.selections[group.id];
            if (!val) return null;

            if (Array.isArray(val) && val.length === 0) return null;

            return (
              <li key={key("summary", group.id)} className="flex justify-between gap-2 border-b border-brand-primary/5 pb-1.5">
                <span className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-brand-text/75">
                  {group.label}
                </span>
                <span className="text-right text-sm font-medium text-brand-text">
                  {Array.isArray(val)
                    ? val.map((v) => getOptionLabel(group.id, v)).join(", ")
                    : getOptionLabel(group.id, val)}
                </span>
              </li>
            );
          })}
        </motion.ul>
      </AnimatePresence>

      {draft.colorMatchReference && (
        <p className="font-serif text-xs italic font-medium text-brand-primary">
          Colour matched to your reference
        </p>
      )}

      <div className="space-y-1.5">
        {draft.occasion && (
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-brand-primary">
            Occasion: <span className="font-sans text-sm font-medium text-brand-text">{getOptionLabel("occasion", draft.occasion)}</span>
          </p>
        )}
        {draft.budgetTier && (
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-brand-primary">
            Budget: <span className="font-sans text-sm font-medium text-brand-text">{getOptionLabel("budget", draft.budgetTier)}</span>
          </p>
        )}
      </div>

      {draft.referenceKeys.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-brand-text/75">
            References ({draft.referenceKeys.length})
          </p>
          <div className="flex gap-1.5">
            {draft.referenceKeys.slice(0, 4).map((k) => (
              <div
                key={key("ref", k)}
                className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-brand-primary/10"
              >
                <img
                  src={getPublicUrl(k)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
            {draft.referenceKeys.length > 4 && (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-brand-primary/10 bg-brand-parchment font-mono text-[10px] font-semibold text-brand-text/70">
                +{draft.referenceKeys.length - 4}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-brand-text/75">
          Progress
        </p>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => {
            const done = completed.has(i + 1);
            return (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  done ? "bg-brand-primary" : "bg-brand-primary/15"
                }`}
              />
            );
          })}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={draft.referenceKeys.length === 0 && !draft.selections.garment}
        className="w-full rounded-lg bg-brand-primary py-3 text-sm font-semibold text-white transition-all hover:bg-brand-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-brand-primary/30 disabled:text-white/50"
      >
        {submitting ? "Submitting…" : "Submit Quote Request"}
      </button>

      <p className="text-center font-serif text-xs italic text-brand-text/65">
        We&rsquo;ll review your brief and respond within 48 hours
      </p>
    </div>
  );
}
