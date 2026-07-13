import { NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/with-error-handler";
import {
  parseProductQuery,
  fetchProducts,
  fetchAllCategories,
  type ProductCardSelect,
} from "@/lib/queries/products";
import type { PaginationMeta } from "@/lib/types";

export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url);
  const rawParams: Record<string, string | string[] | undefined> = {};
  url.searchParams.forEach((value, key) => {
    rawParams[key] = value;
  });

  const params = parseProductQuery(rawParams);
  const categories = await fetchAllCategories();
  const { products, pagination } = await fetchProducts(params, categories);

  return NextResponse.json({
    success: true,
    data: products as ProductCardSelect[],
    pagination: pagination as PaginationMeta,
  });
});
