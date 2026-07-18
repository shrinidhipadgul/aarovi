"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, canHover, prefersReducedMotion } from "@/lib/animations";
import { useWishlistIds, toggleWishlist, usePendingToggle } from "@/lib/stores/wishlist";

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
  const cardRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLButtonElement>(null);
  const [imgError, setImgError] = useState(false);
  const [img2Error, setImg2Error] = useState(false);
  const hasSecondImage = product.images.length > 1;
  const wishlistIds = useWishlistIds();
  const pending = usePendingToggle();
  const wishlisted = wishlistIds.has(product.id);

  const spawnParticles = (origin: HTMLElement) => {
    const container = imgContainerRef.current;
    if (!container || prefersReducedMotion()) return;
    const btn = origin.getBoundingClientRect();
    const cr = container.getBoundingClientRect();
    const cx = btn.left + btn.width / 2 - cr.left;
    const cy = btn.top + btn.height / 2 - cr.top;
    for (let i = 0; i < 5; i++) {
      const dot = document.createElement("span");
      dot.className =
        "pointer-events-none absolute z-20 h-[5px] w-[5px] rounded-full bg-amber-200";
      dot.style.left = `${cx}px`;
      dot.style.top = `${cy}px`;
      container.appendChild(dot);
      const angle = (Math.PI * 2 * i) / 5;
      const dist = 16 + Math.random() * 20;
      gsap.to(dot, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        scale: 0,
        duration: 0.55,
        ease: "power3.out",
        onComplete: () => dot.remove(),
      });
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pending === product.id) return;
    const result = await toggleWishlist(product.id);
    if (result === "unauthorized") {
      router.push(`/sign-in?callbackURL=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (heartRef.current) {
      spawnParticles(heartRef.current);
      gsap.fromTo(
        heartRef.current,
        { scale: 1 },
        { scale: 1.35, duration: 0.15, ease: "back.out(3)", yoyo: true,
          repeat: 1 },
      );
    }
  };

  const handleClick = () => {
    router.push(`/product/${product.id}`);
  };

  /* ── Tilt (desktop only) ── */
  useGSAP(
    () => {
      if (!canHover() || prefersReducedMotion() || !cardRef.current) return;
      const el = cardRef.current;
      const qx = gsap.quickTo(el, "rotationX", { duration: 0.45, ease: "power3.out" });
      const qy = gsap.quickTo(el, "rotationY", { duration: 0.45, ease: "power3.out" });
      const onMove = (evt: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const rx = (evt.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const ry = (evt.clientY - (r.top + r.height / 2)) / (r.height / 2);
        qy(rx * 2.5);
        qx(ry * -2.5);
      };
      const onLeave = () => {
        qx(0);
        qy(0);
      };
      el.style.perspective = "800px";
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    },
    [],
  );

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
      data-cursor-expand="true"
      data-cursor-label="View"
    >
      {/* Image container */}
      <div ref={imgContainerRef} className="relative aspect-[4/5] overflow-hidden bg-brand-parchment">
        {imgError ? (
          <div className="flex h-full w-full items-center justify-center bg-brand-parchment">
            <span className="font-display text-4xl font-bold text-brand-primary/20">
              {product.name.charAt(0)}
            </span>
          </div>
        ) : (
          <>
            <Image
              src={product.images[0] ?? ""}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              onError={() => setImgError(true)}
            />
            {hasSecondImage && !img2Error && (
              <Image
                src={product.images[1] ?? ""}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                onError={() => setImg2Error(true)}
              />
            )}
          </>
        )}

        {/* Hairline frame */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2.5 border border-brand-gold-light/0 transition-all duration-500 group-hover:border-brand-gold-light/60"
        />

        {/* View piece pill */}
        <span className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 translate-y-2 rounded-full bg-brand-ivory/90 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-brand-espresso opacity-0 shadow-md backdrop-blur-sm transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
          View piece&nbsp;→
        </span>

        {/* Wishlist toggle */}
        <button
          ref={heartRef}
          onClick={handleWishlist}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-brand-ivory/85 shadow-sm backdrop-blur-sm transition-colors hover:bg-brand-ivory"
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
      <div className="mt-4 space-y-1.5">
        <h3 className="line-clamp-2 font-serif text-lg leading-snug text-brand-text transition-colors duration-300 group-hover:text-brand-primary">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-display text-base font-bold text-brand-primary">
            &#8377;{product.price.toLocaleString("en-IN")}
          </span>
          {product.compareAt && product.compareAt > product.price && (
            <span className="text-xs text-brand-text/50 line-through">
              &#8377;{product.compareAt.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        {product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {product.sizes.slice(0, 4).map((size) => (
              <span
                key={size}
                className="inline-block border border-brand-primary/15 px-2 py-0.5 font-mono text-[10px] tracking-wider text-brand-text/60"
              >
                {size}
              </span>
            ))}
          </div>
        )}
        <span
          aria-hidden="true"
          className="block h-px w-0 bg-brand-gold transition-all duration-500 group-hover:w-full"
        />
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
