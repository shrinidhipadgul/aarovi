import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  parseProductQuery,
  fetchProducts,
  fetchAllCategories,
  type CategorySelect,
  type ProductCardSelect,
} from "@/lib/queries/products";
import type { PaginationMeta } from "@/lib/types";
import ProductGridClient from "@/components/shop/product-grid-client";

type SearchParams = Record<string, string | string[] | undefined>;

interface Props {
  params: Promise<{ subcategory: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { subcategory } = await params;
  const categories = await fetchAllCategories();
  const category = categories.find((c) => c.slug === subcategory);

  if (!category) {
    return { title: "Category Not Found — Aarovi" };
  }

  return {
    title: `${category.name} — Aarovi`,
    description: `Browse our ${category.name} collection. Filter by price, and availability.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { subcategory } = await params;
  const categories = await fetchAllCategories();
  const category = categories.find((c) => c.slug === subcategory);

  if (!category) {
    notFound();
  }

  const sp = await searchParams;
  const queryParams = parseProductQuery(sp);

  const { products, pagination } = await fetchProducts(
    {
      ...queryParams,
      page: 1,
      subCategory: [category.name],
    },
    categories,
  );

  const filterKey = [
    subcategory,
    sp.gender ?? "",
    (Array.isArray(sp.category) ? sp.category.join(",") : sp.category) ?? "",
    sp.minPrice ?? "",
    sp.maxPrice ?? "",
    sp.inStock ?? "",
    sp.sort ?? "",
  ].join("|");

  return (
    <ProductGridClient
      key={filterKey}
      basePath={`/shop/${subcategory}`}
      title={category.name}
      initialProducts={products as ProductCardSelect[]}
      initialPagination={pagination as PaginationMeta}
      categories={categories as CategorySelect[]}
      fixedParams={{ subCategory: category.name }}
    />
  );
}