import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { requireAuth } from "@/lib/api-require-auth";
import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse } from "@/lib/api-response";
import { statusLabel, statusBadgeColor } from "@/lib/order-status";

export const GET = requireAuth(
  withErrorHandler(async () => {
    const session = (await getSession())!;

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
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
    },
  });

  const enriched = orders.map((order) => ({
    ...order,
    statusLabel: statusLabel(order.status),
    badgeColor: statusBadgeColor(order.status),
    itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
  }));

  return successResponse(enriched);
  }),
);