import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function CategoryCards() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
          Explore
        </span>
        <h2 className="mt-2 text-3xl font-semibold text-brand-primary sm:text-4xl">
          Shop by Category
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop/${cat.slug}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-brand-bg"
          >
            <Image
              src={cat.image ?? ""}
              alt={cat.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="text-lg font-semibold text-white">{cat.name}</h3>
              <p className="mt-1 text-sm text-white/70">
                {cat.gender === "women" ? "Women" : "Men"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
