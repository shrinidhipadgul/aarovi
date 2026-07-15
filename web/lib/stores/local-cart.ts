import { atom, computed } from "nanostores";
import { useStore } from "@nanostores/react";

interface LocalCartItem {
  productId: string;
  size: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
  };
}

const STORAGE_KEY = "aarovi:cart-items";

function readStorage(): LocalCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: LocalCartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage full — ignore */
  }
}

export const localCartItems = atom<LocalCartItem[]>(readStorage());
export const localCartCount = computed(localCartItems, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0),
);

export function addToLocalCart(item: LocalCartItem) {
  const current = localCartItems.get();
  const existing = current.find(
    (i) => i.productId === item.productId && i.size === item.size,
  );

  const next = existing
    ? current.map((i) =>
        i.productId === item.productId && i.size === item.size
          ? { ...i, quantity: i.quantity + item.quantity }
          : i,
      )
    : [...current, item];

  localCartItems.set(next);
  writeStorage(next);
}

export function updateLocalCartQuantity(
  productId: string,
  size: string,
  quantity: number,
) {
  const current = localCartItems.get();
  const next = current.map((i) =>
    i.productId === productId && i.size === size ? { ...i, quantity } : i,
  );
  localCartItems.set(next);
  writeStorage(next);
}

export function removeFromLocalCart(productId: string, size: string) {
  const current = localCartItems.get();
  const next = current.filter(
    (i) => i.productId !== productId || i.size !== size,
  );
  localCartItems.set(next);
  writeStorage(next);
}

export function clearLocalCart() {
  localCartItems.set([]);
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function useLocalCartCount() {
  return useStore(localCartCount);
}

export function useLocalCartItems() {
  return useStore(localCartItems);
}
