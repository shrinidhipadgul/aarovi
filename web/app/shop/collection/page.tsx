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
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/json-ld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Collection",
  description:
    "Browse our full collection of ethnic wear. Filter by category, price, and availability.",
  openGraph: {
    title: "Collection | Aarovi",
    description: "Browse our full collection of ethnic wear. Filter by category, price, and availability.",
  },
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const params = parseProductQuery(sp);
  const categories = await fetchAllCategories();
  const { products, pagination } = await fetchProducts(
    { ...params, page: 1 },
    categories,
  );

  const filterKey = [
    sp.q ?? "",
    sp.gender ?? "",
    (Array.isArray(sp.category) ? sp.category.join(",") : sp.category) ?? "",
    (Array.isArray(sp.subCategory)
      ? sp.subCategory.join(",")
      : sp.subCategory) ?? "",
    sp.minPrice ?? "",
    sp.maxPrice ?? "",
    sp.inStock ?? "",
    sp.sort ?? "",
  ].join("|");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: `${siteUrl}/` },
          { name: "Collection", url: `${siteUrl}/shop/collection` },
        ])}
      />
      <ProductGridClient
      key={filterKey}
      basePath="/shop/collection"
      title="Collection"
      initialProducts={products as ProductCardSelect[]}
      initialPagination={pagination as PaginationMeta}
      categories={categories as CategorySelect[]}
    />
    </>);
}