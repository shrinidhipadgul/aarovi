"use client";

import { useState, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  customizeDraft,
  setSelection,
  setColorMatchReference,
  setNotes,
  setOccasion,
  setBudgetTier,
  setRequiredBy,
} from "@/lib/stores/customize";
import { TAXONOMY, type CustomizeGroup } from "@/lib/customize/taxonomy";
import { getNecklineArt, getSleeveArt } from "./line-art";
import CustomizeHero from "./customize-hero";
import BriefSummary from "./brief-summary";
import OptionGrid from "./option-grid";
import SwatchGrid from "./swatch-grid";
import MultiSelectChips from "./multi-select-chips";
import ReferenceUploader from "./reference-uploader";

export default function BriefBuilder() {
  const router = useRouter();
  const draft = useStore(customizeDraft);
  const [submitting, setSubmitting] = useState(false);

  const { data: session } = authClient.useSession();

  const getSelected = useCallback(
    (groupId: string): string | null => {
      const val = draft.selections[groupId];
      return typeof val === "string" ? val : null;
    },
    [draft.selections],
  );

  const getMultiSelected = useCallback(
    (groupId: string): string[] => {
      const val = draft.selections[groupId];
      return Array.isArray(val) ? val : [];
    },
    [draft.selections],
  );

  const handleSingleSelect = useCallback(
    (groupId: string, value: string) => {
      if (value === "") {
        const next = { ...draft.selections };
        delete next[groupId];
        customizeDraft.set({ ...draft, selections: next });
      } else {
        setSelection(groupId, value);
      }
    },
    [draft],
  );

  const handleMultiToggle = useCallback(
    (groupId: string, value: string) => {
      const current = getMultiSelected(groupId);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setSelection(groupId, next);
    },
    [getMultiSelected],
  );

  const handleSubmit = useCallback(async () => {
    if (!session) {
      router.push(`/sign-in?callbackURL=${encodeURIComponent("/customize")}`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/customize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garment: draft.selections.garment ?? "",
          selections: draft.selections,
          colorMatchReference: draft.colorMatchReference,
          notes: draft.notes,
          occasion: draft.occasion,
          budgetTier: draft.budgetTier,
          requiredBy: draft.requiredBy,
          referenceKeys: draft.referenceKeys,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        console.error("Customize submit failed", json);
        setSubmitting(false);
        return;
      }

      const requestId = json.data?.id as string;
      if (requestId) {
        router.push(`/customize/confirmation?id=${encodeURIComponent(requestId)}`);
      } else {
        router.push("/customize/confirmation");
      }
    } catch {
      // stay on page, let user retry
    } finally {
      setSubmitting(false);
    }
  }, [session, router, draft]);

  const renderGroup = (group: CustomizeGroup) => {
    const selected = getSelected(group.id);
    const multiSelected = getMultiSelected(group.id);

    switch (group.kind) {
      case "swatch": {
        const opts = group.options.map((o) => ({
          value: o.value,
          label: o.label,
          art:
            group.id === "neckline"
              ? getNecklineArt(o.value)
              : group.id === "sleeve"
                ? getSleeveArt(o.value)
                : null,
        }));
        return (
          <SwatchGrid
            options={opts}
            selected={selected}
            onSelect={(v) => handleSingleSelect(group.id, v)}
          />
        );
      }
      case "color": {
        if (draft.colorMatchReference) {
          return (
            <p className="font-serif text-sm italic text-brand-text/40">
              Using colour from your reference image.
            </p>
          );
        }
        return (
          <div className="flex flex-wrap gap-3">
            {group.options.map((opt) => {
              const hex = (opt.meta?.hex as string) ?? "#ccc";
              const active = selected === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSingleSelect(group.id, opt.value)}
                  className={`flex flex-col items-center gap-2 transition-all active:scale-[0.97]`}
                >
                  <div
                    className={`h-10 w-10 rounded-full border-2 transition-all ${
                      active
                        ? "border-brand-primary ring-2 ring-brand-primary/20 scale-110"
                        : "border-brand-primary/10 hover:border-brand-gold"
                    }`}
                    style={{ backgroundColor: hex }}
                    title={opt.label}
                  />
                  <span
                    className={`text-[10px] font-medium uppercase tracking-[0.1em] ${
                      active ? "text-brand-primary" : "text-brand-text/40"
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
      case "multi":
        return (
          <MultiSelectChips
            options={group.options}
            selected={multiSelected}
            onToggle={(v) => handleMultiToggle(group.id, v)}
          />
        );
      default:
        return (
          <OptionGrid
            options={group.options}
            selected={selected}
            onSelect={(v) => handleSingleSelect(group.id, v)}
          />
        );
    }
  };

  const stepGroups = [1, 2, 3, 4, 5, 6, 7]
    .map((step) => TAXONOMY.filter((g) => g.step === step))
    .filter((g) => g.length > 0);

  return (
    <>
      <CustomizeHero />
      <div
        id="brief-builder"
        className="bg-brand-ivory texture-weave px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16">
            {/* Right: step stack (rendered first on mobile, second on lg) */}
            <div className="order-1 lg:order-2 lg:col-span-7 lg:col-start-6">
              <div className="space-y-16">
                {stepGroups.map((groups, stepIdx) => (
                  <div key={stepIdx} className="space-y-10">
                    {groups.map((group) => (
                      <div key={group.id}>
                        <div className="mb-4 flex items-baseline justify-between">
                          <div>
                            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-gold">
                              N&deg; {String(group.step).padStart(2, "0")} &mdash;{" "}
                              {group.label}
                            </p>
                            {group.kind === "multi" && (
                              <p className="mt-1 font-serif text-xs italic text-brand-text/30">
                                Select all that apply
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-brand-primary/10 bg-white p-6 shadow-sm">
                          {renderGroup(group)}

                          {group.id === "fabric" && (
                            <div className="mt-4 border-t border-brand-primary/5 pt-4">
                              <label className="flex cursor-pointer items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={draft.colorMatchReference}
                                  onChange={(e) =>
                                    setColorMatchReference(e.target.checked)
                                  }
                                  className="h-4 w-4 rounded border-brand-primary/15 text-brand-primary focus:ring-brand-gold"
                                />
                                <span className="text-sm text-brand-text/60">
                                  Match colour to my reference image instead
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Step 7 extras: Occasion, Budget, Notes, Required by, References */}
                <div className="space-y-6 rounded-2xl border border-brand-primary/10 bg-white p-6 shadow-sm">
                  <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-gold">
                    N&deg; 07 &mdash; OCCASION &amp; BRIEF
                  </p>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-brand-text">
                      Occasion
                    </p>
                    <OptionGrid
                      options={
                        TAXONOMY.find((g) => g.id === "occasion")?.options ?? []
                      }
                      selected={draft.occasion}
                      onSelect={(v) =>
                        setOccasion(draft.occasion === v ? "" : v)
                      }
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-brand-text">
                      Budget Preference
                    </p>
                    <OptionGrid
                      options={
                        TAXONOMY.find((g) => g.id === "budget")?.options ?? []
                      }
                      selected={draft.budgetTier}
                      onSelect={(v) =>
                        setBudgetTier(draft.budgetTier === v ? "" : v)
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-brand-text">
                      Needed By
                    </label>
                    <input
                      type="date"
                      value={draft.requiredBy ?? ""}
                      onChange={(e) =>
                        setRequiredBy(e.target.value || null)
                      }
                      className="w-full rounded-lg border border-brand-primary/15 bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-brand-text">
                      Additional Notes
                    </label>
                    <textarea
                      rows={4}
                      value={draft.notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Tell us about your vision — fabric preferences, colour combinations, inspiration, event details, sizing notes…"
                      className="w-full rounded-lg border border-brand-primary/15 bg-brand-bg px-4 py-2.5 font-serif text-sm italic text-brand-text outline-none transition-colors placeholder:text-brand-text/20 focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-brand-text">
                      Reference Images
                    </p>
                    <p className="mb-3 font-serif text-xs italic text-brand-text/30">
                      Upload photos, sketches, or inspiration (up to 5).
                    </p>
                    <ReferenceUploader references={draft.referenceKeys} />
                  </div>
                </div>

                {/* Mobile submit (lg hides the sticky panel) */}
                <div className="lg:hidden">
                  <BriefSummary onSubmit={handleSubmit} submitting={submitting} />
                </div>

                <div className="h-16" />
              </div>
            </div>

            {/* Left: sticky summary (lg only) */}
            <div className="order-2 hidden lg:col-span-4 lg:col-start-1 lg:block">
              <div className="sticky top-28">
                <BriefSummary onSubmit={handleSubmit} submitting={submitting} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
