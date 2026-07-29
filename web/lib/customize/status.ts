export const CUSTOMIZATION_STATUSES = [
  "SUBMITTED",
  "REVIEWING",
  "QUOTED",
  "ACCEPTED",
  "IN_PRODUCTION",
  "COMPLETED",
  "DECLINED",
] as const;

export type CustomizationStatus = (typeof CUSTOMIZATION_STATUSES)[number];

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  REVIEWING: "Reviewing",
  QUOTED: "Quoted",
  ACCEPTED: "Accepted",
  IN_PRODUCTION: "In Production",
  COMPLETED: "Completed",
  DECLINED: "Declined",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

const STATUS_BADGE_COLORS: Record<string, string> = {
  SUBMITTED: "border-blue-200 bg-blue-100 text-blue-700",
  REVIEWING: "border-amber-200 bg-amber-100 text-amber-700",
  QUOTED: "border-purple-200 bg-purple-100 text-purple-700",
  ACCEPTED: "border-green-200 bg-green-100 text-green-700",
  IN_PRODUCTION: "border-orange-200 bg-orange-100 text-orange-700",
  COMPLETED: "border-green-300 bg-green-200 text-green-800",
  DECLINED: "border-red-200 bg-red-100 text-red-700",
};

export function statusBadgeColor(status: string): string {
  return (
    STATUS_BADGE_COLORS[status] ??
    "border-brand-primary/10 bg-brand-bg text-brand-text/60"
  );
}

export function isCustomizationStatus(
  value: string,
): value is CustomizationStatus {
  return (CUSTOMIZATION_STATUSES as readonly string[]).includes(value);
}
