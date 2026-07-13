import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  {
    name: "Kurtis",
    slug: "kurtis",
    gender: "women",
    description: "Trendy and comfortable kurtis for every occasion",
    image: "/images/product-1.svg",
  },
  {
    name: "Anarkalis",
    slug: "anarkalis",
    gender: "women",
    description: "Elegant anarkali suits for festive and formal wear",
    image: "/images/product-5.svg",
  },
  {
    name: "Lehengas",
    slug: "lehengas",
    gender: "women",
    description: "Beautiful lehengas for weddings and celebrations",
    image: "/images/product-8.svg",
  },
  {
    name: "Sheraras",
    slug: "sheraras",
    gender: "women",
    description: "Stylish sherara sets for a contemporary ethnic look",
    image: "/images/product-12.svg",
  },
  {
    name: "Kurti-Sets",
    slug: "kurti-sets",
    gender: "women",
    description: "Coordinated kurti sets for effortless styling",
    image: "/images/product-7.svg",
  },
  {
    name: "Kurtas",
    slug: "kurtas",
    gender: "men",
    description: "Classic and contemporary kurtas for men",
    image: "/images/product-10.svg",
  },
];

const img = (n: number) => `/images/product-${n}.svg`;

interface SeedProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAt: number | null;
  images: string[];
  category: string;
  subCategory: string;
  sizes: string[];
  featured: boolean;
}

