import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { statusLabel, statusBadgeColor } from "@/lib/order-status";
import { OrdersListClient } from "./orders-list-client";

export const metadata: Metadata = {
  title: "Orders",
  description: "Manage orders — Aarovi admin.",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage() {
  const limit = 20;

  const [total, rows] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
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
    }),
  ]);

  const orders = rows.map((order) => ({
    id: order.id,
    userId: order.userId,
    userEmail: order.user?.email ?? null,
    userName: order.user?.name ?? null,
    total: order.total,
    status: order.status,
    statusLabel: statusLabel(order.status),
    badgeColor: statusBadgeColor(order.status),
    paymentMethod: order.paymentMethod,
    paymentId: order.paymentId,
    itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-brand-primary">
        Orders
      </h1>
      <p className="mt-1 text-sm text-brand-text/60">{total} total</p>
      <OrdersListClient initialOrders={orders} initialTotal={total} initialLimit={limit} />
    </div>
  );
}