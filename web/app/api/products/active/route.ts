import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse } from "@/lib/api-response";

export const POST = withErrorHandler(async (req: Request) => {
  const body = (await req.json().catch(() => ({}))) as { ids?: unknown };
  const rawIds = Array.isArray(body?.ids) ? body.ids : [];
  const ids = rawIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0);

  if (ids.length === 0) {
    return successResponse({ activeIds: [] });
  }

  const cappedIds = ids.slice(0, 100);

  const activeProducts = await prisma.product.findMany({
    where: {
      id: { in: cappedIds },
      deletedAt: null,
    },
    select: { id: true },
  });

  const activeIds = activeProducts.map((p) => p.id);
  return successResponse({ activeIds });
});

export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url);
  const raw = url.searchParams.get("ids") ?? "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);

  if (ids.length === 0) {
    return successResponse({ activeIds: [] });
  }

  const activeProducts = await prisma.product.findMany({
    where: {
      id: { in: ids },
      deletedAt: null,
    },
    select: { id: true },
  });

  const activeIds = activeProducts.map((p) => p.id);
  return successResponse({ activeIds });
});
