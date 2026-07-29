import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  CUSTOMIZATION_STATUSES,
  statusLabel,
  statusBadgeColor,
} from "@/lib/customize/status";
import { getOptionLabel } from "@/lib/customize/taxonomy";

export const metadata: Metadata = {
  title: "Bespoke Briefs",
  description: "Manage customisation requests — Aarovi admin.",
  robots: { index: false, follow: false },
};

export default async function AdminCustomizeListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusFilter } = await searchParams;

  const where: Record<string, unknown> = {};
  if (statusFilter && CUSTOMIZATION_STATUSES.includes(statusFilter as (typeof CUSTOMIZATION_STATUSES)[number])) {
    where.status = statusFilter;
  }

  const requests = await prisma.customizationRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { media: true } },
    },
  });

  const allStatus = await prisma.customizationRequest.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const statusCounts: Record<string, number> = {};
  for (const s of allStatus) {
    statusCounts[s.status] = s._count.status;
  }

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-brand-primary">
        Bespoke Briefs
      </h1>
      <p className="mt-1 text-sm text-brand-text/60">
        {requests.length} brief{requests.length !== 1 ? "s" : ""}
        {statusFilter ? ` — ${statusLabel(statusFilter)}` : ""}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/customize"
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            !statusFilter
              ? "border-brand-primary bg-brand-primary text-white"
              : "border-brand-primary/15 bg-white text-brand-text/60 hover:border-brand-gold"
          }`}
        >
          All ({requests.length})
        </Link>
        {CUSTOMIZATION_STATUSES.map((s) => {
          const active = statusFilter === s;
          const count = statusCounts[s] ?? 0;
          return (
            <Link
              key={s}
              href={`/admin/customize?status=${encodeURIComponent(s)}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-brand-primary bg-brand-primary text-white"
                  : "border-brand-primary/15 bg-white text-brand-text/60 hover:border-brand-gold"
              }`}
            >
              {statusLabel(s)} ({count})
            </Link>
          );
        })}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-brand-primary/15">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-primary/10 bg-brand-bg text-left">
              <th className="px-4 py-3 font-semibold text-brand-primary">
                Brief
              </th>
              <th className="px-4 py-3 font-semibold text-brand-primary">
                Customer
              </th>
              <th className="px-4 py-3 font-semibold text-brand-primary">
                Garment
              </th>
              <th className="px-4 py-3 font-semibold text-brand-primary">
                Occasion
              </th>
              <th className="px-4 py-3 font-semibold text-brand-primary">
                Budget
              </th>
              <th className="px-4 py-3 font-semibold text-brand-primary">
                Status
              </th>
              <th className="px-4 py-3 font-semibold text-brand-primary">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-brand-text/40"
                >
                  No briefs found.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-brand-primary/5 transition-colors hover:bg-brand-bg/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customize/${r.id}`}
                      className="font-mono text-xs text-brand-primary underline-offset-2 hover:underline"
                    >
                      {r.id.slice(-8)}
                    </Link>
                    {r._count.media > 0 && (
                      <span className="ml-1.5 text-[10px] text-brand-text/30">
                        +{r._count.media}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-brand-text/70">
                    {r.user?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-brand-text">
                    {getOptionLabel("garment", r.garment) ?? r.garment}
                  </td>
                  <td className="px-4 py-3 text-brand-text/60">
                    {r.occasion
                      ? (getOptionLabel("occasion", r.occasion) ?? r.occasion)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-brand-text/60">
                    {r.budgetTier
                      ? (getOptionLabel("budget", r.budgetTier) ?? r.budgetTier)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusBadgeColor(r.status)}`}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-text/40">
                    {formatDate(r.createdAt.toISOString())}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
