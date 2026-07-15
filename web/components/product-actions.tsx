"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { addToCart, usePendingCart } from "@/lib/stores/cart";
import {
  addToLocalCart,
} from "@/lib/stores/local-cart";
import {
  useWishlistIds,
  toggleWishlist,
  usePendingToggle,
} from "@/lib/stores/wishlist";
import SizeChartModal from "./size-chart-modal";

interface ProductActionsProps {
  productId: string;
  sizes: string[];
  inStock: boolean;
}

export default function ProductActions({
  productId,
  sizes,
  inStock,
}: ProductActionsProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [addedMsg, setAddedMsg] = useState(false);

  const pending = usePendingCart();
  const wishlistIds = useWishlistIds();
  const wishlistPending = usePendingToggle();
  const wishlisted = wishlistIds.has(productId);

  const { data: session } = authClient.useSession();
  const loggedIn = !!session;

  const handleAddToCart = useCallback(async () => {
    if (!selectedSize || pending) return;

    if (!loggedIn) {
      addToLocalCart({
        productId,
        size: selectedSize,
        quantity,
        product: { id: productId, name: "", slug: "", price: 0, images: [] },
      });
      router.push(`/product/${productId}?added=1`);
      setAddedMsg(true);
      setTimeout(() => setAddedMsg(false), 2000);
      return;
    }

    const result = await addToCart(productId, selectedSize, quantity);
    if (result === "unauthorized") {
      router.push(
        `/sign-in?callbackURL=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }
    if (result === "ok") {
      setAddedMsg(true);
      setTimeout(() => setAddedMsg(false), 2000);
    }
  }, [productId, selectedSize, quantity, pending, router, loggedIn]);

  const handleWishlist = useCallback(async () => {
    if (wishlistPending === productId) return;
    const result = await toggleWishlist(productId);
    if (result === "unauthorized") {
      router.push(
        `/sign-in?callbackURL=${encodeURIComponent(window.location.pathname)}`,
      );
    }
  }, [productId, wishlistPending, router]);

  const disabled = !inStock || !selectedSize || pending;

  return (
    <div className="space-y-6">
      {!inStock && (
        <div className="inline-block rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
          Out of Stock
        </div>
      )}

      {/* Size selector */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-brand-text">Size</h3>
          <button
            onClick={() => setSizeChartOpen(true)}
            aria-haspopup="dialog"
            className="text-xs font-medium text-brand-gold underline-offset-2 hover:underline"
          >
            Size Guide
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => {
            const active = selectedSize === s;
            return (
              <button
                key={s}
                onClick={() => setSelectedSize(active ? null : s)}
                disabled={!inStock}
                aria-pressed={active}
                className={`flex h-11 w-12 items-center justify-center rounded-lg border text-sm font-medium transition-all ${
                  active
                    ? "border-brand-primary bg-brand-primary text-white"
                    : "border-brand-primary/15 bg-white text-brand-text hover:border-brand-gold"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-brand-text">Quantity</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-primary/15 bg-white text-brand-text transition-colors hover:border-brand-gold disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>
          <span className="flex h-10 w-14 items-center justify-center rounded-lg border border-brand-primary/15 bg-white text-sm font-medium text-brand-text">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            disabled={quantity >= 10}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-primary/15 bg-white text-brand-text transition-colors hover:border-brand-gold disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add to cart */}
      <button
        onClick={handleAddToCart}
        disabled={disabled}
        className={`w-full rounded-lg py-3 text-sm font-semibold transition-all ${
          disabled
            ? "cursor-not-allowed bg-brand-primary/30 text-white/60"
            : "bg-brand-primary text-white hover:bg-brand-primary/90 active:scale-[0.98]"
        }`}
      >
        {pending ? "Adding…" : addedMsg ? "Added to Cart!" : "Add to Cart"}
      </button>

      {/* Wishlist */}
      <button
        onClick={handleWishlist}
        disabled={wishlistPending === productId}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand-primary/15 bg-white py-2.5 text-sm font-medium text-brand-text transition-colors hover:border-brand-gold disabled:opacity-50"
      >
        <svg
          className={`h-5 w-5 ${
            wishlisted
              ? "fill-red-500 text-red-500"
              : "fill-none text-brand-text/60"
          }`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      </button>

      <SizeChartModal
        open={sizeChartOpen}
        onClose={() => setSizeChartOpen(false)}
      />
    </div>
  );
}
