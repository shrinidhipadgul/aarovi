import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export interface ProductQueryParams {
  q?: string;
  gender?: string;
  category?: string[];
  subCategory?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductQueryResult {
  products: ProductCardSelect[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  categories: CategorySelect[];
}

export type ProductCardSelect = Prisma.ProductGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    price: true;
    compareAt: true;
    images: true;
    sizes: true;
    inStock: true;
  };
}>;

export type CategorySelect = Prisma.CategoryGetPayload<{
  select: { id: true; name: true; slug: true; gender: true };
}>;

const SORT_MAP: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  name_asc: { name: "asc" },
  newest: { createdAt: "desc" },
};

export function parseProductQuery(
  searchParams: Record<string, string | string[] | undefined>,
): ProductQueryParams {
  const get = (key: string): string | undefined => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const getList = (key: string): string[] | undefined => {
    const v = get(key);
    if (!v) return undefined;
    const parts = v.split(",").map((s) => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts : undefined;
  };
  const toNum = (v: string | undefined): number | undefined => {
    if (v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  return {
    q: get("q"),
    gender: get("gender"),
    category: getList("category"),
    subCategory: getList("subCategory"),
    minPrice: toNum(get("minPrice")),
    maxPrice: toNum(get("maxPrice")),
    inStock: get("inStock") === "true" ? true : undefined,
    sort: get("sort"),
    page: toNum(get("page")) ?? 1,
    limit: toNum(get("limit")) ?? 12,
  };
}

export async function fetchProducts(
  params: ProductQueryParams,
  categories: CategorySelect[],
): Promise<{ products: ProductCardSelect[]; pagination: ProductQueryResult["pagination"] }> {
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const limit = Math.min(24, Math.max(1, Math.floor(params.limit ?? 12)));
  const skip = (page - 1) * limit;

  const conditions: Prisma.ProductWhereInput[] = [];

  if (params.q) {
    const q = params.q.trim();
    if (q.length >= 2) {
      conditions.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { subCategory: { contains: q, mode: "insensitive" } },
        ],
      });
    }
  }

  if (params.gender) {
    const names = categories
      .filter((c) => c.gender === params.gender)
      .map((c) => c.name);
    if (names.length > 0) conditions.push({ category: { in: names } });
  }

  if (params.category && params.category.length > 0) {
    const names = categories
      .filter((c) => params.category!.includes(c.slug))
      .map((c) => c.name);
    if (names.length > 0) conditions.push({ category: { in: names } });
  }

  if (params.subCategory && params.subCategory.length > 0) {
    conditions.push({ subCategory: { in: params.subCategory } });
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    const priceFilter: { gte?: number; lte?: number } = {};
    if (params.minPrice !== undefined) priceFilter.gte = params.minPrice;
    if (params.maxPrice !== undefined) priceFilter.lte = params.maxPrice;
    conditions.push({ price: priceFilter });
  }

  if (params.inStock) {
    conditions.push({ inStock: true });
  }

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(conditions.length ? { AND: conditions } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    (params.sort && SORT_MAP[params.sort]) || SORT_MAP.newest;

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
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
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export type ProductDetailSelect = Prisma.ProductGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    description: true;
    price: true;
    compareAt: true;
    images: true;
    category: true;
    subCategory: true;
    sizes: true;
    inStock: true;
    createdAt: true;
  };
}>;

export async function fetchProductById(
  id: string,
): Promise<ProductDetailSelect | null> {
  return prisma.product.findFirst({
    where: { id, deletedAt: null },
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
}

export async function fetchRelatedProducts(
  subCategory: string,
  excludeId: string,
): Promise<ProductCardSelect[]> {
  return prisma.product.findMany({
    where: { subCategory, id: { not: excludeId }, deletedAt: null },
    take: 4,
    orderBy: { createdAt: "desc" },
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
  });
}

export async function fetchAllCategories(): Promise<CategorySelect[]> {
  return prisma.category.findMany({
    select: { id: true, name: true, slug: true, gender: true },
    orderBy: { name: "asc" },
  });
}

export async function findCategoryByName(
  name: string,
): Promise<CategorySelect | null> {
  const categories = await fetchAllCategories();
  return categories.find((c) => c.name === name) ?? null;
}