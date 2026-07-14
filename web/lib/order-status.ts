export const ORDER_STATUSES = [
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface TimelineStep {
  key: OrderStatus;
  label: string;
  state: "completed" | "current" | "upcoming";
}

const FULL_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Order Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function statusLabel(status: string): string {
  return FULL_STATUS_LABELS[status] ?? status;
}

const STATUS_BADGE_COLORS: Record<string, string> = {
  pending:
    "border-orange-200 bg-orange-100 text-orange-700",
  confirmed: "border-blue-200 bg-blue-100 text-blue-700",
  processing:
    "border-amber-200 bg-amber-100 text-amber-700",
  shipped:
    "border-purple-200 bg-purple-100 text-purple-700",
  out_for_delivery:
    "border-indigo-200 bg-indigo-100 text-indigo-700",
  delivered:
    "border-green-200 bg-green-100 text-green-700",
  cancelled: "border-red-200 bg-red-100 text-red-700",
};

export function statusBadgeColor(status: string): string {
  return STATUS_BADGE_COLORS[status] ?? "border-brand-primary/10 bg-brand-bg text-brand-text/60";
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function getTimeline(currentStatus: string): TimelineStep[] {
  const currentIndex = isOrderStatus(currentStatus)
    ? ORDER_STATUSES.indexOf(currentStatus)
    : -1;

  return ORDER_STATUSES.map((key, index) => {
    let state: TimelineStep["state"];
    if (currentIndex === -1 || index < currentIndex) {
      state = "completed";
    } else if (index === currentIndex) {
      state = "current";
    } else {
      state = "upcoming";
    }
    return { key, label: FULL_STATUS_LABELS[key] ?? key, state };
  });
}

export function isTerminalStatus(status: string): boolean {
  return status === "delivered" || status === "cancelled";
}