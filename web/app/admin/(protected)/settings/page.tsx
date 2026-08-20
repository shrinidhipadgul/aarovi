import type { Metadata } from "next";
import { getPaymentSettings } from "@/lib/settings";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = {
  title: "Store & Payment Settings",
  description: "Manage payment QR code and store configuration — Aarovi admin.",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const paymentSettings = await getPaymentSettings();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-brand-primary">
        Store & Payment Settings
      </h1>
      <p className="mt-1 text-sm text-brand-text/60">
        Manage your manual UPI payment QR code, UPI ID, and checkout details.
      </p>

      <SettingsClient initialPayment={paymentSettings} />
    </div>
  );
}
