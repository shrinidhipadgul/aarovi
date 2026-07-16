import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse } from "@/lib/api-response";

export const GET = withErrorHandler(async (req: Request) => {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) return successResponse([]);

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { subCategory: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 8,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
      category: true,
    },
    orderBy: { featured: "desc" },
  });

  return successResponse(products);
});