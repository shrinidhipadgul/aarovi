"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface ProductSelect {
  id: string;
  name: string;
  slug: string;
  images: string[];
}

interface OrderItemData {
  id: string;
  productId: string;
  size: string;
  quantity: number;
  price: number;
  product: ProductSelect;
}

interface OrderData {
  id: string;
  userId: string;
  total: number;
  status: string;
  address: unknown;
  paymentMethod: string;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemData[];
  statusLabel: string;
  badgeColor: string;
  itemCount: number;
}

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));

const formatMoney = (n: number) =>
  `\u20B9${n.toLocaleString("en-IN")}`;

const truncateId = (id: string) => id.slice(-8);

export default function OrdersPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const loggedIn = !!session;

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!loggedIn) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/orders");
        if (cancelled) return;
        if (res.status === 401) {
          const callbackURL = encodeURIComponent("/orders");
          router.push(`/sign-in?callbackURL=${callbackURL}`);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch orders");
        const json = await res.json();
        if (!cancelled) setOrders(json.data ?? []);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [loggedIn, router, retryKey]);

  if (!loggedIn) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold text-brand-primary">
          My Orders
        </h1>
        <p className="mt-3 text-brand-text/60">
          Sign in to view your order history.
        </p>
        <Link
          href="/sign-in"
          className="mt-8 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-brand-primary">
          My Orders
        </h1>
        {!loading && !error && (
          <p className="mt-1 text-sm text-brand-text/60">
            {orders.length} {orders.length === 1 ? "order" : "orders"} placed
          </p>
        )}
      </div>

      {loading && <OrdersSkeleton />}

      {error && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-200 py-20 text-center">
          <p className="text-lg font-medium text-red-600">
            Could not load orders
          </p>
          <p className="mt-2 text-sm text-brand-text/60">
            Something went wrong. Please try again.
          </p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="mt-8 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-primary/15 py-20 text-center">
          <p className="text-lg font-medium text-brand-text">
            No orders yet
          </p>
          <p className="mt-2 text-sm text-brand-text/60">
            Start shopping to see your orders here.
          </p>
          <Link
            href="/shop/collection"
            className="mt-8 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
          >
            Start Shopping
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="divide-y divide-brand-primary/10 rounded-xl border border-brand-primary/10">
          {orders.map((order) => {
            const firstItem = order.items[0];
            const image = firstItem?.product.images?.[0];

            return (
              <li key={order.id}>
                <Link
                  href={`/status/${order.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-brand-bg sm:gap-6"
                >
                  <div className="h-16 w-14 flex-none overflow-hidden rounded-lg border border-brand-primary/10 bg-brand-bg sm:h-20 sm:w-16">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={firstItem?.product.name ?? "Order item"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-brand-text/30">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-sm font-medium text-brand-text">
                        #{truncateId(order.id)}
                      </p>
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${order.badgeColor}`}
                      >
                        {order.statusLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-brand-text/60">
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-brand-text/60">
                      {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="flex-none text-right">
                    <p className="text-sm font-semibold text-brand-primary">
                      {formatMoney(order.total)}
                    </p>
                    <span className="text-xs text-brand-gold">&rarr;</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-1 rounded-xl border border-brand-primary/10">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 sm:gap-6"
        >
          <div className="h-16 w-14 flex-none rounded-lg bg-brand-primary/5 sm:h-20 sm:w-16" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 rounded bg-brand-primary/10" />
            <div className="h-3 w-32 rounded bg-brand-primary/5" />
            <div className="h-3 w-16 rounded bg-brand-primary/5" />
          </div>
          <div className="flex-none text-right">
            <div className="h-4 w-16 rounded bg-brand-primary/10" />
          </div>
        </div>
      ))}
    </div>
  );
}