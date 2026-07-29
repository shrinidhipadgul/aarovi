import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-require-admin";
import { withErrorHandler } from "@/lib/with-error-handler";
import { getSession } from "@/lib/get-session";
import { successResponse, errorResponse } from "@/lib/api-response";
import { statusLabel } from "@/lib/customize/status";

const handleList = async (req: Request) => {
  const session = await getSession();
  if (!session?.user) {
    return errorResponse("Unauthorized", 401);
  }

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status") ?? undefined;
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 20));

  const where: Record<string, unknown> = {};
  if (statusFilter) where.status = statusFilter;

  const [total, requests] = await Promise.all([
    prisma.customizationRequest.count({ where }),
    prisma.customizationRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { email: true, name: true } },
        _count: { select: { media: true } },
      },
    }),
  ]);

  const result = requests.map((r) => ({
    id: r.id,
    userId: r.userId,
    userEmail: r.user?.email ?? null,
    userName: r.user?.name ?? null,
    garment: r.garment,
    status: r.status,
    statusLabel: statusLabel(r.status),
    occasion: r.occasion,
    budgetTier: r.budgetTier,
    quotedPrice: r.quotedPrice,
    mediaCount: r._count.media,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return successResponse({
    requests: result,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const GET = requireAdmin(withErrorHandler(handleList));
