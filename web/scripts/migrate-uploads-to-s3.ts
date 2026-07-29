import "dotenv/config";
import { existsSync } from "node:fs";
import { readFile, writeFile, readdir, unlink } from "node:fs/promises";
import { join, relative, extname } from "node:path";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const MAP_PATH = join(process.cwd(), "migration-map.json");
const PUBLIC_DIR = join(process.cwd(), "public");
const BUCKET = process.env.S3_BUCKET_NAME;
const REGION = process.env.AWS_REGION ?? "us-east-1";
const PREFIX = (process.env.S3_KEY_PREFIX ?? "").replace(/\/+$/, "");
const BASE_URL = (process.env.S3_PUBLIC_BASE_URL ?? `https://${BUCKET}.s3.${REGION}.amazonaws.com`).replace(/\/+$/, "");

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".gif": "image/gif",
};

function fail(message: string): never {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function getContentType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  return MIME_MAP[ext] ?? "application/octet-stream";
}

function resolveKey(localPath: string): string {
  const clean = localPath.replace(/^\/+/, "");
  return PREFIX ? `${PREFIX}/${clean}` : clean;
}

function resolveUrl(key: string): string {
  return `${BASE_URL}/${key}`;
}

async function* walk(dir: string, baseDir: string): AsyncGenerator<string> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "fonts") continue;
      yield* walk(full, baseDir);
    } else {
      yield relative(baseDir, full);
    }
  }
}

async function uploadFile(
  s3: S3Client,
  localPath: string,
): Promise<{ key: string; url: string }> {
  const fullPath = join(PUBLIC_DIR, localPath);
  const key = resolveKey(localPath);
  const contentType = getContentType(localPath);

  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET!, Key: key }));
    console.log(`  ⏭  ${localPath} (already in S3)`);
    return { key, url: resolveUrl(key) };
  } catch {
    // not found — upload it
  }

  const buf = await readFile(fullPath);
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET!,
      Key: key,
      Body: buf,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  console.log(`  ✓  ${localPath} → ${key}`);
  return { key, url: resolveUrl(key) };
}

async function loadMap(): Promise<Record<string, { key: string; url: string }>> {
  if (!existsSync(MAP_PATH)) return {};
  try {
    const raw = await readFile(MAP_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveMap(map: Record<string, { key: string; url: string }>) {
  await writeFile(MAP_PATH, JSON.stringify(map, null, 2), "utf-8");
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  const doCleanup = process.argv.includes("--cleanup");

  if (!BUCKET) {
    fail("S3_BUCKET_NAME environment variable is required.");
  }

  console.log(`S3 Migration${isDryRun ? " (DRY RUN)" : ""}`);
  console.log(`  Bucket:   ${BUCKET}`);
  console.log(`  Region:   ${REGION}`);
  console.log(`  Base URL: ${BASE_URL}`);
  console.log(`  Prefix:   ${PREFIX || "(none)"}`);
  console.log("");

  const s3 = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  });

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // ── Step 1: Scan public/ files ──
    console.log("Scanning public/ files...");
    const uploadPaths: string[] = [];

    for (const dir of ["images", "uploads"]) {
      const fullDir = join(PUBLIC_DIR, dir);
      if (!existsSync(fullDir)) {
        console.log(`  ⊘  public/${dir}/ (does not exist, skipped)`);
        continue;
      }
      for await (const p of walk(fullDir, PUBLIC_DIR)) {
        uploadPaths.push(p);
      }
    }

    for (const f of ["hero.mp4", "logo.png", "favicon.ico"]) {
      const fp = join(PUBLIC_DIR, f);
      if (existsSync(fp)) uploadPaths.push(f);
    }

    console.log(`  Found ${uploadPaths.length} files to migrate.\n`);

    if (isDryRun) {
      for (const p of uploadPaths) {
        console.log(`  →  ${p}  →  ${resolveKey(p)}  →  ${resolveUrl(resolveKey(p))}`);
      }
      console.log("\nDry run complete. No changes made.");
      return;
    }

    // ── Step 2: Upload to S3 ──
    console.log("Uploading to S3...");
    const existingMap = await loadMap();
    const newMap: Record<string, { key: string; url: string }> = { ...existingMap };
    let uploaded = 0;
    let skipped = 0;

    for (const p of uploadPaths) {
      const entry = await uploadFile(s3, p);
      if (existingMap[p]?.key === entry.key) {
        skipped++;
      } else {
        uploaded++;
      }
      newMap[p] = entry;
    }

    await saveMap(newMap);
    console.log(
      `\n  Uploaded ${uploaded} new files, ${skipped} already present.`,
    );
    console.log(`  Map saved to ${MAP_PATH}\n`);

    // ── Step 3: Rewrite DB references ──
    console.log("Rewriting database references...");

    // Product.images[]
    const products = await prisma.product.findMany({
      select: { id: true, images: true },
    });
    let productRewrites = 0;
    for (const product of products) {
      let changed = false;
      const newImages = product.images.map((imgUrl) => {
        if (imgUrl.startsWith(BASE_URL)) return imgUrl;
        if (imgUrl.startsWith("http")) return imgUrl;
        const entry = newMap[imgUrl.replace(/^\//, "")];
        if (entry) {
          changed = true;
          return entry.url;
        }
        return imgUrl;
      });
      if (changed) {
        await prisma.product.update({
          where: { id: product.id },
          data: { images: newImages },
        });
        productRewrites++;
      }
    }
    console.log(`  Products updated: ${productRewrites}`);

    // Category.image
    const cats = await prisma.category.findMany({
      select: { id: true, image: true },
    });
    let catRewrites = 0;
    for (const cat of cats) {
      if (!cat.image) continue;
      if (cat.image.startsWith(BASE_URL)) continue;
      const entry = newMap[cat.image.replace(/^\//, "")];
      if (entry) {
        await prisma.category.update({
          where: { id: cat.id },
          data: { image: entry.url },
        });
        catRewrites++;
      }
    }
    console.log(`  Categories updated: ${catRewrites}`);

    // User.image (local only)
    const users = await prisma.user.findMany({
      select: { id: true, image: true },
    });
    let userRewrites = 0;
    for (const user of users) {
      if (!user.image) continue;
      if (user.image.startsWith("https://") || user.image.startsWith("http://"))
        continue;
      const entry = newMap[user.image.replace(/^\//, "")];
      if (entry) {
        await prisma.user.update({
          where: { id: user.id },
          data: { image: entry.url },
        });
        userRewrites++;
      }
    }
    console.log(`  Users updated: ${userRewrites}`);

    console.log("\n✓ Migration complete.");

    // ── Step 4: Optional cleanup ──
    if (doCleanup) {
      console.log("\nCleaning up local public files...");
      for (const p of uploadPaths) {
        const fp = join(PUBLIC_DIR, p);
        try {
          await unlink(fp);
          console.log(`  ✗  deleted ${p}`);
        } catch {
          console.log(`  ⊘  could not delete ${p}`);
        }
      }
      console.log("Cleanup done.");
    } else {
      console.log(
        "Keeping local files in place. Run with --cleanup after verifying everything renders correctly.",
      );
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
