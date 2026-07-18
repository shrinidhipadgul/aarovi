import type { Metadata } from "next";
import Hero from "@/components/hero";
import Marquee from "@/components/marquee";
import SmoothScroll from "@/components/smooth-scroll";
import FeaturedProducts from "@/components/featured-products";
import CategoryCards from "@/components/category-cards";
import NewsletterSection from "@/components/newsletter-section";
import RecentlyViewed from "@/components/recently-viewed";
import { JsonLd } from "@/components/json-ld";
import { organizationJsonLd } from "@/lib/json-ld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  description:
    "Discover timeless ethnic wear for women and men at Aarovi. Shop handcrafted kurtas, lehengas, sarees, and more.",
};

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Hero />
      <Marquee />
      <FeaturedProducts />
      <RecentlyViewed />
      <CategoryCards />
      <NewsletterSection />
      <JsonLd data={organizationJsonLd(siteUrl)} />
    </>
  );
}
