import { writeFile, mkdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { ALLOWED_TYPES, MAX_SIZE } from "./constants";
import type { UploadAdapter } from "./index";

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

  getPresignedPutUrl(): never {
    throw new Error(
      "Presigned uploads are not supported with the public directory adapter. Set UPLOAD_ADAPTER=s3.",
    );
  }
}
