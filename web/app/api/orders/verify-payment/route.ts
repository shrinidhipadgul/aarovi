import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { requireAuth } from "@/lib/api-require-auth";
import { withErrorHandler } from "@/lib/with-error-handler";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api-response";
import { verifyRazorpaySignature } from "@/lib/checkout";
import { fetchOrderForEmail } from "@/lib/queries/orders";
import { isEmailConfigured, sendOrderConfirmationEmail } from "@/lib/email";

function sendOrderConfirmationAfter(orderId: string) {
  after(async () => {
    if (!isEmailConfigured()) return;
    try {
      const order = await fetchOrderForEmail(orderId);
      if (!order?.user?.email) return;
      await sendOrderConfirmationEmail(order);
    } catch (e) {
      console.error("[email] order-confirmation (post-verify)", {
        orderId,
        error: e,
      });
    }
  });
}

export const POST = requireAuth(
  withErrorHandler(async (req: Request) => {
    const session = (await getSession())!;

  const body = (await req.json()) as {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  };

  if (!body.orderId || !body.razorpayPaymentId || !body.razorpaySignature) {
    return errorResponse("Missing payment verification details", 400);
  }

  const order = await prisma.order.findUnique({
    where: { id: body.orderId },
    select: {
      id: true,
      userId: true,
      status: true,
      total: true,
      paymentId: true,
    },
  });

  if (!order) {
    return notFoundResponse("Order");
  }

  if (order.userId !== session.user.id) {
    return errorResponse("Forbidden", 403);
  }

  if (order.status !== "pending") {
    return errorResponse("Order is not awaiting payment verification", 400);
  }

  if (order.paymentId !== body.razorpayOrderId) {
    return errorResponse("Razorpay order ID mismatch", 400);
  }

  const isValid = verifyRazorpaySignature({
    razorpayOrderId: body.razorpayOrderId,
    razorpayPaymentId: body.razorpayPaymentId,
    razorpaySignature: body.razorpaySignature,
  });

  if (!isValid) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "cancelled" },
    });
    return errorResponse("Payment verification failed", 400);
  }

  await prisma.$transaction(async (tx) => {
    const items = await tx.orderItem.findMany({
      where: { orderId: order.id },
      select: { productId: true, quantity: true },
    });

    for (const item of items) {
      const updated = await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
        select: { stock: true },
      });
      if (updated.stock <= 0) {
        await tx.product.update({
          where: { id: item.productId },
          data: { inStock: false },
        });
      }
    }

    await tx.cartItem.deleteMany({ where: { userId: session.user.id } });

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "confirmed",
        paymentId: body.razorpayPaymentId,
      },
    });
  });

  sendOrderConfirmationAfter(order.id);

  return successResponse({ orderId: order.id, status: "confirmed" });
  }),
);