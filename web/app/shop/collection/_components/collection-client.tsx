"use client";

import { Suspense, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product-card";
import FilterSidebar from "./filter-sidebar";
import SortDropdown from "./sort-dropdown";
import FilterChips from "./filter-chips";
import type { CategorySelect, ProductCardSelect } from "@/lib/queries/products";
import type { PaginationMeta } from "@/lib/types";

interface CollectionClientProps {
  initialProducts: ProductCardSelect[];
  initialPagination: PaginationMeta;
  categories: CategorySelect[];
}

export default function CollectionClient({
  initialProducts,
  initialPagination,
  categories,
}: CollectionClientProps) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductCardSelect[]>(initialProducts);
  const [pagination, setPagination] = useState<PaginationMeta>(initialPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(currentPage + 1));
      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (res.ok && Array.isArray(json.data)) {
        setProducts((prev) => [...prev, ...(json.data as ProductCardSelect[])]);
        setPagination(json.pagination);
        setCurrentPage((prev) => prev + 1);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [searchParams, currentPage]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-brand-primary sm:text-4xl">
          Collection
        </h1>
        <p className="mt-2 text-sm text-brand-text/60">
          {pagination.total} {pagination.total === 1 ? "product" : "products"} found
        </p>
      </div>

      <Suspense>
        <FilterChips categories={categories} />
      </Suspense>

      <div className="mt-4 flex items-center justify-between lg:mb-6">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-brand-primary/15 bg-white px-4 py-2 text-sm font-medium text-brand-text transition-colors hover:border-brand-gold lg:hidden"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 12h12M10 20h4" />
          </svg>
          Filters
        </button>
        <div className="ml-auto">
          <SortDropdown />
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">
            <Suspense>
              <FilterSidebar categories={categories} />
            </Suspense>
          </div>
        </aside>

        <div className="flex-1">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-primary/15 py-20 text-center">
              <p className="text-lg font-medium text-brand-text">
                No products found
              </p>
              <p className="mt-2 text-sm text-brand-text/60">
                Try adjusting your filters or search query.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {pagination.hasNextPage && (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="rounded-lg border border-brand-primary/15 bg-white px-6 py-2.5 text-sm font-semibold text-brand-primary transition-colors hover:border-brand-gold hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingMore ? "Loading…" : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-brand-bg p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-primary">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-brand-text/60 hover:text-brand-text"
                aria-label="Close filters"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Suspense>
              <FilterSidebar
                categories={categories}
                onNavigate={() => setMobileFiltersOpen(false)}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}