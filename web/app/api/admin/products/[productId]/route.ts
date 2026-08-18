import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-require-admin";
import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api-response";

const getProduct = async (req: Request) => {
  const url = new URL(req.url);
  const productId = url.pathname.split("/").filter(Boolean).pop() ?? "";

  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
  });

  if (!product) {
    return notFoundResponse("Product");
  }

  return successResponse(product);
};

const updateProduct = async (req: Request) => {
  const url = new URL(req.url);
  const productId = url.pathname.split("/").filter(Boolean).pop() ?? "";

  const existing = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    select: { id: true },
  });

  if (!existing) {
    return notFoundResponse("Product");
  }

  const body = (await req.json()) as Record<string, unknown>;
  const errors: Record<string, string[]> = {};

  if (body.name !== undefined && typeof body.name !== "string") {
    errors.name = ["Name must be a string"];
  }
  if (body.description !== undefined && typeof body.description !== "string") {
    errors.description = ["Description must be a string"];
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
  if (body.category !== undefined && typeof body.category !== "string") {
    errors.category = ["Category must be a string"];
  }
  if (body.slug !== undefined && typeof body.slug !== "string") {
    errors.slug = ["Slug must be a string"];
  }

  if (Object.keys(errors).length > 0) {
    return errorResponse("Validation failed", 400, errors);
  }

  if (body.slug) {
    const slugProduct = await prisma.product.findFirst({
      where: { slug: body.slug as string, deletedAt: null },
      select: { id: true },
    });
    if (slugProduct && slugProduct.id !== productId) {
      return errorResponse("Slug must be unique", 400, {
        slug: [`Slug "${body.slug}" is already taken`],
      });
    }
  }

  if (body.category) {
    const catName = body.category as string;
    const catExists = await prisma.category.findFirst({
      where: { name: catName },
      select: { id: true },
    });
    if (!catExists) {
      return errorResponse(`Category "${catName}" not found`, 400, {
        category: ["Category does not exist"],
      });
    }
  }

  const data: Record<string, unknown> = {};

  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.price !== undefined) data.price = body.price;
  if (body.compareAt !== undefined) data.compareAt = body.compareAt;
  if (body.images !== undefined) data.images = body.images;
  if (body.sizes !== undefined) data.sizes = body.sizes;
  if (body.featured !== undefined) data.featured = body.featured;
  if (body.category !== undefined) {
    data.category = body.category;
    if (!body.subCategory) {
      data.subCategory = body.category;
    }
  }
  if (body.subCategory !== undefined) data.subCategory = body.subCategory;

  if (body.slug !== undefined) {
    data.slug = body.slug;
  }

  if (body.stock !== undefined) {
    data.stock = body.stock;
    data.inStock = (body.stock as number) > 0;
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data,
  });

  return successResponse(product);
};

const deleteProduct = async (req: Request) => {
  const url = new URL(req.url);
  const productId = url.pathname.split("/").filter(Boolean).pop() ?? "";

  const existing = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    select: { id: true, slug: true },
  });

  if (!existing) {
    return notFoundResponse("Product");
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      deletedAt: new Date(),
      slug: `${existing.slug}-deleted-${Date.now()}`,
    },
  });

  return successResponse(product);
};

export const GET = requireAdmin(withErrorHandler(getProduct));
export const PATCH = requireAdmin(withErrorHandler(updateProduct));
export const DELETE = requireAdmin(withErrorHandler(deleteProduct));