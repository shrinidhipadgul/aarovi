import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { fetchAllCategories } from "@/lib/queries/products";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/shop/collection`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${siteUrl}/faqs`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/shippingpolicy`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteUrl}/refundpolicy`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteUrl}/privacypolicy`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteUrl}/termsconditions`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: { id: true, updatedAt: true },
  });
  const productRoutes = products.map((p) => ({
    url: `${siteUrl}/product/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categories = await fetchAllCategories();
  const categoryRoutes = categories.map((c) => ({
    url: `${siteUrl}/shop/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
