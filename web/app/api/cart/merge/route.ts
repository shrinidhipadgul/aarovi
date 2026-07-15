import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse, unauthorizedResponse } from "@/lib/api-response";

interface MergeItem {
  productId: string;
  size: string;
  quantity: number;
}

export const POST = withErrorHandler(async (req: Request) => {
  const session = await getSession();

  if (!session?.user?.id) {
    return unauthorizedResponse();
  }

  const { items } = await req.json();

  if (!Array.isArray(items) || items.length === 0) {
    return successResponse({ merged: 0 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i: MergeItem) => i.productId) } },
    select: { id: true, sizes: true, inStock: true, stock: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const existingItems = await prisma.cartItem.findMany({
    where: {
      userId: session.user.id,
      productId: { in: items.map((i: MergeItem) => i.productId) },
    },
  });

  const existingMap = new Map(
    existingItems.map((i) => [`${i.productId}:${i.size}`, i]),
  );

  let merged = 0;

  for (const item of items as MergeItem[]) {
    const product = productMap.get(item.productId);
    if (!product) continue;
    if (!product.sizes.includes(item.size)) continue;
    if (!product.inStock || product.stock <= 0) continue;

    const key = `${item.productId}:${item.size}`;
    const existing = existingMap.get(key);

    const newQty = existing
      ? Math.min(existing.quantity + item.quantity, product.stock)
      : Math.min(item.quantity, product.stock);

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId: item.productId,
          size: item.size,
          quantity: newQty,
        },
      });
    }

    merged++;
  }

  return successResponse({ merged });
});
