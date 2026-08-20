import "dotenv/config";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const BUCKET = process.env.S3_BUCKET_NAME ?? "aarovi-storage-s3";
const REGION = process.env.AWS_REGION ?? "ap-southeast-2";
const PREFIX = (process.env.S3_KEY_PREFIX ?? "").replace(/\/+$/, "");
const BASE_URL = (
  process.env.S3_PUBLIC_BASE_URL ??
  `https://${BUCKET}.s3.${REGION}.amazonaws.com`
).replace(/\/+$/, "");

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const filePath = join(process.cwd(), "public", "images", "payment-qr.jpeg");
    const buffer = await readFile(filePath);

    const s3Client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
      },
    });

    const key = PREFIX ? `${PREFIX}/settings/payment-qr.jpeg` : "settings/payment-qr.jpeg";

    console.log(`Uploading QR image to S3: s3://${BUCKET}/${key}...`);
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: "image/jpeg",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    const publicUrl = `${BASE_URL}/${key}`;
    console.log(`Uploaded successfully! Public URL: ${publicUrl}`);

    console.log("Updating payment_qr_url in database Setting table...");
    await prisma.setting.upsert({
      where: { key: "payment_qr_url" },
      update: { value: publicUrl },
      create: { key: "payment_qr_url", value: publicUrl },
    });

    console.log("Done! payment_qr_url configured to S3 URL.");
  } catch (err) {
    console.error("Error uploading QR to S3:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
