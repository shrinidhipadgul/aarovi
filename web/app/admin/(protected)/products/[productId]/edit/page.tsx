import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../../product-form";

export const metadata: Metadata = {
  title: "Edit Product",
  description: "Edit a product — Aarovi admin.",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ productId: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { productId } = await params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    notFound();
  }

  const initialData = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: String(product.price),
    compareAt: product.compareAt ? String(product.compareAt) : "",
    category: product.category,
    subCategory: product.subCategory,
    sizes: product.sizes,
    stock: String(product.stock),
    featured: product.featured,
    images: product.images,
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-brand-primary">
        Edit Product
      </h1>
      <p className="mt-1 text-sm text-brand-text/60">{product.name}</p>
      <ProductForm mode="edit" initialData={initialData} productId={productId} />
    </div>
  );
}