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

  const { productId } = await req.json();

  if (!productId || typeof productId !== "string") {
    return errorResponse("productId is required", 400);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    return notFoundResponse("Product");
  }

  const existing = await prisma.wishlistItem.findFirst({
    where: { userId: session.user.id, productId },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return successResponse({ wishlisted: false });
  }

  await prisma.wishlistItem.create({
    data: { userId: session.user.id, productId },
  });

  return successResponse({ wishlisted: true }, 201);
});
