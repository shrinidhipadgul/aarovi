import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-require-admin";
import { withErrorHandler } from "@/lib/with-error-handler";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api-response";
import {
  CUSTOMIZATION_STATUSES,
  statusLabel,
  isCustomizationStatus,
} from "@/lib/customize/status";
import { getOptionLabel } from "@/lib/customize/taxonomy";
import { getPublicUrl } from "@/lib/uploads/storage";
import {
  isEmailConfigured,
  sendCustomizationStatusUpdateEmail,
} from "@/lib/email";
import type { NextRequest } from "next/server";

interface DetailParams {
  params: Promise<{ id: string }>;
}

const handleGet = async (_req: NextRequest, ctx: DetailParams) => {
  const { id } = await ctx.params;

  const request = await prisma.customizationRequest.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true } },
      media: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!request) return notFoundResponse("Customization request");

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

  const garment =
    getOptionLabel("garment", request.garment) ?? request.garment;

  return successResponse({
    id: request.id,
    userId: request.userId,
    userEmail: request.user?.email ?? null,
    userName: request.user?.name ?? null,
    garment,
    spec: {
      selections: resolvedSelections,
      colorMatchReference: spec?.colorMatchReference ?? false,
    },
    notes: request.notes,
    occasion: request.occasion
      ? getOptionLabel("occasion", request.occasion) ?? request.occasion
      : null,
    budgetTier: request.budgetTier
      ? getOptionLabel("budget", request.budgetTier) ?? request.budgetTier
      : null,
    requiredBy: request.requiredBy?.toISOString() ?? null,
    status: request.status,
    statusLabel: statusLabel(request.status),
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
  });
};

const handlePatch = async (req: NextRequest, ctx: DetailParams) => {
  const { id } = await ctx.params;

  const existing = await prisma.customizationRequest.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });

  if (!existing) return notFoundResponse("Customization request");

  const body = (await req.json()) as {
    status?: string;
    quotedPrice?: number | null;
    adminNotes?: string | null;
  };

  const errors: Record<string, string[]> = {};
  if (body.status !== undefined && !isCustomizationStatus(body.status)) {
    errors.status = [
      `Invalid status. Must be one of: ${CUSTOMIZATION_STATUSES.join(", ")}`,
    ];
  }
  if (
    body.quotedPrice !== undefined &&
    body.quotedPrice !== null &&
    (typeof body.quotedPrice !== "number" || body.quotedPrice < 0)
  ) {
    errors.quotedPrice = ["quotedPrice must be a non-negative number"];
  }
  if (
    body.adminNotes !== undefined &&
    body.adminNotes !== null &&
    typeof body.adminNotes !== "string"
  ) {
    errors.adminNotes = ["adminNotes must be a string"];
  }
  if (Object.keys(errors).length > 0) {
    return errorResponse("Validation failed", 400, errors);
  }

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) data.status = body.status;
  if (body.quotedPrice !== undefined) data.quotedPrice = body.quotedPrice;
  if (body.adminNotes !== undefined) data.adminNotes = body.adminNotes;

  const updated = await prisma.customizationRequest.update({
    where: { id },
    data,
  });

  const statusChanged =
    body.status !== undefined && body.status !== existing.status;

  if (statusChanged && existing.user?.email) {
    after(async () => {
      if (!isEmailConfigured()) return;
      try {
        const result = await sendCustomizationStatusUpdateEmail(
          existing.id,
          existing.user!.email!,
          getOptionLabel("garment", existing.garment) ?? existing.garment,
          body.status!,
        );
        if (
          !result.ok &&
          result.error !== "RESEND_API_KEY not set — email skipped"
        ) {
          console.error("[email] customization-status-update failed", {
            requestId: existing.id,
            status: body.status,
            error: result.error,
          });
        }
      } catch (e) {
        console.error("[email] customization-status-update threw", {
          requestId: existing.id,
          status: body.status,
          error: e,
        });
      }
    });
  }

  return successResponse({
    id: updated.id,
    status: updated.status,
    statusLabel: statusLabel(updated.status),
    quotedPrice: updated.quotedPrice,
    adminNotes: updated.adminNotes,
    updatedAt: updated.updatedAt.toISOString(),
  });
};

export const GET = requireAdmin(withErrorHandler(handleGet));
export const PATCH = requireAdmin(withErrorHandler(handlePatch));
