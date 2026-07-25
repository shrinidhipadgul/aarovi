import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-require-admin";
import { withErrorHandler } from "@/lib/with-error-handler";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api-response";
import {
  isWritableOrderStatus,
  statusLabel,
  statusBadgeColor,
} from "@/lib/order-status";

interface OrderStatusParamsCtx {
  params: Promise<{ orderId: string }>;
}

const updateOrderStatus = async (
  req: NextRequest,
  ctx: OrderStatusParamsCtx,
) => {
  const { orderId } = await ctx.params;

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true },
  });

  if (!existing) {
    return notFoundResponse("Order");
  }

  const body = (await req.json()) as Record<string, unknown>;

  if (typeof body.status !== "string" || !isWritableOrderStatus(body.status)) {
    return errorResponse("Validation failed", 400, {
      status: ["Status must be one of: confirmed, processing, shipped, out_for_delivery, delivered, cancelled"],
    });
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: body.status },
  });

  return successResponse({
    id: order.id,
    status: order.status,
    statusLabel: statusLabel(order.status),
    badgeColor: statusBadgeColor(order.status),
    updatedAt: order.updatedAt.toISOString(),
  });
};

export const PATCH = requireAdmin(withErrorHandler(updateOrderStatus));