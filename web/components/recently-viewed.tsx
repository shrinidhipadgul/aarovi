"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/product-card";
import {
  getRecentlyViewed,
  clearRecentlyViewed,
  type RecentlyViewedProduct,
} from "@/lib/recently-viewed";

interface RecentlyViewedProps {
  excludeId?: string;
}

export default function RecentlyViewed({ excludeId }: RecentlyViewedProps) {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(getRecentlyViewed());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const filtered = excludeId
    ? products.filter((p) => p.id !== excludeId)
    : products;

  if (filtered.length === 0) return null;

  const handleClear = () => {
    clearRecentlyViewed();
    setProducts([]);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-brand-primary">
          Recently Viewed
        </h2>
        <button
          onClick={handleClear}
          className="text-xs font-medium uppercase tracking-wider text-brand-gold hover:underline"
        >
          Clear
        </button>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-2">
        {filtered.map((product) => (
          <div key={product.id} className="min-w-[220px] w-[220px] shrink-0 sm:min-w-[240px] sm:w-[240px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
