import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-errors";
import { successResponse, notFoundResponse } from "@/lib/api-response";

export const GET = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const productId = url.pathname.split("/").filter(Boolean).pop() ?? "";

    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        compareAt: true,
        images: true,
        category: true,
        subCategory: true,
        sizes: true,
        inStock: true,
        createdAt: true,
      },
    });

    if (!product) {
      return notFoundResponse("Product");
    }

    return successResponse(product);
  } catch (error) {
    return handleApiError(error);
  }
};
