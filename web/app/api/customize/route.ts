import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-require-auth";
import { withErrorHandler } from "@/lib/with-error-handler";
import { getSession } from "@/lib/get-session";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";
import {
  TAXONOMY,
  isValidSelection,
  REQUIRED_GROUPS,
  type CustomizeSpec,
} from "@/lib/customize/taxonomy";
import { statusLabel } from "@/lib/customize/status";
import {
  isEmailConfigured,
  sendCustomizationConfirmationEmail,
  sendCustomizationAdminNotifyEmail,
} from "@/lib/email";

function dispatchEmailsAfter(
  requestId: string,
  garment: string,
  occasion: string | null,
  budgetTier: string | null,
  userEmail: string,
) {
  after(async () => {
    if (!isEmailConfigured()) return;
    try {
      await Promise.all([
        sendCustomizationConfirmationEmail(requestId, userEmail, garment),
        sendCustomizationAdminNotifyEmail(
          requestId,
          garment,
          occasion,
          budgetTier,
          userEmail,
        ),
      ]);
    } catch (e) {
      console.error("[email] customization (post-create)", {
        requestId,
        error: e,
      });
    }
  });
}

function validateSpec(spec: CustomizeSpec) {
  const errors: Record<string, string[]> = {};

  for (const required of REQUIRED_GROUPS) {
    const val = spec.selections[required];
    if (!val || (Array.isArray(val) && val.length === 0)) {
      const label = TAXONOMY.find((g) => g.id === required)?.label ?? required;
      errors[required] = [`${label} is required`];
    }
  }

  for (const [groupId, value] of Object.entries(spec.selections)) {
    if (!isValidSelection(groupId, value)) {
      errors[groupId] = [`Invalid selection for group "${groupId}"`];
    }
  }

  if (
    spec.budgetTier &&
    !spec.budgetTier.match(/^(under-5k|5-10k|10-25k|25k-plus)$/)
  ) {
    errors.budgetTier = ["Invalid budget tier"];
  }

  if (
    spec.occasion &&
    !TAXONOMY.find((g) => g.id === "occasion")?.options.find((o) => o.value === spec.occasion)
  ) {
    errors.occasion = ["Invalid occasion"];
  }

  if (typeof spec.notes !== "string") {
    errors.notes = ["Notes must be a string"];
  }
  if (typeof spec.colorMatchReference !== "boolean") {
    errors.colorMatchReference = ["colorMatchReference must be a boolean"];
  }

  if (!Array.isArray(spec.referenceKeys)) {
    errors.referenceKeys = ["referenceKeys must be an array"];
  } else if (spec.referenceKeys.length > 5) {
    errors.referenceKeys = ["Maximum 5 reference images allowed"];
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

const handleCreate = async (req: Request) => {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return errorResponse("Authentication required", 401);
  }

  const body = (await req.json()) as CustomizeSpec & { garment?: string };

  if (!body.garment) {
    return errorResponse("Garment selection is required", 400);
  }

  const validationErrors = validateSpec(body);
  if (validationErrors) {
    return errorResponse("Validation failed", 400, validationErrors);
  }

  const garmentGroup = TAXONOMY.find((g) => g.id === "garment");
  const garmentLabel =
    garmentGroup?.options.find((o) => o.value === body.garment)?.label ??
    body.garment;

  const occasionVal = body.occasion || body.selections.occasion;
  const occasionLabel =
    typeof occasionVal === "string"
      ? TAXONOMY.find((g) => g.id === "occasion")?.options.find(
          (o) => o.value === occasionVal,
        )?.label ?? null
      : null;

  const budgetLabel =
    TAXONOMY.find((g) => g.id === "budget")?.options.find(
      (o) => o.value === body.budgetTier,
    )?.label ?? null;

  const request = await prisma.customizationRequest.create({
    data: {
      userId,
      garment: body.garment,
      spec: {
        selections: body.selections,
        colorMatchReference: body.colorMatchReference,
      },
      notes: body.notes || null,
      occasion: typeof occasionVal === "string" ? occasionVal : null,
      budgetTier: body.budgetTier || null,
      requiredBy: body.requiredBy ? new Date(body.requiredBy) : null,
      status: "SUBMITTED",
      media: {
        create: (body.referenceKeys ?? []).map((key) => ({
          key,
          contentType: "image/jpeg",
        })),
      },
    },
    include: { media: true },
  });

  const userEmail = session?.user?.email;
  if (userEmail) {
    dispatchEmailsAfter(
      request.id,
      garmentLabel,
      occasionLabel,
      budgetLabel,
      userEmail,
    );
  }

  return successResponse(
    {
      id: request.id,
      garment: garmentLabel,
      status: statusLabel(request.status),
      mediaCount: request.media.length,
    },
    201,
  );
};

const handleList = async () => {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return errorResponse("Authentication required", 401);
  }

  const requests = await prisma.customizationRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      garment: true,
      status: true,
      occasion: true,
      budgetTier: true,
      createdAt: true,
      _count: { select: { media: true } },
    },
  });

  const result = requests.map((r) => ({
    id: r.id,
    garment: r.garment,
    status: statusLabel(r.status),
    occasion: r.occasion,
    budgetTier: r.budgetTier,
    createdAt: r.createdAt.toISOString(),
    mediaCount: r._count.media,
  }));

  return successResponse(result);
};

export const POST = requireAuth(withErrorHandler(handleCreate));
export const GET = requireAuth(withErrorHandler(handleList));
