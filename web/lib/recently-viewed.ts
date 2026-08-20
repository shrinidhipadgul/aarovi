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

const EMPTY: RecentlyViewedProduct[] = [];
let cached: RecentlyViewedProduct[] = EMPTY;

export function addToRecentlyViewed(product: RecentlyViewedProduct) {
  try {
    const stored = getRecentlyViewed();
    const next = [
      product,
      ...stored.filter((p) => p.id !== product.id),
    ].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    cached = next;
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* localStorage not available */
  }
}

export function getRecentlyViewed(): RecentlyViewedProduct[] {
  if (typeof window === "undefined") return cached;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      if (cached !== EMPTY) cached = EMPTY;
      return cached;
    }
    const parsed = JSON.parse(raw) as RecentlyViewedProduct[];
    if (
      cached.length !== parsed.length ||
      !cached.every((p, i) => p.id === parsed[i]?.id)
    ) {
      cached = parsed;
    }
    return cached;
  } catch {
    return cached;
  }
}

export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    cached = EMPTY;
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* localStorage not available */
  }
}

export function pruneRecentlyViewed(activeIds: string[]) {
  if (typeof window === "undefined") return;
  try {
    const activeSet = new Set(activeIds);
    const stored = getRecentlyViewed();
    const next = stored.filter((p) => activeSet.has(p.id));
    if (next.length !== stored.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      cached = next;
      window.dispatchEvent(new Event(CHANGE_EVENT));
    }
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