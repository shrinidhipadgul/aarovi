"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import ProductCard from "@/components/product-card";
import {
  fetchWishlist,
  useWishlistItems,
  useIsWishlistLoaded,
  removeWishlistItem,
  useWishlistCount,
} from "@/lib/stores/wishlist";
import { addToCart, usePendingCart } from "@/lib/stores/cart";

export default function WishlistPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const loggedIn = !!session;
  const items = useWishlistItems();
  const loaded = useIsWishlistLoaded();
  const count = useWishlistCount();
  const cartPending = usePendingCart();

  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [movingId, setMovingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ id: string; text: string } | null>(null);

  useEffect(() => {
    if (loggedIn && !loaded) {
      fetchWishlist();
    }
  }, [loggedIn, loaded]);

  const handleRemove = async (productId: string) => {
    const result = await removeWishlistItem(productId);
    if (result === "unauthorized") {
      router.push("/sign-in");
    }
  };

  const handleMoveToCart = async (productId: string, size: string) => {
    if (cartPending) return;
    setMovingId(productId);

    const addResult = await addToCart(productId, size, 1);

    if (addResult === "unauthorized") {
      router.push("/sign-in");
      return;
    }

    if (addResult === "error") {
      setMsg({ id: productId, text: "Failed to add to cart" });
      setTimeout(() => setMsg(null), 2000);
      return;
    }

    const removeResult = await removeWishlistItem(productId);

    if (removeResult === "error") {
      setMsg({
        id: productId,
        text: "Added to cart, but could not remove from wishlist",
      });
      setTimeout(() => setMsg(null), 3000);
      return;
    }

    setMsg({ id: productId, text: "Moved to Cart!" });
    setTimeout(() => setMsg(null), 2000);
    setMovingId(null);
  };

  if (!loggedIn) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold text-brand-primary">
          Your Wishlist
        </h1>
        <p className="mt-3 text-brand-text/60">
          Sign in to view and manage your wishlist.
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-brand-primary">
          Your Wishlist
        </h1>
        <p className="mt-1 text-sm text-brand-text/60">
          {count} {count === 1 ? "item" : "items"} saved
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-primary/15 py-20 text-center">
          <p className="text-lg font-medium text-brand-text">
            Your wishlist is empty
          </p>
          <p className="mt-2 text-sm text-brand-text/60">
            Save your favourite items to come back to them later.
          </p>
          <Link
            href="/shop/collection"
            className="mt-8 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const firstSize = item.product.sizes[0] ?? "";
            const selectedSize = sizes[item.productId] ?? firstSize;
            const isPending = movingId === item.productId;

            return (
              <div key={item.id} className="flex flex-col">
                <ProductCard product={item.product} />
                <div className="mt-3 flex items-center gap-2">
                  <select
                    value={selectedSize}
                    onChange={(e) =>
                      setSizes((prev) => ({
                        ...prev,
                        [item.productId]: e.target.value,
                      }))
                    }
                    disabled={!item.product.inStock || isPending}
                    className="rounded-lg border border-brand-primary/15 bg-white px-2 py-1.5 text-xs text-brand-text outline-none focus:border-brand-gold disabled:opacity-40"
                  >
                    {item.product.sizes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      handleMoveToCart(item.productId, selectedSize)
                    }
                    disabled={
                      !item.product.inStock || isPending || cartPending
                    }
                    className="flex-1 rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? "Moving…" : "Move to Cart"}
                  </button>
                  <button
                    onClick={() => handleRemove(item.productId)}
                    disabled={isPending}
                    className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-50 disabled:opacity-40"
                    aria-label="Remove from wishlist"
                  >
                    Remove
                  </button>
                </div>
                {msg && msg.id === item.productId && (
                  <p className="mt-1.5 text-xs text-brand-text/60">
                    {msg.text}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
