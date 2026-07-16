import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  fetchProductById,
  fetchRelatedProducts,
  fetchAllCategories,
  type ProductCardSelect,
} from "@/lib/queries/products";
import ProductCard from "@/components/product-card";
import ProductGallery from "@/components/product-gallery";
import ProductActions from "@/components/product-actions";
import RecentlyViewedTracker from "@/components/recently-viewed-tracker";
import RecentlyViewed from "@/components/recently-viewed";
import { JsonLd } from "@/components/json-ld";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/json-ld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface Props {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const product = await fetchProductById(productId);

  if (!product) {
    return { title: { absolute: "Product Not Found | Aarovi" } };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    title: product.name,
    description: `${product.name} — ₹${product.price.toLocaleString("en-IN")}. ${product.description}`,
    openGraph: {
      title: `${product.name} | Aarovi`,
      description: `${product.name} — ₹${product.price.toLocaleString("en-IN")}. ${product.description}`,
      images: product.images.length > 0 && product.images[0]
        ? [product.images[0].startsWith("http") ? product.images[0] : `${siteUrl}${product.images[0]}`]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Aarovi`,
      description: `${product.name} — ₹${product.price.toLocaleString("en-IN")}.`,
    },
    alternates: {
      canonical: `/product/${productId}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { productId } = await params;
  const product = await fetchProductById(productId);

  if (!product) {
    notFound();
  }

  const slim = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    compareAt: product.compareAt,
    images: product.images,
    sizes: product.sizes,
    inStock: product.inStock,
  };

  const related = await fetchRelatedProducts(
    product.subCategory,
    product.id,
  );

  const allCategories = await fetchAllCategories();
  const subCategoryMatch = allCategories.find((c) => c.name === product.subCategory);

  return (
    <>
      <JsonLd data={productJsonLd(product, siteUrl)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: `${siteUrl}/` },
          { name: "Collection", url: `${siteUrl}/shop/collection` },
          ...(subCategoryMatch
            ? [{ name: product.subCategory, url: `${siteUrl}/shop/${subCategoryMatch.slug}` }]
            : []),
          { name: product.name, url: `${siteUrl}/product/${product.id}` },
        ])}
      />
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <RecentlyViewedTracker product={slim} />

      <div className="flex flex-col gap-10 lg:flex-row">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex-1 space-y-5">
          <div>
            <h1 className="font-display text-3xl font-bold text-brand-primary sm:text-4xl">
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
            <h2 className="font-display text-2xl font-bold text-brand-primary sm:text-3xl">
              You May Also Like
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p: ProductCardSelect) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />
    </div>
    </>);
}
