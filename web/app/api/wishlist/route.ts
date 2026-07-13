import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse, unauthorizedResponse } from "@/lib/api-response";

export const GET = withErrorHandler(async () => {
  const session = await getSession();

  if (!session?.user?.id) {
    return unauthorizedResponse();
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });

  const ids = items.map((i) => i.productId);
  return successResponse(ids);
});
