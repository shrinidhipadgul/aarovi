import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { requireAuth } from "@/lib/api-require-auth";
import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse } from "@/lib/api-response";

export const GET = requireAuth(
  withErrorHandler(async () => {
    const session = (await getSession())!;

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
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
    orderBy: { createdAt: "desc" },
  });

  return successResponse(items);
  }),
);
