import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  statusLabel,
  statusBadgeColor,
} from "@/lib/customize/status";
import { getOptionLabel } from "@/lib/customize/taxonomy";
import { getPublicUrl } from "@/lib/uploads/storage";
import { CustomizeDetailClient } from "./customize-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Brief ${id.slice(-8)}`,
    description: "View and respond to a bespoke brief — Aarovi admin.",
    robots: { index: false, follow: false },
  };
}

export default async function AdminCustomizeDetailPage({ params }: Props) {
  const { id } = await params;

  const request = await prisma.customizationRequest.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true } },
      media: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!request) notFound();

  const spec = request.spec as Record<string, unknown>;
  const selections = (spec?.selections ?? {}) as Record<string, string | string[]>;

  const resolvedSelections: Record<string, string> = {};
  for (const [groupId, value] of Object.entries(selections)) {
    if (Array.isArray(value)) {
      resolvedSelections[groupId] = value
        .map((v) => getOptionLabel(groupId, v))
        .join(", ");
    } else {
      resolvedSelections[groupId] = getOptionLabel(groupId, value);
    }
  }

  const garment = getOptionLabel("garment", request.garment) ?? request.garment;

  const initialData = {
    id: request.id,
    userId: request.userId,
    userEmail: request.user?.email ?? null,
    userName: request.user?.name ?? null,
    garment,
    spec: {
      selections: resolvedSelections,
      colorMatchReference: (spec?.colorMatchReference as boolean) ?? false,
    },
    notes: request.notes,
    occasion: request.occasion
      ? (getOptionLabel("occasion", request.occasion) ?? request.occasion)
      : null,
    budgetTier: request.budgetTier
      ? (getOptionLabel("budget", request.budgetTier) ?? request.budgetTier)
      : null,
    requiredBy: request.requiredBy?.toISOString() ?? null,
    status: request.status,
    statusLabel: statusLabel(request.status),
    badgeColor: statusBadgeColor(request.status),
    quotedPrice: request.quotedPrice,
    adminNotes: request.adminNotes,
    media: request.media.map((m) => ({
      id: m.id,
      key: m.key,
      url: getPublicUrl(m.key),
      contentType: m.contentType,
    })),
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };

  return (
    <div>
      <Link
        href="/admin/customize"
        className="mb-6 inline-flex items-center gap-1 text-sm text-brand-text/60 transition-colors hover:text-brand-primary"
      >
        <span aria-hidden>&larr;</span> Back to briefs
      </Link>
      <CustomizeDetailClient initialData={initialData} />
    </div>
  );
}
