import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { requireAuth } from "@/lib/api-require-auth";
import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse } from "@/lib/api-response";

export const GET = requireAuth(
  withErrorHandler(async () => {
    const session = (await getSession())!;

  const items = await prisma.wishlistItem.findMany({
    where: {
      userId: session.user.id,
      product: { deletedAt: null },
    },
    select: {
      id: true,
      productId: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          compareAt: true,
          images: true,
          sizes: true,
          inStock: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse(items);
  }),
);
