/* eslint-disable @typescript-eslint/no-require-imports */
import type { PresignedUpload } from "./storage";

export interface UploadAdapter {
  save(file: File, fileName: string): Promise<string>;
  delete(path: string): Promise<void>;
  getPresignedPutUrl?(
    contentType: string,
    namespace: string,
    fileName: string,
  ): Promise<PresignedUpload>;
  getPresignedGetUrl?(key: string): Promise<string>;
  objectExists?(key: string): Promise<boolean>;
}

export type UploadAdapterType = "public" | "s3";

let cachedAdapter: UploadAdapter | null = null;

export function getUploadAdapter(type?: UploadAdapterType): UploadAdapter {
  if (cachedAdapter) return cachedAdapter;

  const resolved =
    type ?? (process.env.UPLOAD_ADAPTER as UploadAdapterType) ?? "public";

  if (resolved === "s3") {
    const { S3Adapter } = require("./s3-adapter") as {
      S3Adapter: new () => UploadAdapter;
    };
    cachedAdapter = new S3Adapter();
  } else {
    const { PublicDirAdapter } = require("./public-dir-adapter") as {
      PublicDirAdapter: new (baseDir?: string) => UploadAdapter;
    };
    cachedAdapter = new PublicDirAdapter();
  }

  return cachedAdapter;
}

export const uploadAdapter = getUploadAdapter();
