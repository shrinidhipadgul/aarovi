import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { withErrorHandler } from "@/lib/with-error-handler";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
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

  const existing = await prisma.wishlistItem.findFirst({
    where: { userId: session.user.id, productId },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
  }

  return successResponse({ wishlisted: false });
});
