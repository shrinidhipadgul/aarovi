import Link from "next/link";
import type { Metadata } from "next";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-6xl font-bold text-brand-primary">404</h1>
      <p className="mt-4 text-xl font-semibold text-brand-text">
        Page not found
      </p>
      <p className="mt-2 text-sm text-brand-text/60">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
        >
          Go Home
        </Link>
        <Link
          href="/shop/collection"
          className="rounded-lg border border-brand-primary/15 px-6 py-3 text-sm font-semibold text-brand-text transition-colors hover:bg-brand-bg"
        >
          Browse Collection
        </Link>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "404 — Page Not Found | Aarovi",
};