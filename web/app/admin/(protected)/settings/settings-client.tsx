"use client";

import { useState, useRef } from "react";
import type { PaymentSettings } from "@/lib/settings";

interface SettingsClientProps {
  initialPayment: PaymentSettings;
}

export function SettingsClient({ initialPayment }: SettingsClientProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState(initialPayment.qrCodeUrl);
  const [upiId, setUpiId] = useState(initialPayment.upiId);
  const [accountName, setAccountName] = useState(initialPayment.accountName);
  const [instructions, setInstructions] = useState(
    initialPayment.instructions,
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadQr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size must be less than 5MB.");
      return;
    }

    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/settings/upload-qr", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to upload QR code");
      }

      const newUrl = json.data.publicUrl;
      setQrCodeUrl(newUrl);
      setSuccessMsg("Payment QR code uploaded and updated successfully!");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to upload QR code",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_qr_url: qrCodeUrl,
          payment_upi_id: upiId,
          payment_account_name: accountName,
          payment_instructions: instructions,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save settings");
      }

      setSuccessMsg("Payment settings saved successfully!");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to save settings",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8 space-y-8">
      {successMsg && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          ✕ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* QR Code Section */}
        <section className="rounded-2xl border border-brand-primary/15 bg-brand-bg p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-brand-primary">
                Payment QR Code
              </h2>
              <p className="mt-1 text-sm text-brand-text/60">
                This QR code is displayed to customers at checkout for UPI
                payments.
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUploadQr}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-60"
              >
                {uploading ? "Uploading to S3..." : "Upload New QR to S3"}
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative flex-none overflow-hidden rounded-xl border-2 border-brand-gold/30 bg-white p-3 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="Current QR Code"
                className="h-44 w-44 object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== "/images/payment-qr.jpeg") {
                    target.src = "/images/payment-qr.jpeg";
                  }
                }}
              />
              <div className="mt-2 text-center">
                <span className="font-mono text-[10px] uppercase text-brand-text/50">
                  Active QR Scanner
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-xs font-medium text-brand-text/70">
                  QR Code Image URL (S3 / Public Path)
                </label>
                <input
                  type="text"
                  value={qrCodeUrl}
                  onChange={(e) => setQrCodeUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-brand-primary/15 bg-white px-3 py-2 text-xs font-mono text-brand-text outline-none focus:border-brand-gold"
                  placeholder="https://aarovi-storage-s3..."
                />
              </div>

              <div className="rounded-lg border border-brand-primary/10 bg-white/60 p-3 text-xs text-brand-text/70">
                <p className="font-medium text-brand-primary">Tips for QR Codes:</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-brand-text/60">
                  <li>Use a square (1:1) PNG or JPEG QR image.</li>
                  <li>Ensure the QR code has clear contrast and is sharp.</li>
                  <li>Clicking &quot;Upload New QR to S3&quot; automatically stores the file on your configured AWS S3 bucket.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* UPI & Merchant Details Section */}
        <section className="rounded-2xl border border-brand-primary/15 bg-brand-bg p-6">
          <h2 className="font-display text-lg font-bold text-brand-primary">
            Merchant & Checkout Details
          </h2>
          <p className="mt-1 text-sm text-brand-text/60">
            Configure the payee name and UPI ID shown next to the QR code.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-brand-text">
                Payee / Account Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Aarovi"
                className="mt-1 w-full rounded-lg border border-brand-primary/15 bg-white px-4 py-2 text-sm text-brand-text outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-text">
                UPI ID (VPA)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. aaroviofficial@oksbi"
                className="mt-1 w-full rounded-lg border border-brand-primary/15 bg-white px-4 py-2 text-sm text-brand-text outline-none focus:border-brand-gold"
              />
              <span className="mt-1 block text-[11px] text-brand-text/50">
                Customers can copy this directly if scanning is inconvenient
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-brand-text">
                Payment Instructions for Customer
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Instructions shown to customer above the proof upload..."
                className="mt-1 w-full rounded-lg border border-brand-primary/15 bg-white px-4 py-2 text-sm text-brand-text outline-none focus:border-brand-gold"
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-primary/90 hover:shadow-md disabled:opacity-60"
          >
            {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
