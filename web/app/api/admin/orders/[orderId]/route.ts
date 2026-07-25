import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-require-admin";
import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse, notFoundResponse } from "@/lib/api-response";
import {
  getTimeline,
  statusLabel,
  statusBadgeColor,
} from "@/lib/order-status";

interface OrderParamsCtx {
  params: Promise<{ orderId: string }>;
}

const getOrder = async (_req: NextRequest, ctx: OrderParamsCtx) => {
  const { orderId } = await ctx.params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
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
  });

  if (!order) {
    return notFoundResponse("Order");
  }

  return successResponse({
    id: order.id,
    userId: order.userId,
    userEmail: order.user?.email ?? null,
    userName: order.user?.name ?? null,
    total: order.total,
    status: order.status,
    statusLabel: statusLabel(order.status),
    badgeColor: statusBadgeColor(order.status),
    timeline: getTimeline(order.status),
    address: order.address,
    paymentMethod: order.paymentMethod,
    paymentId: order.paymentId,
    items: order.items,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  });
};

export const GET = requireAdmin(withErrorHandler(getOrder));