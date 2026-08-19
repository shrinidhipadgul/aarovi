import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { requireAuth } from "@/lib/api-require-auth";
import { withErrorHandler } from "@/lib/with-error-handler";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";
import {
  calculateTotals,
  validateAddress,
  isRazorpayConfigured,
  createRazorpayOrder,
  type AddressInput,
} from "@/lib/checkout";

export const POST = requireAuth(
  withErrorHandler(async (req: Request) => {
    const session = (await getSession())!;

  const body = (await req.json()) as {
    address: AddressInput;
    paymentMethod?: string;
    saveAddress?: boolean;
  };

  const paymentMethod = body.paymentMethod || "RAZORPAY";
  if (paymentMethod !== "RAZORPAY") {
    return errorResponse("Invalid payment method. Only online payments are accepted.", 400);
  }

  const addressErrors = validateAddress(body.address);
  if (Object.keys(addressErrors).length > 0) {
    const formattedErrors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(addressErrors)) {
      formattedErrors[key] = [value];
    }
    return errorResponse("Invalid address", 400, formattedErrors);
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      productId: true,
      size: true,
      quantity: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          inStock: true,
          stock: true,
        },
      },
    },
  });

  if (cartItems.length === 0) {
    return errorResponse("Your cart is empty", 400);
  }

  for (const item of cartItems) {
    if (!item.product.inStock || item.product.stock < item.quantity) {
      return errorResponse(
        `Insufficient stock for ${item.product.name}`,
        400,
        { productId: [item.productId] },
      );
    }
  }

  const { subtotal, deliveryFee, total } = calculateTotals(
    cartItems.map((item) => ({
      price: item.product.price,
      quantity: item.quantity,
    })),
  );

  const addressData = {
    fullName: body.address.fullName!,
    phone: body.address.phone!,
    line1: body.address.line1!,
    city: body.address.city!,
    state: body.address.state!,
    pincode: body.address.pincode!,
  };

  const orderItems = cartItems.map((item) => ({
    productId: item.productId,
    size: item.size,
    quantity: item.quantity,
    price: item.product.price,
  }));

  if (!isRazorpayConfigured()) {
    return errorResponse(
      "Online payment is currently unavailable. Please try again later.",
      503,
    );
  }

  const pendingOrder = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: session.user.id,
        total,
        status: "pending",
        address: addressData,
        paymentMethod: "RAZORPAY",
        items: { create: orderItems },
      },
      select: { id: true },
    });

    if (body.saveAddress) {
      await tx.address.create({
        data: {
          userId: session.user.id,
          ...addressData,
        },
      });
    }

    return created;
  });

  const razorpayOrder = await createRazorpayOrder(total);

  await prisma.order.update({
    where: { id: pendingOrder.id },
    data: { paymentId: razorpayOrder.id },
  });

  return successResponse(
    {
      orderId: pendingOrder.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      subtotal,
      deliveryFee,
      total,
    },
    201,
  );
  }),
);