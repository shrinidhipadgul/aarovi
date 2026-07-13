import Hero from "@/components/hero";
import FeaturedProducts from "@/components/featured-products";
import CategoryCards from "@/components/category-cards";
import NewsletterSection from "@/components/newsletter-section";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <CategoryCards />
      <NewsletterSection />
    </>
  );
}
