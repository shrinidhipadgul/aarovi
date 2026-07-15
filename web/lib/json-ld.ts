export interface JsonLdBreadcrumbItem {
  name: string;
  url: string;
}

export function organizationJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: "Aarovi",
    url: siteUrl,
    logo: `${siteUrl}/favicon.ico`,
    image: `${siteUrl}/opengraph-image`,
    telephone: "+91 7416964805",
    email: "aaroviofficial@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hyderabad",
      addressRegion: "Telangana",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.instagram.com/aaroviofficial",
      "https://www.linkedin.com/company/aaroviofficial",
      "https://x.com/aaroviofficial",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91 7416964805",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
  };
}

export function breadcrumbJsonLd(items: JsonLdBreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function productJsonLd(
  product: {
    name: string;
    description: string;
    price: number;
    images: string[];
    inStock: boolean;
  },
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) =>
      img.startsWith("http") ? img : `${siteUrl}${img.startsWith("/") ? "" : "/"}${img}`,
    ),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}
