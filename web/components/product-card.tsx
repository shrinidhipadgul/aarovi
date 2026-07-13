"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt: number | null;
  images: string[];
  sizes: string[];
  inStock: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(false); // TODO(#20): init from wishlist API
  const [imgError, setImgError] = useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlisted(!wishlisted);
    // TODO(#20): call wishlist API to add/remove
  };

  const handleClick = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group cursor-pointer"
    >
      {/* Image container */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-brand-bg">
        {imgError ? (
          <div className="flex h-full w-full items-center justify-center bg-brand-bg">
            <span className="text-4xl font-bold text-brand-primary/20">
              {product.name.charAt(0)}
            </span>
          </div>
        ) : (
          <Image
            src={product.images[0] ?? ""}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        )}

        {/* Wishlist toggle */}
        <button
          onClick={handleWishlist}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg
            className={`h-5 w-5 transition-colors ${
              wishlisted
                ? "fill-red-500 text-red-500"
                : "fill-none text-brand-text/60"
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Out of stock badge */}
        {!product.inStock && (
          <div className="absolute bottom-3 left-3 rounded-full bg-brand-text/80 px-3 py-1 text-xs font-medium text-white">
            Out of Stock
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-2 text-sm font-medium text-brand-text">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-brand-primary">
            &#8377;{product.price.toLocaleString("en-IN")}
          </span>
          {product.compareAt && product.compareAt > product.price && (
            <span className="text-xs text-brand-text/50 line-through">
              &#8377;{product.compareAt.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        {product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.slice(0, 4).map((size) => (
              <span
                key={size}
                className="inline-block rounded border border-brand-primary/10 px-2 py-0.5 text-[11px] text-brand-text/60"
              >
                {size}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-lg bg-brand-primary/5" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-brand-primary/5" />
        <div className="h-4 w-1/3 rounded bg-brand-primary/5" />
        <div className="flex gap-2">
          <div className="h-5 w-8 rounded bg-brand-primary/5" />
          <div className="h-5 w-8 rounded bg-brand-primary/5" />
          <div className="h-5 w-8 rounded bg-brand-primary/5" />
        </div>
      </div>
    </div>
  );
}
