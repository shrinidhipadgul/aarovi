import { atom, computed } from "nanostores";
import { useStore } from "@nanostores/react";

interface WishlistItemData {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAt: number | null;
    images: string[];
    sizes: string[];
    inStock: boolean;
  };
}

type ToggleResult = "ok" | "unauthorized" | "error";
type RemoveResult = "ok" | "unauthorized" | "error";

export const wishlistIds = atom<Set<string>>(new Set());
export const wishlistItems = atom<WishlistItemData[]>([]);
export const wishlistCount = computed(wishlistIds, (ids) => ids.size);
export const isWishlistLoaded = atom(false);
export const pendingToggle = atom<string | null>(null);

let fetched = false;

export async function fetchWishlist() {
  if (fetched) return;
  fetched = true;

  try {
    const res = await fetch("/api/wishlist");
    if (!res.ok) {
      if (res.status === 401) return;
      throw new Error("Failed to fetch wishlist");
    }
    const json = await res.json();
    const items = (json.data ?? []) as WishlistItemData[];
    wishlistItems.set(items);
    wishlistIds.set(new Set<string>(items.map((i) => i.productId)));
    isWishlistLoaded.set(true);
  } catch {
    fetched = false;
  }
}

export function resetWishlist() {
  wishlistIds.set(new Set());
  wishlistItems.set([]);
  isWishlistLoaded.set(false);
  fetched = false;
}

export async function toggleWishlist(productId: string): Promise<ToggleResult> {
  if (pendingToggle.get() !== null) return "error";

  const currentIds = wishlistIds.get();
  const currentItems = wishlistItems.get();
  const had = currentIds.has(productId);
  const nextIds = new Set(currentIds);

  if (had) {
    nextIds.delete(productId);
    wishlistItems.set(currentItems.filter((i) => i.productId !== productId));
  } else {
    nextIds.add(productId);
  }

  pendingToggle.set(productId);
  wishlistIds.set(nextIds);

  try {
    const res = await fetch("/api/wishlist/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    if (res.status === 401) {
      wishlistIds.set(currentIds);
      wishlistItems.set(currentItems);
      return "unauthorized";
    }

    if (!res.ok) {
      wishlistIds.set(currentIds);
      wishlistItems.set(currentItems);
      return "error";
    }

    if (!had) {
      fetched = false;
      fetchWishlist();
    }

    return "ok";
  } catch {
    wishlistIds.set(currentIds);
    wishlistItems.set(currentItems);
    return "error";
  } finally {
    pendingToggle.set(null);
  }
}

export async function removeWishlistItem(
  productId: string,
): Promise<RemoveResult> {
  const currentIds = wishlistIds.get();
  const currentItems = wishlistItems.get();
  const next = new Set(currentIds);
  next.delete(productId);

  wishlistIds.set(next);
  wishlistItems.set(currentItems.filter((i) => i.productId !== productId));

  try {
    const res = await fetch("/api/wishlist/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    if (res.status === 401) {
      wishlistIds.set(currentIds);
      wishlistItems.set(currentItems);
      return "unauthorized";
    }

    if (!res.ok) {
      wishlistIds.set(currentIds);
      wishlistItems.set(currentItems);
      return "error";
    }

    return "ok";
  } catch {
    wishlistIds.set(currentIds);
    wishlistItems.set(currentItems);
    return "error";
  }
}

export function useWishlistIds() {
  return useStore(wishlistIds);
}

export function useWishlistCount() {
  return useStore(wishlistCount);
}

export function useWishlistItems() {
  return useStore(wishlistItems);
}

export function useIsWishlistLoaded() {
  return useStore(isWishlistLoaded);
}

export function usePendingToggle() {
  return useStore(pendingToggle);
}
