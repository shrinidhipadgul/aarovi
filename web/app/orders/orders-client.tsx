"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import CustomizeDetailsModal from "@/components/orders/customize-details-modal";

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

interface CustomizationRequestData {
  id: string;
  garment: string;
  rawGarment?: string;
  statusLabel: string;
  rawStatus: string;
  badgeColor: string;
  occasion: string | null;
  budgetTier: string | null;
  quotedPrice: number | null;
  notes: string | null;
  requiredBy: string | null;
  createdAt: string;
  updatedAt: string;
  mediaCount: number;
  previewMediaUrl: string | null;
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
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();
  const loggedIn = !!session;

  const initialTab = searchParams.get("tab") === "customize" ? "customize" : "orders";
  const initialId = searchParams.get("id");

  const [activeTab, setActiveTab] = useState<"orders" | "customize">(initialTab);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [customizations, setCustomizations] = useState<CustomizationRequestData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingCustomizations, setLoadingCustomizations] = useState(true);
  const [errorOrders, setErrorOrders] = useState(false);
  const [errorCustomizations, setErrorCustomizations] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const [selectedCustomizeId, setSelectedCustomizeId] = useState<string | null>(initialId);

  useEffect(() => {
    if (searchParams.get("tab") === "customize") {
      setActiveTab("customize");
    }
    if (searchParams.get("id")) {
      setSelectedCustomizeId(searchParams.get("id"));
    }
  }, [searchParams]);

  // Fetch standard orders
  useEffect(() => {
    if (!loggedIn) return;

    let cancelled = false;

    const loadOrders = async () => {
      setLoadingOrders(true);
      setErrorOrders(false);
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
        if (!cancelled) setErrorOrders(true);
      } finally {
        if (!cancelled) setLoadingOrders(false);
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [loggedIn, router, retryKey]);

  // Fetch customization requests
  useEffect(() => {
    if (!loggedIn) return;

    let cancelled = false;

    const loadCustomizations = async () => {
      setLoadingCustomizations(true);
      setErrorCustomizations(false);
      try {
        const res = await fetch("/api/customize");
        if (cancelled) return;
        if (res.status === 401) return;
        if (!res.ok) throw new Error("Failed to fetch customization requests");
        const json = await res.json();
        if (!cancelled) setCustomizations(json.data ?? []);
      } catch {
        if (!cancelled) setErrorCustomizations(true);
      } finally {
        if (!cancelled) setLoadingCustomizations(false);
      }
    };

    loadCustomizations();

    return () => {
      cancelled = true;
    };
  }, [loggedIn, retryKey]);

  if (!loggedIn) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold text-brand-primary">
          My Orders & Customizations
        </h1>
        <p className="mt-3 text-brand-text/60">
          Sign in to view your order history and track customization requests.
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

  const isLoading = activeTab === "orders" ? loadingOrders : loadingCustomizations;
  const isError = activeTab === "orders" ? errorOrders : errorCustomizations;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-brand-primary">
          My Orders
        </h1>
        <p className="mt-1 text-sm text-brand-text/60">
          Track ready-to-wear orders and custom cloth atelier briefs.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="mb-8 border-b border-brand-primary/10">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-medium transition-colors ${
              activeTab === "orders"
                ? "border-brand-primary text-brand-primary font-semibold"
                : "border-transparent text-brand-text/60 hover:border-brand-primary/30 hover:text-brand-text"
            }`}
          >
            <span>Ready-to-Wear Orders</span>
            {!loadingOrders && !errorOrders && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === "orders"
                    ? "bg-brand-primary text-white"
                    : "bg-brand-primary/10 text-brand-text/70"
                }`}
              >
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("customize")}
            className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-medium transition-colors ${
              activeTab === "customize"
                ? "border-brand-primary text-brand-primary font-semibold"
                : "border-transparent text-brand-text/60 hover:border-brand-primary/30 hover:text-brand-text"
            }`}
          >
            <span>Customize Cloth</span>
            {!loadingCustomizations && !errorCustomizations && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === "customize"
                    ? "bg-brand-primary text-white"
                    : "bg-brand-primary/10 text-brand-text/70"
                }`}
              >
                {customizations.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Skeleton Loading */}
      {isLoading && <OrdersSkeleton />}

      {/* Error View */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-200 py-20 text-center">
          <p className="text-lg font-medium text-red-600">
            {activeTab === "orders"
              ? "Could not load orders"
              : "Could not load customization requests"}
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

      {/* Standard Orders Tab Content */}
      {activeTab === "orders" && !isLoading && !isError && (
        <>
          {orders.length === 0 ? (
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
          ) : (
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
        </>
      )}

      {/* Customize Cloth Tab Content */}
      {activeTab === "customize" && !isLoading && !isError && (
        <>
          {customizations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-primary/15 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
                ✦
              </div>
              <p className="mt-4 text-lg font-medium text-brand-text">
                No customization requests yet
              </p>
              <p className="mt-2 max-w-sm text-sm text-brand-text/60">
                Design custom sarees, lehengas, anarkalis, or suits tailored to your exact measurements with our atelier.
              </p>
              <Link
                href="/customize"
                className="mt-8 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
              >
                Customize Your Garment
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-brand-primary/10 rounded-xl border border-brand-primary/10 bg-white">
              {customizations.map((item) => (
                <li key={item.id}>
                  <div className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-brand-bg/50 sm:flex-row sm:items-center sm:gap-6">
                    {/* Media preview or fallback */}
                    <div className="h-16 w-14 flex-none overflow-hidden rounded-lg border border-brand-primary/10 bg-brand-ivory flex items-center justify-center sm:h-20 sm:w-16">
                      {item.previewMediaUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.previewMediaUrl}
                          alt={item.garment}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-mono text-xs font-bold text-brand-gold">
                          BESPOKE
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="font-mono text-xs font-medium text-brand-gold">
                          REQ-#{truncateId(item.id).toUpperCase()}
                        </p>
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${item.badgeColor}`}
                        >
                          {item.statusLabel}
                        </span>
                      </div>

                      <h3 className="mt-1 text-base font-semibold text-brand-primary">
                        Bespoke {item.garment}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-text/60">
                        <span>Submitted {formatDate(item.createdAt)}</span>
                        {item.occasion && <span>• {item.occasion}</span>}
                        {item.mediaCount > 0 && (
                          <span>• {item.mediaCount} ref photo{item.mediaCount > 1 ? "s" : ""}</span>
                        )}
                      </div>
                    </div>

                    {/* Pricing & View Action */}
                    <div className="flex flex-row items-center justify-between gap-4 border-t border-brand-primary/5 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-brand-text/50 block sm:text-right">
                          Quote Status
                        </span>
                        <p className="text-sm font-semibold text-brand-primary sm:text-right">
                          {item.quotedPrice !== null && item.quotedPrice !== undefined
                            ? formatMoney(item.quotedPrice)
                            : "Pending Quote"}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedCustomizeId(item.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-primary/15 bg-white px-4 py-2 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
                      >
                        View Details &rarr;
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Details Modal */}
      <CustomizeDetailsModal
        requestId={selectedCustomizeId}
        onClose={() => setSelectedCustomizeId(null)}
      />
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
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-24 rounded bg-brand-primary/10" />
            <div className="h-3 w-32 rounded bg-brand-primary/5" />
            <div className="h-3 w-16 rounded bg-brand-primary/5" />
          </div>
          <div className="flex-none space-y-2 text-right">
            <div className="h-4 w-16 rounded bg-brand-primary/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
