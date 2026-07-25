import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      select: {
        id: true;
        productId: true;
        size: true;
        quantity: true;
        price: true;
        product: {
          select: {
            id: true;
            name: true;
            slug: true;
            images: true;
          };
        };
      };
    };
  };
}>;

export type OrderForEmail = Prisma.OrderGetPayload<{
  include: {
    items: {
      select: {
        id: true;
        productId: true;
        size: true;
        quantity: true;
        price: true;
        product: {
          select: {
            id: true;
            name: true;
            slug: true;
            images: true;
          };
        };
      };
    };
    user: {
      select: { id: true; email: true; name: true };
    };
  };
}>;

export async function fetchOrder(
  orderId: string,
): Promise<OrderWithItems | null> {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: {
          id: true,
          productId: true,
          size: true,
          quantity: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
    },
  });
}

export async function fetchOrderForEmail(
  orderId: string,
): Promise<OrderForEmail | null> {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: {
          id: true,
          productId: true,
          size: true,
          quantity: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });
}