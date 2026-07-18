import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import SectionReveal from "@/components/section-reveal";

const tileLayouts = [
  "sm:col-span-2 lg:col-span-7 aspect-[4/3] lg:aspect-[16/10]",
  "sm:col-span-1 lg:col-span-5 aspect-[4/3] lg:aspect-[16/10]",
  "sm:col-span-1 lg:col-span-4 aspect-[4/3] lg:aspect-[4/3]",
  "sm:col-span-1 lg:col-span-4 aspect-[4/3] lg:aspect-[4/3]",
  "sm:col-span-2 lg:col-span-4 aspect-[4/3] lg:aspect-[4/3]",
  "sm:col-span-2 lg:col-span-12 aspect-[4/3] lg:aspect-[21/9]",
];

export default async function CategoryCards() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  if (categories.length === 0) return null;

  return (
    <SectionReveal className="bg-brand-parchment texture-grain">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        {/* Editorial split header */}
        <div className="flex flex-col gap-8 border-b border-brand-primary/15 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="reveal-eyebrow font-mono text-[11px] uppercase tracking-[0.35em] text-brand-gold">
              N° 02 — Explore
            </p>
            <h2 className="reveal-title mt-4 font-display text-4xl font-bold leading-[1.05] text-brand-primary sm:text-5xl lg:text-6xl">
              Shop by{" "}
              <span className="font-serif italic text-brand-gold">
                Category
              </span>
            </h2>
          </div>
          <p className="reveal-sub max-w-sm font-serif text-lg italic leading-relaxed text-brand-text/70 lg:pb-2 lg:text-right">
            Six edits of the house — from everyday kurtis to heirloom lehengas.
          </p>
        </div>

        {/* Mosaic */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/shop/${cat.slug}`}
              className={`reveal-card group relative overflow-hidden bg-brand-espresso ${
                tileLayouts[i % tileLayouts.length]
              }`}
              style={{ clipPath: "inset(0 0 100% 0)" } as React.CSSProperties}
              data-cursor-expand="true"
              data-cursor-label="Shop"
            >
              <Image
                src={cat.image ?? ""}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 58vw"
                className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.06] group-hover:[object-position:80%_50%]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/85 via-brand-espresso/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-3 border border-brand-gold-light/0 transition-all duration-500 group-hover:border-brand-gold-light/50"
              />

              <span className="absolute right-5 top-4 font-mono text-[11px] tracking-[0.3em] text-brand-ivory/70">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                <p className="font-serif text-sm italic text-brand-gold-light">
                  {cat.gender === "women" ? "Women" : "Men"}
                </p>
                <div className="mt-1 flex items-end justify-between gap-4">
                  <h3 className="font-display text-2xl font-bold text-brand-ivory sm:text-3xl">
                    {cat.name}
                  </h3>
                  <span className="mb-1 inline-flex translate-y-2 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-brand-gold-light opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    Shop
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  className="mt-3 block h-px w-10 bg-brand-gold-light/60 transition-all duration-500 group-hover:w-24"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
