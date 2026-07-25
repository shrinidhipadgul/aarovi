import type { NextRequest } from "next/server";
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
  isWritableOrderStatus,
  statusLabel,
  statusBadgeColor,
} from "@/lib/order-status";
import {
  isEmailConfigured,
  sendOrderCancellationEmail,
  sendOrderStatusUpdateEmail,
} from "@/lib/email";

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
    select: { id: true, status: true },
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

  if (body.status === existing.status) {
    return successResponse({
      id: existing.id,
      status: existing.status,
      statusLabel: statusLabel(existing.status),
      badgeColor: statusBadgeColor(existing.status),
      message: "No change — status already set",
    });
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: body.status },
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
      user: { select: { id: true, email: true, name: true } },
    },
  });

  const newStatus = body.status;

  after(async () => {
    if (!isEmailConfigured()) return;
    if (!order.user?.email) return;
    try {
      const result =
        newStatus === "cancelled"
          ? await sendOrderCancellationEmail(order)
          : await sendOrderStatusUpdateEmail(order, newStatus);
      if (!result.ok && result.error !== "RESEND_API_KEY not set — email skipped") {
        console.error("[email] order-status-update failed", {
          orderId: order.id,
          newStatus,
          error: result.error,
        });
      }
    } catch (e) {
      console.error("[email] order-status-update threw", {
        orderId: order.id,
        newStatus,
        error: e,
      });
    }
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