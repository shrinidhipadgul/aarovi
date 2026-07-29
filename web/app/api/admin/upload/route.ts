import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-require-admin";
import { withErrorHandler } from "@/lib/with-error-handler";
import { errorResponse } from "@/lib/api-response";
import { getUploadAdapter } from "@/lib/uploads";
import { extractKey, type PresignedUpload } from "@/lib/uploads/storage";

interface UploadFileEntry {
  contentType: string;
  fileName: string;
}

const handleUpload = async (req: Request) => {
  const body = (await req.json()) as { files?: UploadFileEntry[] };

  if (!body.files || body.files.length === 0) {
    return errorResponse("No files provided", 400);
  }

  const adapter = getUploadAdapter();
  if (!adapter.getPresignedPutUrl) {
    return errorResponse(
      "Presigned uploads require the S3 adapter. Set UPLOAD_ADAPTER=s3.",
      500,
    );
  }

  const paths: (PresignedUpload & { error?: string })[] = [];
  const errors: { name: string; error: string }[] = [];

  for (const entry of body.files) {
    try {
      const result = await adapter.getPresignedPutUrl(
        entry.contentType,
        "products",
        entry.fileName,
      );
      paths.push(result);
    } catch (err) {
      errors.push({
        name: entry.fileName,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: { paths, errors },
  });
};

const handleDelete = async (req: Request) => {
  const body = (await req.json()) as { path: string };
  if (!body.path) {
    return errorResponse("path is required", 400);
  }

  const adapter = getUploadAdapter();
  const key = extractKey(body.path) ?? body.path;
  await adapter.delete(key);

  return NextResponse.json({ success: true });
};

export const POST = requireAdmin(withErrorHandler(handleUpload));
export const DELETE = requireAdmin(withErrorHandler(handleDelete));
