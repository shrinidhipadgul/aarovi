import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { requireAuth } from "@/lib/api-require-auth";
import { withErrorHandler } from "@/lib/with-error-handler";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api-response";

export const POST = requireAuth(
  withErrorHandler(async (req: Request) => {
    const session = (await getSession())!;

  const { productId } = await req.json();

  if (!productId || typeof productId !== "string") {
    return errorResponse("productId is required", 400);
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    select: { id: true },
  });

  if (!product) {
    return notFoundResponse("Product");
  }

  const existing = await prisma.wishlistItem.findFirst({
    where: { userId: session.user.id, productId },
  });

  if (existing) {
    return successResponse({ wishlisted: true });
  }

  await prisma.wishlistItem.create({
    data: { userId: session.user.id, productId },
  });

  return successResponse({ wishlisted: true }, 201);
  }),
);
