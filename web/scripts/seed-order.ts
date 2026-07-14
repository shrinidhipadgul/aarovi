import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];

  const user = email
    ? await prisma.user.findUnique({ where: { email } })
    : await prisma.user.findFirst();

  if (!user) {
    console.error("No user found. Register a user first, or pass an email.");
    process.exit(1);
  }

  const products = await prisma.product.findMany({ take: 2 });
  if (products.length < 2) {
    console.error("Not enough seeded products. Run `bun run db:seed` first.");
    process.exit(1);
  }

  const items = products.map((p) => ({
    productId: p.id,
    size: p.sizes[0] ?? "M",
    quantity: 1,
    price: p.price,
  }));
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: "shipped",
      total,
      paymentMethod: "COD",
      address: {
        fullName: user.name,
        phone: "9999999999",
        line1: "123 Sample Street",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
      },
      items: { create: items },
    },
    include: { items: true },
  });

  console.log(`Created order ${order.id} for ${user.email} (status: ${order.status})`);
  console.log(`Tracking URL: http://localhost:3000/status/${order.id}`);
  console.log(`API:          http://localhost:3000/api/orders/${order.id}`);
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