import { atom, computed } from "nanostores";
import { useStore } from "@nanostores/react";

interface CartItemProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
}

interface CartItemData {
  id: string;
  productId: string;
  size: string;
  quantity: number;
  product: CartItemProduct;
}

type AddResult = "ok" | "unauthorized" | "error";

export const cartItems = atom<CartItemData[]>([]);
export const cartCount = computed(cartItems, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0),
);
export const pendingCart = atom(false);
export const isCartLoaded = atom(false);

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
    const items = (json.data ?? []) as CartItemData[];
    cartItems.set(items);
    isCartLoaded.set(true);
  } catch {
    fetched = false;
  }
}

export function resetCart() {
  cartItems.set([]);
  isCartLoaded.set(false);
  fetched = false;
}

export async function addToCart(
  productId: string,
  size: string,
  quantity: number,
): Promise<AddResult> {
  if (pendingCart.get()) return "error";

  const prevItems = cartItems.get();
  pendingCart.set(true);

  try {
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, size, quantity }),
    });

    if (res.status === 401) {
      cartItems.set(prevItems);
      return "unauthorized";
    }

    if (!res.ok) {
      cartItems.set(prevItems);
      return "error";
    }

    fetched = false;
    fetchCart();
    return "ok";
  } catch {
    cartItems.set(prevItems);
    return "error";
  } finally {
    pendingCart.set(false);
  }
}

export async function updateCartQuantity(
  cartItemId: string,
  quantity: number,
): Promise<AddResult> {
  const prevItems = cartItems.get();
  cartItems.set(
    prevItems.map((item) =>
      item.id === cartItemId ? { ...item, quantity } : item,
    ),
  );

  try {
    const res = await fetch("/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId, quantity }),
    });

    if (res.status === 401) {
      cartItems.set(prevItems);
      return "unauthorized";
    }

    if (!res.ok) {
      cartItems.set(prevItems);
      return "error";
    }

    return "ok";
  } catch {
    cartItems.set(prevItems);
    return "error";
  }
}

export async function removeFromCart(
  cartItemId: string,
): Promise<AddResult> {
  const prevItems = cartItems.get();
  cartItems.set(prevItems.filter((item) => item.id !== cartItemId));

  try {
    const res = await fetch("/api/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId }),
    });

    if (res.status === 401) {
      cartItems.set(prevItems);
      return "unauthorized";
    }

    if (!res.ok) {
      cartItems.set(prevItems);
      return "error";
    }

    return "ok";
  } catch {
    cartItems.set(prevItems);
    return "error";
  }
}

export function useCartCount() {
  return useStore(cartCount);
}

export function useCartItems() {
  return useStore(cartItems);
}

export function usePendingCart() {
  return useStore(pendingCart);
}

export function useIsCartLoaded() {
  return useStore(isCartLoaded);
}
