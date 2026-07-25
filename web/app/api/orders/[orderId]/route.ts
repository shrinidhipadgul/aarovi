import type { NextRequest } from "next/server";
import { getSession } from "@/lib/get-session";
import { requireAuth } from "@/lib/api-require-auth";
import { withErrorHandler } from "@/lib/with-error-handler";
import { fetchOrder } from "@/lib/queries/orders";
import { getTimeline, statusLabel } from "@/lib/order-status";
import {
  successResponse,
  notFoundResponse,
  errorResponse,
} from "@/lib/api-response";

export const GET = requireAuth(
  withErrorHandler(
    async (_req: NextRequest, ctx: RouteContext<"/api/orders/[orderId]">) => {
      const session = (await getSession())!;

      const { orderId } = await ctx.params;
      const order = await fetchOrder(orderId);

      if (!order) {
        return notFoundResponse("Order");
      }

      if (order.userId !== session!.user.id) {
        return errorResponse("Forbidden", 403);
      }

      return successResponse({
        ...order,
        statusLabel: statusLabel(order.status),
        timeline: getTimeline(order.status),
      });
    },
  ),
);