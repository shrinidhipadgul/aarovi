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

  const { cartItemId } = await req.json();

  if (!cartItemId || typeof cartItemId !== "string") {
    return errorResponse("cartItemId is required", 400);
  }

  const existing = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });

  if (!existing) {
    return notFoundResponse("Cart item");
  }

  if (existing.userId !== session.user.id) {
    return unauthorizedResponse();
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  return successResponse({ removed: true });
});
