import { atom } from "nanostores";
import { useStore } from "@nanostores/react";

type AddResult = "ok" | "unauthorized" | "error";

export const cartCount = atom(0);
export const pendingCart = atom(false);

let fetched = false;

export async function fetchCart() {
  if (fetched) return;
  fetched = true;

  try {
    const res = await fetch("/api/cart");
    if (!res.ok) {
      if (res.status === 401) return;
      throw new Error("Failed to fetch cart");
    }
    const json = await res.json();
    const count = (json.data ?? []).reduce(
      (sum: number, item: { quantity: number }) => sum + item.quantity,
      0,
    );
    cartCount.set(count);
  } catch {
    fetched = false;
  }
}

export function resetCart() {
  cartCount.set(0);
  fetched = false;
}

export async function addToCart(
  productId: string,
  size: string,
  quantity: number,
): Promise<AddResult> {
  if (pendingCart.get()) return "error";

  const prev = cartCount.get();
  pendingCart.set(true);
  cartCount.set(prev + quantity);

  try {
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, size, quantity }),
    });

    if (res.status === 401) {
      cartCount.set(prev);
      return "unauthorized";
    }

    if (!res.ok) {
      cartCount.set(prev);
      return "error";
    }

    return "ok";
  } catch {
    cartCount.set(prev);
    return "error";
  } finally {
    pendingCart.set(false);
  }
}

export function useCartCount() {
  return useStore(cartCount);
}

export function usePendingCart() {
  return useStore(pendingCart);
}
