"use client";

import { useState, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  customizeDraft,
  useSyncCustomizeDraft,
  setSelection,
  setColorMatchReference,
  setNotes,
  setOccasion,
  setBudgetTier,
} from "@/lib/stores/customize";
import { TAXONOMY, type CustomizeGroup } from "@/lib/customize/taxonomy";
import { getNecklineArt, getSleeveArt } from "./line-art";
import BriefSummary from "./brief-summary";
import OptionGrid from "./option-grid";
import SwatchGrid from "./swatch-grid";
import MultiSelectChips from "./multi-select-chips";
import ReferenceUploader from "./reference-uploader";
import SizeChartModal from "@/components/size-chart-modal";

export default function BriefBuilder() {
  useSyncCustomizeDraft();
  const router = useRouter();
  const draft = useStore(customizeDraft);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

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
    setSubmitError(null);

    try {
      const res = await fetch("/api/customize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garment: draft.selections.garment ?? "",
          selections: draft.selections ?? {},
          colorMatchReference: draft.colorMatchReference ?? false,
          notes: draft.notes ?? "",
          occasion: draft.occasion ?? "",
          budgetTier: draft.budgetTier ?? "",
          requiredBy: draft.requiredBy ?? null,
          referenceKeys: Array.isArray(draft.referenceKeys) ? draft.referenceKeys : [],
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        let msg = json?.message || `Submission failed with status ${res.status}`;
        if (json?.errors) {
          const errMsgs = Object.values(json.errors).flat() as string[];
          if (errMsgs.length > 0) {
            msg = errMsgs.join(". ");
          }
        }
        setSubmitError(msg);
        console.error("Customize submit failed:", res.status, json);
        return;
      }

      const requestId = json?.data?.id as string;
      if (requestId) {
        router.push(`/customize/confirmation?id=${encodeURIComponent(requestId)}`);
      } else {
        router.push("/customize/confirmation");
      }
    } catch (err) {
      console.error("Customize submit network/unexpected error:", err);
      setSubmitError("An unexpected error occurred. Please try again.");
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
        const isCustom = Boolean(selected && selected.startsWith("#"));
        const customHex = isCustom ? selected! : "#e1a95f";

        return (
          <div className="flex flex-wrap items-center gap-3">
            {group.options.map((opt) => {
              const hex = (opt.meta?.hex as string) ?? "#ccc";
              const active = selected === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSingleSelect(group.id, opt.value)}
                  className="flex flex-col items-center gap-2 transition-all active:scale-[0.97]"
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

            {/* Custom Color Selector (Luxury Spectrum Wheel) */}
            <label className="group/color relative flex flex-col items-center gap-2 cursor-pointer transition-all active:scale-[0.96]">
              <input
                type="color"
                value={customHex}
                onChange={(e) => handleSingleSelect(group.id, e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 overflow-hidden transition-all duration-300 shadow-sm ${
                  isCustom
                    ? "border-brand-primary ring-2 ring-brand-primary/20 scale-110"
                    : "border-brand-primary/20 group-hover/color:border-brand-gold group-hover/color:shadow-md"
                }`}
                style={{
                  backgroundColor: isCustom ? customHex : "transparent",
                }}
                title="Custom Color Picker"
              >
                {!isCustom && (
                  <>
                    <div
                      className="absolute -inset-2 rounded-full transition-transform duration-300 scale-125 group-hover/color:scale-150"
                      style={{
                        background:
                          "conic-gradient(from 0deg, #E8B4B8, #D4A017, #2A6F40, #1B2A4A, #6B2D5C, #D87093, #E8B4B8)",
                      }}
                    />
                    <div className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary/80 backdrop-blur-[2px] shadow-sm transition-transform duration-300 group-hover/color:scale-110">
                      <svg
                        className="h-3 w-3 text-brand-ivory"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </div>
                  </>
                )}
              </div>
              <span
                className={`text-[10px] font-medium uppercase tracking-[0.1em] transition-colors ${
                  isCustom ? "text-brand-primary font-semibold" : "text-brand-text/50 group-hover/color:text-brand-primary"
                }`}
              >
                {isCustom ? customHex.toUpperCase() : "Custom"}
              </span>
            </label>
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

  const stepGroups = [1, 2, 3, 4, 5, 6]
    .map((step) => TAXONOMY.filter((g) => g.step === step))
    .filter((g) => g.length > 0);

  return (
    <div
      id="brief-builder"
      className="bg-brand-ivory texture-weave px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center">
          {/* Atelier Header Banner */}
          <div className="mb-12 max-w-3xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-brand-gold">
              N&deg; 00 &mdash; BESPOKE COMMISSIONS
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-brand-primary sm:text-4xl lg:text-5xl">
              Craft Your Bespoke Brief
            </h1>
            <p className="mx-auto mt-3 max-w-xl font-serif text-base italic leading-relaxed text-brand-text/70 sm:text-lg">
              Every garment is cut, dyed, and embroidered by hand. Select your specifications below or consult our atelier sizing guide.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setSizeChartOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 bg-brand-parchment/60 px-5 py-2 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-brand-primary shadow-xs transition-all duration-200 hover:border-brand-primary hover:bg-white active:scale-[0.98]"
              >
                <svg
                  className="h-3.5 w-3.5 text-brand-gold"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Atelier Size Chart &amp; Fit Guide &rarr;
              </button>
            </div>
          </div>

          {/* Steps & Options Container */}
          <div className="w-full max-w-5xl">
            <div className="space-y-16">
              {stepGroups.map((groups, stepIdx) => (
                <div
                  key={stepIdx}
                  className={`grid gap-8 ${
                    groups.length === 3
                      ? "grid-cols-1 md:grid-cols-3"
                      : groups.length === 2
                        ? "grid-cols-1 md:grid-cols-2"
                        : "grid-cols-1"
                  }`}
                >
                  {groups.map((group) => (
                    <div key={group.id} className="flex flex-col">
                      <div className="mb-4 flex items-baseline justify-between gap-2">
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

                        {group.id === "size" && (
                          <button
                            type="button"
                            onClick={() => setSizeChartOpen(true)}
                            className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-gold underline-offset-2 hover:text-brand-primary hover:underline"
                          >
                            <svg
                              className="h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Size Guide
                          </button>
                        )}
                      </div>

                      <div className="flex-1 rounded-2xl border border-brand-primary/10 bg-white p-6 shadow-sm">
                        {renderGroup(group)}

                        {group.id === "color" && (
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

                {/* Step 7: Occasion, Budget, Notes & References */}
                <div className="space-y-8 rounded-2xl border border-brand-primary/10 bg-white p-6 shadow-sm sm:p-8">
                  <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-gold">
                    N&deg; 07 &mdash; OCCASION &amp; BRIEF
                  </p>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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
                </div>

                {/* Brief Summary centered at the bottom of options */}
                <div className="mx-auto max-w-2xl pt-6">
                  <BriefSummary
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    error={submitError}
                  />
                </div>

                <div className="h-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Atelier Size Chart Modal */}
        <SizeChartModal
          open={sizeChartOpen}
          onClose={() => setSizeChartOpen(false)}
        />
      </div>
  );
}
