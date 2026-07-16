import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Aarovi admin dashboard.",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const [totalProducts, outOfStock, categories] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, inStock: false } }),
    prisma.category.count(),
  ]);

  const stats = [
    { label: "Total Products", value: totalProducts },
    { label: "Out of Stock", value: outOfStock },
    { label: "Categories", value: categories },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-brand-primary">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-brand-text/60">
        Welcome to your store dashboard.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-brand-primary/15 bg-brand-bg p-6"
          >
            <p className="text-sm font-medium text-brand-text/60">{stat.label}</p>
            <p className="mt-1 font-display text-3xl font-semibold text-brand-primary">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

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
            Orders (Coming Soon)
          </h2>
          <p className="mt-1 text-sm text-brand-text/60">
            View and manage orders.
          </p>
        </div>
      </div>
    </div>
  );
}