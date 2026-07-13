import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product-card";

export default async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { featured: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
          Curated for you
        </span>
        <h2 className="mt-2 text-3xl font-semibold text-brand-primary sm:text-4xl">
          Featured Collection
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-brand-text/60">
          Handpicked pieces showcasing the finest of our collection
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
