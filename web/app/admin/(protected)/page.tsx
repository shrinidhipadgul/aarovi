import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Aarovi admin dashboard.",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-brand-primary">
        Admin Dashboard
      </h1>
      <p className="mt-2 text-sm text-brand-text/60">
        Manage your store from here.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/products"
          className="rounded-xl border border-brand-primary/15 bg-brand-bg p-6 transition-colors hover:border-brand-gold"
        >
          <h2 className="font-display text-lg font-semibold text-brand-primary">
            Products
          </h2>
          <p className="mt-1 text-sm text-brand-text/60">
            Manage your product catalog.
          </p>
        </Link>

        <div className="rounded-xl border border-dashed border-brand-primary/15 bg-brand-bg/50 p-6 opacity-60">
          <h2 className="font-display text-lg font-semibold text-brand-primary">
            More
          </h2>
          <p className="mt-1 text-sm text-brand-text/60">
            Additional modules coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}