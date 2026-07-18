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
    <section className="bg-brand-ivory texture-grain">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between border-b border-brand-primary/15 pb-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-brand-gold">
              Your eye, lately
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-brand-primary sm:text-3xl">
              Recently{" "}
              <span className="font-serif italic text-brand-gold">Viewed</span>
            </h2>
          </div>
          <button
            onClick={handleClear}
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-gold transition-colors hover:text-brand-primary"
          >
            Clear
          </button>
        </div>
        <div className="mt-8 flex gap-6 overflow-x-auto pb-2">
          {filtered.map((product) => (
            <div key={product.id} className="min-w-[220px] w-[220px] shrink-0 sm:min-w-[240px] sm:w-[240px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
