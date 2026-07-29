import { atom, computed } from "nanostores";
import { useEffect } from "react";

const STORAGE_KEY = "aarovi:customize-draft";

export interface CustomizeDraft {
  selections: Record<string, string | string[]>;
  colorMatchReference: boolean;
  notes: string;
  occasion: string;
  budgetTier: string;
  requiredBy: string | null;
  referenceKeys: string[];
}

function emptyDraft(): CustomizeDraft {
  return {
    selections: {},
    colorMatchReference: false,
    notes: "",
    occasion: "",
    budgetTier: "",
    requiredBy: null,
    referenceKeys: [],
  };
}

export const customizeDraft = atom<CustomizeDraft>(emptyDraft());

export function useSyncCustomizeDraft() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        customizeDraft.set({
          selections: parsed.selections ?? {},
          colorMatchReference: Boolean(parsed.colorMatchReference),
          notes: typeof parsed.notes === "string" ? parsed.notes : "",
          occasion: typeof parsed.occasion === "string" ? parsed.occasion : "",
          budgetTier: typeof parsed.budgetTier === "string" ? parsed.budgetTier : "",
          requiredBy: typeof parsed.requiredBy === "string" ? parsed.requiredBy : null,
          referenceKeys: Array.isArray(parsed.referenceKeys) ? parsed.referenceKeys : [],
        });
      }
    } catch {
      // ignore JSON parse or localStorage errors
    }
  }, []);
}

function persist(draft: CustomizeDraft) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function setSelection(groupId: string, value: string | string[]) {
  const prev = customizeDraft.get();
  const next: CustomizeDraft = {
    ...prev,
    selections: { ...prev.selections, [groupId]: value },
  };
  customizeDraft.set(next);
  persist(next);
}

export function clearSelection(groupId: string) {
  const prev = customizeDraft.get();
  const next = { ...prev, selections: { ...prev.selections } };
  delete next.selections[groupId];
  customizeDraft.set(next);
  persist(next);
}

export function setColorMatchReference(value: boolean) {
  const prev = customizeDraft.get();
  const next = { ...prev, colorMatchReference: value };
  if (value) {
    const s = { ...next.selections };
    delete s.color;
    next.selections = s;
  }
  customizeDraft.set(next);
  persist(next);
}

export function setNotes(value: string) {
  const prev = customizeDraft.get();
  const next = { ...prev, notes: value };
  customizeDraft.set(next);
  persist(next);
}

export function setOccasion(value: string) {
  const prev = customizeDraft.get();
  const next = { ...prev, occasion: value };
  customizeDraft.set(next);
  persist(next);
}

export function setBudgetTier(value: string) {
  const prev = customizeDraft.get();
  const next = { ...prev, budgetTier: value };
  customizeDraft.set(next);
  persist(next);
}

export function setRequiredBy(value: string | null) {
  const prev = customizeDraft.get();
  const next = { ...prev, requiredBy: value };
  customizeDraft.set(next);
  persist(next);
}

export function addReferenceKey(key: string) {
  const prev = customizeDraft.get();
  if (prev.referenceKeys.length >= 5) return;
  const next = {
    ...prev,
    referenceKeys: [...prev.referenceKeys, key],
  };
  customizeDraft.set(next);
  persist(next);
}

export function removeReferenceKey(key: string) {
  const prev = customizeDraft.get();
  const next = {
    ...prev,
    referenceKeys: prev.referenceKeys.filter((k) => k !== key),
  };
  customizeDraft.set(next);
  persist(next);
}

export function clearDraft() {
  customizeDraft.set(emptyDraft());
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const isDraftDirty = computed(customizeDraft, (draft) => {
  return (
    Object.keys(draft.selections).length > 0 ||
    draft.referenceKeys.length > 0 ||
    draft.notes.length > 0 ||
    draft.occasion.length > 0 ||
    draft.budgetTier.length > 0
  );
});

export const completedSteps = computed(customizeDraft, (draft) => {
  const steps = new Set<number>();
  if (draft.selections.garment) steps.add(1);
  if (draft.selections.silhouette || draft.selections.length) steps.add(2);
  if (draft.selections.neckline) steps.add(3);
  if (draft.selections.sleeve) steps.add(4);
  if (draft.selections.fabric || draft.selections.color || draft.colorMatchReference)
    steps.add(5);
  if (draft.selections.embellishment) steps.add(6);
  if (
    draft.selections.occasion ||
    draft.occasion ||
    draft.budgetTier ||
    draft.notes.length > 0 ||
    draft.referenceKeys.length > 0
  )
    steps.add(7);
  return steps;
});
