import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-require-admin";
import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse } from "@/lib/api-response";
import {
  ORDER_STATUSES,
  statusLabel,
  adminStatusLabel,
  statusBadgeColor,
} from "@/lib/order-status";

const listOrders = async (req: Request) => {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const skip = (page - 1) * limit;
  const search = url.searchParams.get("q")?.trim();
  const status = url.searchParams.get("status")?.trim();

  const where: Record<string, unknown> = {};

  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) {
    where.status = status;
  }

  if (search && search.length >= 2) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            size: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const enriched = orders.map((order) => ({
    id: order.id,
    userId: order.userId,
    userEmail: order.user?.email ?? null,
    userName: order.user?.name ?? null,
    total: order.total,
    status: order.status,
    statusLabel: adminStatusLabel(order.status),
    badgeColor: statusBadgeColor(order.status),
    paymentMethod: order.paymentMethod,
    paymentId: order.paymentId,
    paymentProof: order.paymentProof,
    itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));

  return successResponse({
    orders: enriched,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

export const GET = requireAdmin(withErrorHandler(listOrders));