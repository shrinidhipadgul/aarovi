import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ALLOWED_TYPES, MAX_SIZE, DEFAULT_CACHE_CONTROL } from "./constants";
import { getPublicUrl, buildS3Key, type PresignedUpload } from "./storage";
import type { UploadAdapter } from "./index";

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (s3Client) return s3Client;
  s3Client = new S3Client({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  });
  return s3Client;
}

function validateContentType(contentType: string): void {
  if (!ALLOWED_TYPES.includes(contentType as (typeof ALLOWED_TYPES)[number])) {
    throw new Error(
      `Invalid file type "${contentType}". Allowed: ${ALLOWED_TYPES.join(", ")}`,
    );
  }
}

function validateSize(file: File): void {
  if (file.size > MAX_SIZE) {
    throw new Error(
      `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 5MB`,
    );
  }
}

export class S3Adapter implements UploadAdapter {
  private get client() {
    return getS3Client();
  }
  private get bucket() {
    return process.env.S3_BUCKET_NAME ?? "aarovi";
  }

  async save(file: File, fileName: string): Promise<string> {
    validateContentType(file.type);
    validateSize(file);

    const key = buildS3Key({ namespace: "products", fileName });
    const buffer = Buffer.from(await file.arrayBuffer());
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        CacheControl: DEFAULT_CACHE_CONTROL,
      }),
    );
    return getPublicUrl(key);
  }

  async delete(path: string): Promise<void> {
    const key = path.startsWith("http") ? this.extractKeyFromUrl(path) : path;
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getPresignedPutUrl(
    contentType: string,
    namespace: string,
    fileName: string,
  ): Promise<PresignedUpload> {
    validateContentType(contentType);

    const key = buildS3Key({ namespace, fileName });
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      CacheControl: DEFAULT_CACHE_CONTROL,
    });

    const ttl = Number(process.env.S3_PRESIGN_TTL_SECONDS) || 180;
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: ttl,
    });

    const publicUrl = getPublicUrl(key);
    return { key, uploadUrl, publicUrl };
  }

  async objectExists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  private extractKeyFromUrl(url: string): string {
    try {
      const u = new URL(url);
      return u.pathname.replace(/^\//, "");
    } catch {
      return url.replace(/^\//, "");
    }
  }
}
