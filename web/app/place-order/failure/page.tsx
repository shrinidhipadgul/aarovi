import type { Metadata } from "next";
import FailureClient from "./failure-client";

export const metadata: Metadata = {
  title: "Payment Failed",
  description: "Your payment could not be processed. Please try again or choose a different payment method.",
  robots: { index: false, follow: false },
};

export default function FailurePage() {
  return <FailureClient />;
}
