export interface RecentlyViewedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt: number | null;
  images: string[];
  sizes: string[];
  inStock: boolean;
}

const STORAGE_KEY = "aarovi:recently-viewed";
const MAX_ITEMS = 5;
const CHANGE_EVENT = "aarovi:rv-change";

export function addToRecentlyViewed(product: RecentlyViewedProduct) {
  try {
    const stored = getRecentlyViewed();
    const next = [
      product,
      ...stored.filter((p) => p.id !== product.id),
    ].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* localStorage not available */
  }
}

export function getRecentlyViewed(): RecentlyViewedProduct[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentlyViewedProduct[];
  } catch {
    return [];
  }
}

export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* localStorage not available */
  }
}

export function subscribeToChanges(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
