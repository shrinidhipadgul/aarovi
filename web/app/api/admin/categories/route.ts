import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-require-admin";
import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse } from "@/lib/api-response";

const listCategories = async () => {
  const categories = await prisma.category.findMany({
    select: { name: true, slug: true, gender: true },
    orderBy: { name: "asc" },
  });
  return successResponse(categories);
};

export const GET = requireAdmin(withErrorHandler(listCategories));