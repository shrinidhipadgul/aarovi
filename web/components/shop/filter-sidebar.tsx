"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { CategorySelect } from "@/lib/queries/products";

interface FilterSidebarProps {
  categories: CategorySelect[];
  basePath: string;
  onNavigate?: () => void;
}

export default function FilterSidebar({
  categories,
  basePath,
  onNavigate,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const gender = searchParams.get("gender") ?? "";
  const selectedCategories = (searchParams.get("category") ?? "")
    .split(",")
    .filter(Boolean);
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const inStockOnly = searchParams.get("inStock") === "true";

  const pushParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      updater(params);
      router.push(`${basePath}?${params.toString()}`);
      onNavigate?.();
    },
    [searchParams, router, basePath, onNavigate],
  );

  const setGender = (value: string) => {
    pushParams((params) => {
      if (value) params.set("gender", value);
      else params.delete("gender");
      params.delete("category");
    });
  };

  const toggleCategory = (slug: string) => {
    pushParams((params) => {
      const current = (params.get("category") ?? "").split(",").filter(Boolean);
      const next = current.includes(slug)
        ? current.filter((c) => c !== slug)
        : [...current, slug];
      if (next.length > 0) params.set("category", next.join(","));
      else params.delete("category");
    });
  };

  const setPrice = (field: "minPrice" | "maxPrice", value: string) => {
    pushParams((params) => {
      if (value) params.set(field, value);
      else params.delete(field);
    });
  };

  const toggleInStock = () => {
    pushParams((params) => {
      if (inStockOnly) params.delete("inStock");
      else params.set("inStock", "true");
    });
  };

  const clearAll = () => {
    pushParams((params) => {
      params.delete("gender");
      params.delete("category");
      params.delete("subCategory");
      params.delete("minPrice");
      params.delete("maxPrice");
      params.delete("inStock");
    });
  };

  const visibleCategories = gender
    ? categories.filter((c) => c.gender === gender)
    : categories;

  const hasActiveFilters =
    !!gender ||
    selectedCategories.length > 0 ||
    !!minPrice ||
    !!maxPrice ||
    inStockOnly;

  return (
    <div className="space-y-7">
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="text-xs font-medium uppercase tracking-wider text-brand-gold hover:underline"
        >
          Clear all filters
        </button>
      )}

      {/* Gender */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-text/50">
          Gender
        </h3>
        <div className="flex flex-wrap gap-2">
          {["women", "men"].map((g) => {
            const active = gender === g;
            return (
              <button
                key={g}
                onClick={() => setGender(active ? "" : g)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  active
                    ? "bg-brand-primary text-white"
                    : "bg-white text-brand-text/70 hover:text-brand-gold"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-text/50">
          Categories
        </h3>
        <ul className="space-y-2">
          {visibleCategories.map((cat) => {
            const checked = selectedCategories.includes(cat.slug);
            return (
              <li key={cat.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-text/80">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(cat.slug)}
                    className="h-4 w-4 rounded border-brand-primary/20 accent-brand-primary"
                  />
                  <span className="capitalize">{cat.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-text/50">
          Price Range
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setPrice("minPrice", e.target.value)}
            className="w-full rounded-lg border border-brand-primary/15 bg-white px-3 py-1.5 text-sm text-brand-text outline-none focus:border-brand-gold"
          />
          <span className="text-brand-text/40">—</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setPrice("maxPrice", e.target.value)}
            className="w-full rounded-lg border border-brand-primary/15 bg-white px-3 py-1.5 text-sm text-brand-text outline-none focus:border-brand-gold"
          />
        </div>
      </div>

      {/* In stock */}
      <div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-text/80">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={toggleInStock}
            className="h-4 w-4 rounded border-brand-primary/20 accent-brand-primary"
          />
          <span>In stock only</span>
        </label>
      </div>
    </div>
  );
}