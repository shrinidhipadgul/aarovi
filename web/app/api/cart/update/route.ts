import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { withErrorHandler } from "@/lib/with-error-handler";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

export const POST = withErrorHandler(async (req: Request) => {
  const session = await getSession();

  if (!session?.user?.id) {
    return unauthorizedResponse();
  }

  const { cartItemId, quantity: rawQty } = await req.json();

  if (!cartItemId || typeof cartItemId !== "string") {
    return errorResponse("cartItemId is required", 400);
  }

  const quantity = Number(rawQty);

  const existing = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });

  if (!existing) {
    return notFoundResponse("Cart item");
  }

  if (existing.userId !== session.user.id) {
    return unauthorizedResponse();
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return errorResponse("quantity must be a positive integer", 400);
  }

  if (quantity > 10) {
    return errorResponse("quantity cannot exceed 10", 400);
  }

  const updated = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    select: {
      id: true,
      productId: true,
      size: true,
      quantity: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
        },
      },
    },
  });

  return successResponse(updated);
});