const products: SeedProduct[] = [
  // ---- Kurtis (4) ----
  {
    name: "Embroidered Cotton Kurti",
    slug: "embroidered-cotton-kurti",
    description:
      "Hand-embroidered cotton kurti with delicate thread work. Lightweight and breathable for all-day comfort.",
    price: 1299,
    compareAt: null,
    images: [img(1), img(2)],
    category: "Kurtis",
    subCategory: "Kurtis",
    sizes: ["S", "M", "L", "XL"],
    featured: false,
  },
  {
    name: "Printed A-Line Kurti",
    slug: "printed-a-line-kurti",
    description:
      "Colorful printed A-line kurti with a flared silhouette. Perfect for casual outings and daily wear.",
    price: 899,
    compareAt: 1399,
    images: [img(2), img(3)],
    category: "Kurtis",
    subCategory: "Kurtis",
    sizes: ["XS", "S", "M", "L", "XL"],
    featured: false,
  },
  {
    name: "Casual Rayon Kurti",
    slug: "casual-rayon-kurti",
    description:
      "Soft rayon kurti with a relaxed fit and subtle printed pattern. Ideal for work or weekends.",
    price: 1099,
    compareAt: null,
    images: [img(3), img(4)],
    category: "Kurtis",
    subCategory: "Kurtis",
    sizes: ["S", "M", "L", "XL", "XXL"],
    featured: false,
  },
  {
    name: "Festive Straight Kurti",
    slug: "festive-straight-kurti",
    description:
      "Straight-cut kurti with embellished neckline and rich fabric. Designed for festive occasions.",
    price: 1999,
    compareAt: 2599,
    images: [img(4), img(1)],
    category: "Kurtis",
    subCategory: "Kurtis",
    sizes: ["XS", "S", "M", "L", "XL"],
    featured: false,
  },

  // ---- Anarkalis (3) ----
  {
    name: "Floral Georgette Anarkali",
    slug: "floral-georgette-anarkali",
    description:
      "Flowing georgette anarkali with all-over floral print and a fitted bodice. A celebration essential.",
    price: 2499,
    compareAt: 3499,
    images: [img(5), img(6)],
    category: "Anarkalis",
    subCategory: "Anarkalis",
    sizes: ["S", "M", "L", "XL"],
    featured: true,
  },
  {
    name: "Silk Festive Anarkali",
    slug: "silk-festive-anarkali",
    description:
      "Luxurious silk anarkali with intricate zari work and a flared skirt. Perfect for weddings.",
    price: 3999,
    compareAt: null,
    images: [img(6), img(7), img(5)],
    category: "Anarkalis",
    subCategory: "Anarkalis",
    sizes: ["M", "L", "XL"],
    featured: false,
  },
  {
    name: "Cotton Printed Anarkali",
    slug: "cotton-printed-anarkali",
    description:
      "Lightweight cotton anarkali with block-print patterns. Comfortable ethnic wear for summers.",
    price: 1499,
    compareAt: null,
    images: [img(7), img(8)],
    category: "Anarkalis",
    subCategory: "Anarkalis",
    sizes: ["XS", "S", "M", "L", "XL"],
    featured: false,
  },

  // ---- Lehengas (4) ----
  {
    name: "Bridal Lehenga Choli",
    slug: "bridal-lehenga-choli",
    description:
      "Heavily embroidered bridal lehenga in rich red with gold zari work. Includes dupatta.",
    price: 12999,
    compareAt: 15999,
    images: [img(8), img(9), img(12)],
    category: "Lehengas",
    subCategory: "Lehengas",
    sizes: ["S", "M", "L"],
    featured: true,
  },
  {
    name: "Party Wear Lehenga",
    slug: "party-wear-lehenga",
    description:
      "Stylish party wear lehenga with sequin work and a crop blouse. Make an entrance.",
    price: 7499,
    compareAt: 9999,
    images: [img(9), img(10)],
    category: "Lehengas",
    subCategory: "Lehengas",
    sizes: ["S", "M", "L", "XL"],
    featured: false,
  },
  {
    name: "Designer Velvet Lehenga",
    slug: "designer-velvet-lehenga",
    description:
      "Rich velvet lehenga with resham embroidery and a matching dupatta. Winter wedding favorite.",
    price: 9999,
    compareAt: null,
    images: [img(10), img(11)],
    category: "Lehengas",
    subCategory: "Lehengas",
    sizes: ["M", "L", "XL"],
    featured: false,
  },
  {
    name: "Simple Cotton Lehenga",
    slug: "simple-cotton-lehenga",
    description:
      "Lightweight cotton lehenga with minimal embroidery. Perfect for mehendi and casual functions.",
    price: 4999,
    compareAt: null,
    images: [img(11), img(12)],
    category: "Lehengas",
    subCategory: "Lehengas",
    sizes: ["XS", "S", "M", "L", "XL"],
    featured: false,
  },

  // ---- Sheraras (3) ----
  {
    name: "Wedding Sherara Set",
    slug: "wedding-sherara-set",
    description:
      "Elegant sherara set with heavy embroidery on pure fabric. Includes trousers and dupatta.",
    price: 7999,
    compareAt: 10999,
    images: [img(12), img(1), img(2)],
    category: "Sheraras",
    subCategory: "Sheraras",
    sizes: ["S", "M", "L", "XL"],
    featured: true,
  },
  {
    name: "Festive Silk Sherara",
    slug: "festive-silk-sherara",
    description:
      "Silk sherara in festive hues with delicate gota patti work. A graceful choice.",
    price: 4999,
    compareAt: null,
    images: [img(1), img(3)],
    category: "Sheraras",
    subCategory: "Sheraras",
    sizes: ["S", "M", "L", "XL", "XXL"],
    featured: false,
  },
  {
    name: "Cape Style Sherara",
    slug: "cape-style-sherara",
    description:
      "Contemporary sherara with a flowing cape and cigarette pants. Modern ethnic chic.",
    price: 3499,
    compareAt: null,
    images: [img(3), img(4)],
    category: "Sheraras",
    subCategory: "Sheraras",
    sizes: ["XS", "S", "M", "L"],
    featured: false,
  },

  // ---- Kurti-Sets (4) ----
  {
    name: "Everyday Cotton Kurti Set",
    slug: "everyday-cotton-kurti-set",
    description:
      "Two-piece cotton kurti set with matching bottoms. Easy everyday ethnic style.",
    price: 1499,
    compareAt: null,
    images: [img(5), img(6)],
    category: "Kurti-Sets",
    subCategory: "Kurti-Sets",
    sizes: ["XS", "S", "M", "L", "XL"],
    featured: true,
  },
  {
    name: "Office Wear Kurta Set",
    slug: "office-wear-kurta-set",
    description:
      "Professional kurta set in neutral tones with subtle detailing. Work-appropriate ethnic wear.",
    price: 2299,
    compareAt: 2999,
    images: [img(6), img(7)],
    category: "Kurti-Sets",
    subCategory: "Kurti-Sets",
    sizes: ["S", "M", "L", "XL"],
    featured: false,
  },
  {
    name: "Printed Kurta Palazzo Set",
    slug: "printed-kurta-palazzo-set",
    description:
      "Printed kurta paired with wide-leg palazzos. Comfortable and fashionable.",
    price: 1799,
    compareAt: null,
    images: [img(7), img(8)],
    category: "Kurti-Sets",
    subCategory: "Kurti-Sets",
    sizes: ["S", "M", "L", "XL", "XXL"],
    featured: false,
  },
  {
    name: "Straight Kurta Set",
    slug: "straight-kurta-set",
    description:
      "Straight-cut kurta with churidar and dupatta. A timeless ethnic ensemble.",
    price: 1299,
    compareAt: 1699,
    images: [img(8), img(9)],
    category: "Kurti-Sets",
    subCategory: "Kurti-Sets",
    sizes: ["XS", "S", "M", "L"],
    featured: false,
  },

  // ---- Kurtas (4 - Men) ----
  {
    name: "Linen Kurta",
    slug: "linen-kurta",
    description:
      "Breathable linen kurta with a regular fit. A summer essential for every man.",
    price: 1799,
    compareAt: 2499,
    images: [img(10), img(11)],
    category: "Kurtas",
    subCategory: "Kurtas",
    sizes: ["S", "M", "L", "XL", "XXL"],
    featured: true,
  },
  {
    name: "Cotton Straight Kurta",
    slug: "cotton-straight-kurta",
    description:
      "Pure cotton straight kurta available in multiple colors. Daily wear staple.",
    price: 999,
    compareAt: null,
    images: [img(11), img(12)],
    category: "Kurtas",
    subCategory: "Kurtas",
    sizes: ["M", "L", "XL"],
    featured: false,
  },
  {
    name: "Festive Pathani Kurta",
    slug: "festive-pathani-kurta",
    description:
      "Pathani-style kurta in premium fabric with button-front closure. Festive favorite.",
    price: 2499,
    compareAt: 3499,
    images: [img(12), img(1)],
    category: "Kurtas",
    subCategory: "Kurtas",
    sizes: ["S", "M", "L", "XL"],
    featured: false,
  },
  {
    name: "Embroidered Kurta",
    slug: "embroidered-kurta",
    description:
      "Hand-embroidered kurta with mandarin collar. Stand out at special occasions.",
    price: 2999,
    compareAt: null,
    images: [img(2), img(3), img(4)],
    category: "Kurtas",
    subCategory: "Kurtas",
    sizes: ["XS", "S", "M", "L", "XL"],
    featured: false,
  },
];

async function main() {
  console.log("Clearing existing data...");
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log("Seeding categories...");
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("Seeding products...");
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();
  const featuredCount = await prisma.product.count({ where: { featured: true } });
  console.log(`Seeded ${categoryCount} categories and ${productCount} products (${featuredCount} featured).`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });