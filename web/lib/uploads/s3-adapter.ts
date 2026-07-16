import type { UploadAdapter } from "./index";

/**
 * S3 adapter (placeholder).
 *
 * Ready for implementation when ready. Required env vars:
 *   - AWS_ACCESS_KEY_ID
 *   - AWS_SECRET_ACCESS_KEY
 *   - AWS_REGION
 *   - S3_BUCKET_NAME
 */
export class S3Adapter implements UploadAdapter {
  async save(_file: File, _fileName: string): Promise<string> {
    throw new Error(
      "S3 upload adapter is not implemented yet. Set UPLOAD_ADAPTER=public to use the local adapter.",
    );
  }

  async delete(_path: string): Promise<void> {
    throw new Error(
      "S3 upload adapter is not implemented yet. Set UPLOAD_ADAPTER=public to use the local adapter.",
    );
  }
}