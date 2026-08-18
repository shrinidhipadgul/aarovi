import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { requireAuth } from "@/lib/api-require-auth";
import { withErrorHandler } from "@/lib/with-error-handler";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api-response";

export const POST = requireAuth(
  withErrorHandler(async (req: Request) => {
    const session = (await getSession())!;

  const { productId, size, quantity: rawQty } = await req.json();

  if (!productId || typeof productId !== "string") {
    return errorResponse("productId is required", 400);
  }

  if (!size || typeof size !== "string") {
    return errorResponse("size is required", 400);
  }

  const quantity = Number(rawQty);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return errorResponse("quantity must be an integer between 1 and 10", 400);
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    select: { id: true, sizes: true, inStock: true, stock: true },
  });

  if (!product) {
    return notFoundResponse("Product");
  }

  if (!product.sizes.includes(size)) {
    return errorResponse(`Size "${size}" is not available for this product`, 400);
  }

  if (!product.inStock || product.stock <= 0) {
    return errorResponse("This product is currently out of stock", 400);
  }

  const existing = await prisma.cartItem.findFirst({
    where: { userId: session.user.id, productId, size },
  });

  const newQty = existing ? existing.quantity + quantity : quantity;
  if (newQty > product.stock) {
    return errorResponse(
      `Only ${product.stock} unit${product.stock === 1 ? "" : "s"} available. You already have ${existing ? existing.quantity : 0} in your cart.`,
      400,
    );
  }

  const result = existing
    ? await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      })
    : await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          size,
          quantity,
        },
      });

  return successResponse({ cartItem: result }, 201);
  }),
);
