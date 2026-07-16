import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductListClient } from "./product-list-client";

export const metadata: Metadata = {
  title: "Products",
  description: "Manage products — Aarovi admin.",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.product.count(),
  ]);

  type RawProduct = typeof rows extends (infer U)[] ? U : never;
  const products = rows.map((p: RawProduct) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    compareAt: p.compareAt,
    images: p.images,
    category: p.category,
    subCategory: p.subCategory,
    sizes: p.sizes,
    inStock: p.inStock,
    stock: p.stock,
    featured: p.featured,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-brand-primary">
            Products
          </h1>
          <p className="mt-1 text-sm text-brand-text/60">{total} total</p>
        </div>
        <a
          href="/admin/products/new"
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
        >
          Add Product
        </a>
      </div>

      <ProductListClient initialProducts={products} initialTotal={total} />
    </div>
  );
}