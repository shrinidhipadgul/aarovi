"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name A-Z" },
];

export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "newest";

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (e.target.value === "newest") params.delete("sort");
      else params.set("sort", e.target.value);
      router.push(`/shop/collection?${params.toString()}`);
    },
    [searchParams, router],
  );

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="sort"
        className="hidden text-xs font-medium uppercase tracking-wider text-brand-text/50 sm:inline"
      >
        Sort
      </label>
      <select
        id="sort"
        value={currentSort}
        onChange={handleChange}
        className="rounded-lg border border-brand-primary/15 bg-white px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-gold"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}