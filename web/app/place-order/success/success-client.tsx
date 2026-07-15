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
        <h1 className="mt-6 font-display text-3xl font-semibold text-brand-primary">
          Order Placed!
        </h1>
        <p className="mt-2 text-brand-text/60">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        <div className="mt-8 flex items-center gap-2 rounded-lg border border-brand-primary/10 bg-brand-bg px-5 py-3">
          <span className="text-sm text-brand-text/60">Order ID:</span>
          <code className="max-w-[200px] truncate text-sm font-mono text-brand-primary">
            {orderId}
          </code>
          <button
            onClick={handleCopy}
            className="ml-1 flex-shrink-0 text-xs font-medium text-brand-gold transition-colors hover:text-brand-primary"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/status/${orderId}`}
            className="rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
          >
            Track Order
          </Link>
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

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
