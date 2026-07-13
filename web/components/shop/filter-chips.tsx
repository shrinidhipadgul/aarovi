"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { CategorySelect } from "@/lib/queries/products";

interface FilterChipsProps {
  categories?: CategorySelect[];
  basePath: string;
}

export default function FilterChips({ categories, basePath }: FilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  const pushAfterRemove = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete(key);
    router.push(`${basePath}?${params.toString()}`);
  };

  const gender = searchParams.get("gender");
  if (gender) {
    chips.push({
      key: "gender",
      label: `Gender: ${gender}`,
      onRemove: () => pushAfterRemove("gender"),
    });
  }

  const categoryParam = searchParams.get("category");
  if (categoryParam && categories) {
    categoryParam.split(",").filter(Boolean).forEach((slug) => {
      const cat = categories.find((c) => c.slug === slug);
      chips.push({
        key: `category-${slug}`,
        label: cat ? cat.name : slug,
        onRemove: () => {
          const parts = categoryParam.split(",").filter((s) => s !== slug);
          const params = new URLSearchParams(searchParams.toString());
          params.delete("page");
          if (parts.length > 0) params.set("category", parts.join(","));
          else params.delete("category");
          router.push(`${basePath}?${params.toString()}`);
        },
      });
    });
  }

  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  if (minPrice) {
    chips.push({
      key: "minPrice",
      label: `Min: \u20B9${minPrice}`,
      onRemove: () => pushAfterRemove("minPrice"),
    });
  }

  if (maxPrice) {
    chips.push({
      key: "maxPrice",
      label: `Max: \u20B9${maxPrice}`,
      onRemove: () => pushAfterRemove("maxPrice"),
    });
  }

  if (searchParams.get("inStock") === "true") {
    chips.push({
      key: "inStock",
      label: "In Stock Only",
      onRemove: () => pushAfterRemove("inStock"),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/10 bg-white px-3 py-1 text-xs text-brand-text/70 transition-colors hover:border-brand-gold hover:text-brand-gold"
        >
          <span>{chip.label}</span>
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ))}
    </div>
  );
}