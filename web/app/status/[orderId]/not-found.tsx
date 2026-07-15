import Link from "next/link";
import type { Metadata } from "next";

export default function OrderNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-brand-primary">Order Not Found</h1>
      <p className="mt-3 text-brand-text/60">
        We couldn&apos;t find this order. It may have been removed or the link is
        incorrect.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export const metadata: Metadata = {
  title: { absolute: "Order Not Found | Aarovi" },
  description: "This order could not be found. It may have been removed or the link is incorrect.",
};