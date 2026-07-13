import { atom, computed } from "nanostores";
import { useStore } from "@nanostores/react";

type ToggleResult = "ok" | "unauthorized" | "error";

export const wishlistIds = atom<Set<string>>(new Set());
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
    wishlistIds.set(new Set<string>(json.data ?? []));
    isWishlistLoaded.set(true);
  } catch {
    fetched = false;
  }
}

export function resetWishlist() {
  wishlistIds.set(new Set());
  isWishlistLoaded.set(false);
  fetched = false;
}

export async function toggleWishlist(productId: string): Promise<ToggleResult> {
  if (pendingToggle.get() !== null) return "error";

  const current = wishlistIds.get();
  const had = current.has(productId);
  const next = new Set(current);

  if (had) {
    next.delete(productId);
  } else {
    next.add(productId);
  }

  pendingToggle.set(productId);
  wishlistIds.set(next);

  try {
    const res = await fetch("/api/wishlist/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    if (res.status === 401) {
      wishlistIds.set(current);
      return "unauthorized";
    }

    if (!res.ok) {
      wishlistIds.set(current);
      return "error";
    }

    return "ok";
  } catch {
    wishlistIds.set(current);
    return "error";
  } finally {
    pendingToggle.set(null);
  }
}

export function useWishlistIds() {
  return useStore(wishlistIds);
}

export function useWishlistCount() {
  return useStore(wishlistCount);
}

export function useIsWishlistLoaded() {
  return useStore(isWishlistLoaded);
}

export function usePendingToggle() {
  return useStore(pendingToggle);
}
