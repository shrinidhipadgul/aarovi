import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-require-auth";
import { withErrorHandler } from "@/lib/with-error-handler";
import { getSession } from "@/lib/get-session";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api-response";
import { statusLabel } from "@/lib/customize/status";
import { getOptionLabel } from "@/lib/customize/taxonomy";
import { getPublicUrl } from "@/lib/uploads/storage";
import type { NextRequest } from "next/server";

interface DetailParams {
  params: Promise<{ id: string }>;
}

const handleDetail = async (_req: NextRequest, ctx: DetailParams) => {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return errorResponse("Authentication required", 401);
  }

  const { id } = await ctx.params;

  const request = await prisma.customizationRequest.findUnique({
    where: { id },
    include: { media: { orderBy: { createdAt: "asc" } } },
  });

  if (!request) {
    return notFoundResponse("Customization request");
  }

  if (request.userId !== userId) {
    return errorResponse("Forbidden", 403);
  }

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
    status: statusLabel(request.status),
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

export const GET = requireAuth(withErrorHandler(handleDetail));
