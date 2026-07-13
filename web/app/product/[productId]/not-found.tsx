import Link from "next/link";
import type { Metadata } from "next";

export default function ProductNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-brand-primary">Product Not Found</h1>
      <p className="mt-3 text-brand-text/60">
        The product you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/shop/collection"
        className="mt-8 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Product Not Found — Aarovi",
};
