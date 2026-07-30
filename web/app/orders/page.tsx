import { Suspense } from "react";
import type { Metadata } from "next";
import OrdersClient from "./orders-client";
import OrdersLoading from "./loading";

export const metadata: Metadata = {
  title: "My Orders & Customizations — Aarovi",
  description:
    "View your Aarovi order history and track bespoke customization requests.",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersLoading />}>
      <OrdersClient />
    </Suspense>
  );
}

