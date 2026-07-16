"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function FailureContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const reason = searchParams.get("reason") ?? "";

  const retryHref = orderId
    ? `/place-order?retry=${encodeURIComponent(orderId)}`
    : "/place-order";

  return (
    <div className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-brand-primary">
          Payment Failed
        </h1>
        <p className="mt-2 text-brand-text/60">
          {reason
            ? `Reason: ${reason}`
            : "Your payment could not be processed. Please try again or choose a different payment method."}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href={retryHref}
            className="rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
          >
            Try Again
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-brand-primary/15 px-6 py-3 text-sm font-semibold text-brand-text transition-colors hover:bg-brand-bg"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FailurePage() {
  return (
    <Suspense fallback={null}>
      <FailureContent />
    </Suspense>
  );
}
