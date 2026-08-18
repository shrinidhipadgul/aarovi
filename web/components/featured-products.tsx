import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product-card";
import SectionReveal from "@/components/section-reveal";

export default async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { featured: true, deletedAt: null },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) return null;

  return (
    <SectionReveal className="bg-brand-ivory texture-grain texture-weave">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        {/* Editorial split header */}
        <div className="flex flex-col gap-8 border-b border-brand-primary/15 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="reveal-eyebrow font-mono text-[11px] uppercase tracking-[0.35em] text-brand-gold">
              N° 01 — Curated for you
            </p>
            <h2 className="reveal-title mt-4 font-display text-4xl font-bold leading-[1.05] text-brand-primary sm:text-5xl lg:text-6xl">
              The Featured{" "}
              <span className="font-serif italic text-brand-gold">
                Collection
              </span>
            </h2>
          </div>
          <div className="reveal-sub max-w-sm lg:pb-2 lg:text-right">
            <p className="font-serif text-lg italic leading-relaxed text-brand-text/70">
              Handpicked pieces showcasing the finest of the atelier — each one
              cut, dyed and finished by hand.
            </p>
            <Link
              href="/shop/collection"
              className="group mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-brand-primary transition-colors hover:text-brand-gold"
            >
              View all pieces
              <span className="h-px w-8 bg-brand-gold transition-all duration-300 group-hover:w-12" />
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Staggered editorial grid */}
        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, i) => (
            <div
              key={product.id}
              className={`reveal-card ${i % 2 === 1 ? "lg:mt-12" : ""}`}
              style={{ clipPath: "inset(0 0 100% 0)" } as React.CSSProperties}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
