export const ORDER_STATUSES = [
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: "Order Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

export interface TimelineStep {
  key: OrderStatus;
  label: string;
  state: "completed" | "current" | "upcoming";
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function statusLabel(status: string): string {
  return isOrderStatus(status) ? STATUS_LABELS[status] : status;
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
    return { key, label: STATUS_LABELS[key], state };
  });
}

export function isTerminalStatus(status: string): boolean {
  return status === "delivered";
}