import type { NextRequest } from "next/server";
import { getSession } from "@/lib/get-session";
import { fetchOrder } from "@/lib/queries/orders";
import { getTimeline, statusLabel } from "@/lib/order-status";
import { handleApiError } from "@/lib/api-errors";
import {
  successResponse,
  notFoundResponse,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api-response";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/orders/[orderId]">,
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { orderId } = await ctx.params;
    const order = await fetchOrder(orderId);

    if (!order) {
      return notFoundResponse("Order");
    }

    if (order.userId !== session.user.id) {
      return errorResponse("Forbidden", 403);
    }

    return successResponse({
      ...order,
      statusLabel: statusLabel(order.status),
      timeline: getTimeline(order.status),
    });
  } catch (error) {
    return handleApiError(error);
  }
}