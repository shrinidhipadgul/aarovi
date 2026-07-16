import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { requireAdmin } from "@/lib/api-require-admin";
import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api-response";

function validateProductBody(body: Record<string, unknown>, isUpdate = false) {
  const errors: Record<string, string[]> = {};

  if (!isUpdate) {
    if (!body.name || typeof body.name !== "string") {
      errors.name = ["Name is required"];
    }
    if (!body.description || typeof body.description !== "string") {
      errors.description = ["Description is required"];
    }
    if (body.price === undefined || typeof body.price !== "number" || body.price <= 0) {
      errors.price = ["Price must be a positive number"];
    }
    if (!body.category || typeof body.category !== "string") {
      errors.category = ["Category is required"];
    }
  }

  if (body.slug !== undefined && typeof body.slug !== "string") {
    errors.slug = ["Slug must be a string"];
  }
  if (
    body.price !== undefined &&
    (typeof body.price !== "number" || body.price <= 0)
  ) {
    errors.price = ["Price must be a positive number"];
  }
  if (
    body.compareAt !== undefined &&
    (typeof body.compareAt !== "number" || body.compareAt < 0)
  ) {
    errors.compareAt = ["Compare-at price must be a non-negative number"];
  }
  if (
    body.stock !== undefined &&
    (typeof body.stock !== "number" || body.stock < 0 || !Number.isInteger(body.stock))
  ) {
    errors.stock = ["Stock must be a non-negative integer"];
  }
  if (body.images !== undefined && !Array.isArray(body.images)) {
    errors.images = ["Images must be an array of strings"];
  }
  if (body.sizes !== undefined && !Array.isArray(body.sizes)) {
    errors.sizes = ["Sizes must be an array of strings"];
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

const listProducts = async (req: Request) => {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const skip = (page - 1) * limit;
  const search = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category");
  const inStockParam = url.searchParams.get("inStock");

  const where: Record<string, unknown> = {};

  if (search && search.length >= 2) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) {
    where.category = category;
  }
  if (inStockParam === "true") {
    where.inStock = true;
  } else if (inStockParam === "false") {
    where.inStock = false;
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return successResponse({
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

const createProduct = async (req: Request) => {
  const body = (await req.json()) as Record<string, unknown>;

  const validationErrors = validateProductBody(body);
  if (validationErrors) {
    return errorResponse("Validation failed", 400, validationErrors);
  }

  const name = body.name as string;
  const description = body.description as string;
  const price = body.price as number;
  const compareAt = body.compareAt as number | undefined;
  const images = body.images as string[] | undefined;
  const sizes = body.sizes as string[] | undefined;
  const stock = body.stock as number | undefined;
  const featured = body.featured as boolean | undefined;

  let slug = body.slug as string | undefined;
  if (!slug) {
    slug = slugify(name);
  }

  const subCategory = (body.subCategory as string) || (body.category as string);

  const categoryName = body.category as string;
  const existingCategory = await prisma.category.findFirst({
    where: { name: categoryName },
    select: { id: true },
  });
  if (!existingCategory) {
    const allCats = await prisma.category.findMany({ select: { name: true } });
    return errorResponse(
      `Category "${categoryName}" not found. Valid categories: ${allCats.map((c) => c.name).join(", ")}`,
      400,
    );
  }

  const existingSlug = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (existingSlug) {
    return errorResponse(`A product with slug "${slug}" already exists`, 400, {
      slug: ["Slug must be unique"],
    });
  }

  const autoInStock = stock !== undefined ? stock > 0 : true;

  const product = await prisma.product.create({
    data: {
      name: name!,
      slug,
      description: description!,
      price: price,
      compareAt: compareAt ?? null,
      images: images ?? [],
      category: categoryName,
      subCategory,
      sizes: sizes ?? [],
      stock: stock ?? 0,
      inStock: autoInStock,
      featured: featured ?? false,
    },
  });

  return successResponse(product, 201);
};

export const GET = requireAdmin(withErrorHandler(listProducts));
export const POST = requireAdmin(withErrorHandler(createProduct));