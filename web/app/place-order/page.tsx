import type { Metadata } from "next";
import PlaceOrderClient from "./place-order-client";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete your purchase at Aarovi. Secure checkout with multiple payment options.",
  robots: { index: false, follow: false },
};

export default function PlaceOrderPage() {
  return <PlaceOrderClient />;
}
