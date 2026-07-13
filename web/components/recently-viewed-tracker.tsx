"use client";

import { useEffect } from "react";
import { addToRecentlyViewed, type RecentlyViewedProduct } from "@/lib/recently-viewed";

interface RecentlyViewedTrackerProps {
  product: RecentlyViewedProduct;
}

export default function RecentlyViewedTracker({
  product,
}: RecentlyViewedTrackerProps) {
  useEffect(() => {
    addToRecentlyViewed(product);
  }, [product]);

  return null;
}
