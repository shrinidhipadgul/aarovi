import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  fetchProductById,
  fetchRelatedProducts,
} from "@/lib/queries/products";
import ProductCard from "@/components/product-card";
import ProductGallery from "@/components/product-gallery";
import ProductActions from "@/components/product-actions";
import RecentlyViewedTracker from "@/components/recently-viewed-tracker";

interface Props {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const product = await fetchProductById(productId);

  if (!product) {
    return { title: "Product Not Found — Aarovi" };
  }

  return {
    title: `${product.name} — Aarovi`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { productId } = await params;
  const product = await fetchProductById(productId);

  if (!product) {
    notFound();
  }

  const related = await fetchRelatedProducts(
    product.subCategory,
    product.id,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <RecentlyViewedTracker productId={productId} />

      <div className="flex flex-col gap-10 lg:flex-row">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex-1 space-y-5">
          <div>
            <h1 className="font-display text-3xl font-semibold text-brand-primary sm:text-4xl">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-bold text-brand-primary">
                &#8377;{product.price.toLocaleString("en-IN")}
              </span>
              {product.compareAt && product.compareAt > product.price && (
                <span className="text-base text-brand-text/50 line-through">
                  &#8377;{product.compareAt.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-block rounded-full bg-brand-bg px-3 py-1 text-xs font-medium capitalize text-brand-text/70">
              {product.category}
            </span>
            {product.subCategory !== product.category && (
              <span className="inline-block rounded-full bg-brand-bg px-3 py-1 text-xs font-medium capitalize text-brand-text/70">
                {product.subCategory}
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed text-brand-text/70">
            {product.description}
          </p>

          <ProductActions
            productId={product.id}
            sizes={product.sizes}
            inStock={product.inStock}
          />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-semibold text-brand-primary sm:text-3xl">
              You May Also Like
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
