import { writeFile, mkdir, unlink, readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { ALLOWED_TYPES, MAX_SIZE } from "./constants";
import type { UploadAdapter } from "./index";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export class PublicDirAdapter implements UploadAdapter {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? join(process.cwd(), "public", "uploads");
  }

  async save(file: File, fileName: string): Promise<string> {
    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      throw new Error(
        `Invalid file type "${file.type}". Allowed: ${ALLOWED_TYPES.join(", ")}`,
      );
    }
    if (file.size > MAX_SIZE) {
      throw new Error(
        `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 5MB`,
      );
    }

    await mkdir(this.baseDir, { recursive: true });

    const uniqueName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = join(this.baseDir, uniqueName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return `/uploads/${uniqueName}`;
  }

  async delete(path: string): Promise<void> {
    const cleanPath = path.replace(/^\//, "");
    const fullPath = join(process.cwd(), "public", cleanPath);
    await unlink(fullPath).catch(() => {});
  }

  async getObject(key: string): Promise<{
    body: Uint8Array;
    contentType?: string;
    contentLength?: number;
    etag?: string;
    cacheControl?: string;
  }> {
    const cleanPath = key.replace(/^\//, "").replace(/^uploads\//, "");
    const fullPath = join(this.baseDir, cleanPath);
    const buffer = await readFile(fullPath);
    const ext = extname(fullPath).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";
    return {
      body: buffer,
      contentType,
      contentLength: buffer.length,
      cacheControl: "public, max-age=31536000, immutable",
    };
  }

  getPresignedPutUrl(): never {
    throw new Error(
      "Presigned uploads are not supported with the public directory adapter. Set UPLOAD_ADAPTER=s3.",
    );
  }
}
