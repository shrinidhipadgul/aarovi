"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  fetchCart,
  useCartItems,
  useIsCartLoaded,
  updateCartQuantity,
  removeFromCart,
  usePendingCart,
} from "@/lib/stores/cart";
import {
  useLocalCartItems,
  updateLocalCartQuantity,
  removeFromLocalCart,
} from "@/lib/stores/local-cart";
import { calculateTotals } from "@/lib/checkout";

const formatMoney = (n: number) =>
  `\u20B9${n.toLocaleString("en-IN")}`;

const DEBOUNCE_MS = 300;

export default function CartPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const loggedIn = !!session;
  const serverItems = useCartItems();
  const localItems = useLocalCartItems();
  const loaded = useIsCartLoaded();
  const pending = usePendingCart();
  const [error, setError] = useState(false);
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingUpdates = useRef<Map<string, number>>(new Map());

  const items = loggedIn ? serverItems : localItems;

  useEffect(() => {
    if (loggedIn && !loaded) {
      fetchCart().catch(() => setError(true));
    }
  }, [loggedIn, loaded]);

  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const debouncedUpdate = useCallback(
    (id: string, qty: number) => {
      pendingUpdates.current.set(id, qty);
      const existing = debounceTimers.current.get(id);
      if (existing) clearTimeout(existing);

      debounceTimers.current.set(
        id,
        setTimeout(() => {
          const finalQty = pendingUpdates.current.get(id);
          pendingUpdates.current.delete(id);
          if (finalQty === undefined) return;

          if (loggedIn) {
            updateCartQuantity(id, finalQty);
          } else {
            const item = localItems.find((i) => `${i.productId}:${i.size}` === id);
            if (item) updateLocalCartQuantity(item.productId, item.size, finalQty);
          }
        }, DEBOUNCE_MS),
      );
    },
    [loggedIn, localItems],
  );

  const handleQuantity = (
    id: string,
    delta: number,
    currentQty: number,
  ) => {
    const next = currentQty + delta;
    if (next < 1) {
      debounceTimers.current.forEach((timer) => clearTimeout(timer));
      debounceTimers.current.delete(id);
      pendingUpdates.current.delete(id);
      if (loggedIn) {
        removeFromCart(id);
      } else {
        const item = localItems.find((i) => `${i.productId}:${i.size}` === id);
        if (item) removeFromLocalCart(item.productId, item.size);
      }
      return;
    }
    debouncedUpdate(id, next);
  };

  const handleRemove = async (id: string) => {
    debounceTimers.current.forEach((timer) => clearTimeout(timer));
    debounceTimers.current.delete(id);
    pendingUpdates.current.delete(id);
    if (loggedIn) {
      const result = await removeFromCart(id);
      if (result === "unauthorized") {
        router.push("/sign-in");
      }
    } else {
      const item = localItems.find((i) => `${i.productId}:${i.size}` === id);
      if (item) removeFromLocalCart(item.productId, item.size);
    }
  };

  if (!loggedIn && localItems.length === 0) {
    return <CartEmpty />;
  }

  if (loggedIn && error) {
    return <CartError onRetry={() => { setError(false); fetchCart().catch(() => setError(true)); }} />;
  }

  if (loggedIn && !loaded) {
    return <CartSkeleton />;
  }

  const totals = calculateTotals(
    items.map((item) => ({ price: item.product.price, quantity: item.quantity })),
  );

  const getItemKey = (item: typeof items[number]): string => {
    if ("id" in item && typeof (item as Record<string, unknown>).id === "string") {
      return (item as Record<string, string>).id;
    }
    return `${item.productId}:${item.size}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-brand-primary">Your Cart</h1>

      {!loggedIn && items.length > 0 && (
        <div className="mt-4 rounded-lg bg-brand-gold/10 px-4 py-3 text-sm text-brand-gold">
          <Link href="/sign-in" className="font-semibold underline underline-offset-2 hover:no-underline">
            Sign in
          </Link>{" "}
          to save your cart and place your order.
        </div>
      )}

      {items.length === 0 ? (
        <CartEmpty />
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
          <section>
            <ul className="divide-y divide-brand-primary/10 rounded-xl border border-brand-primary/10">
              {items.map((item) => {
                const image = item.product.images?.[0];
                const itemKey = getItemKey(item);
                return (
                  <li
                    key={itemKey}
                    className="flex items-center gap-4 px-5 py-4 sm:gap-6"
                  >
                    <div className="h-20 w-16 flex-none overflow-hidden rounded-lg border border-brand-primary/10 bg-brand-bg">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-brand-text/30">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${item.productId}`}
                        className="text-sm font-medium text-brand-primary transition-colors hover:text-brand-gold"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-brand-text/60">
                        Size: {item.size}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-brand-text">
                        {formatMoney(item.product.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleQuantity(itemKey, -1, item.quantity)
                        }
                        disabled={pending}
                        className="flex h-7 w-7 items-center justify-center rounded border border-brand-primary/15 text-sm transition-colors hover:bg-brand-bg disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        &minus;
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-brand-text">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantity(itemKey, 1, item.quantity)
                        }
                        disabled={pending}
                        className="flex h-7 w-7 items-center justify-center rounded border border-brand-primary/15 text-sm transition-colors hover:bg-brand-bg disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-brand-primary">
                        {formatMoney(item.product.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => handleRemove(itemKey)}
                        disabled={pending}
                        className="mt-1 text-xs text-red-400 transition-colors hover:text-red-600 disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside>
            <div className="rounded-xl border border-brand-primary/10 bg-white p-6">
              <h2 className="text-lg font-semibold text-brand-primary">
                Order Summary
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-brand-text/60">Subtotal</dt>
                  <dd className="font-medium text-brand-text">
                    {formatMoney(totals.subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-brand-text/60">Delivery</dt>
                  <dd className="font-medium text-brand-text">
                    {totals.deliveryFee === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatMoney(totals.deliveryFee)
                    )}
                  </dd>
                </div>
                <div className="border-t border-brand-primary/10 pt-3">
                  <div className="flex justify-between">
                    <dt className="font-semibold text-brand-text">Total</dt>
                    <dd className="font-semibold text-brand-primary">
                      {formatMoney(totals.total)}
                    </dd>
                  </div>
                </div>
              </dl>
              <button
                onClick={() => router.push(loggedIn ? "/place-order" : "/sign-in")}
                disabled={items.length === 0}
                className="mt-6 w-full rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggedIn ? "Place Order" : "Sign In to Order"}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function CartEmpty() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-brand-primary">Your Cart</h1>
      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-primary/15 py-20 text-center">
        <p className="text-lg font-medium text-brand-text">Your cart is empty</p>
        <p className="mt-2 text-sm text-brand-text/60">
          Add items to get started.
        </p>
        <Link
          href="/shop/collection"
          className="mt-8 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
}

function CartError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-brand-primary">Your Cart</h1>
      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-red-200 py-20 text-center">
        <p className="text-lg font-medium text-red-600">Could not load cart</p>
        <p className="mt-2 text-sm text-brand-text/60">Something went wrong. Please try again.</p>
        <button
          onClick={onRetry}
          className="mt-8 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-8 w-40 rounded bg-brand-primary/10" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-brand-primary/10 px-5 py-4">
            <div className="h-20 w-16 flex-none rounded-lg bg-brand-primary/5" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-brand-primary/10" />
              <div className="h-3 w-24 rounded bg-brand-primary/5" />
              <div className="h-4 w-16 rounded bg-brand-primary/10" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-brand-primary/5" />
              <div className="h-4 w-6 rounded bg-brand-primary/5" />
              <div className="h-7 w-7 rounded bg-brand-primary/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
