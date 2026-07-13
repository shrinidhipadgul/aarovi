"use client";

import { useEffect } from "react";

const STORAGE_KEY = "aarovi:recently-viewed";
const MAX_ITEMS = 10;

export default function RecentlyViewedTracker({
  productId,
}: {
  productId: string;
}) {
  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]",
      );
      const next = [
        productId,
        ...stored.filter((id) => id !== productId),
      ].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* localStorage not available */
    }
  }, [productId]);

  return null;
}
