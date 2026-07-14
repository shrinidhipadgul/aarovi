"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-brand-primary">
          Order Placed Successfully!
        </h1>
        <p className="mt-3 text-sm text-brand-text/60">
          Thank you for your order. We&apos;ve received it and will start
          processing it right away.
        </p>

        {orderId && (
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-brand-primary/10 bg-brand-bg px-4 py-3">
            <div className="text-left">
              <p className="text-xs text-brand-text/60">Order ID</p>
              <p className="text-sm font-medium text-brand-text">{orderId}</p>
            </div>
            <button
              onClick={handleCopy}
              className="rounded-md border border-brand-primary/15 px-2.5 py-1.5 text-xs text-brand-text/70 transition-colors hover:bg-white"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {orderId && (
            <Link
              href={`/status/${orderId}`}
              className="rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
            >
              Track Order
            </Link>
          )}
          <Link
            href="/shop/collection"
            className="rounded-lg border border-brand-primary/15 px-6 py-3 text-sm font-semibold text-brand-text transition-colors hover:bg-brand-bg"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <SuccessContent />
    </Suspense>
  );
}