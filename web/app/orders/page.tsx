import type { Metadata } from "next";
import OrdersClient from "./orders-client";

export const metadata: Metadata = {
  title: "My Orders",
  description:
    "View your Aarovi order history and track current orders.",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return <OrdersClient />;
}
