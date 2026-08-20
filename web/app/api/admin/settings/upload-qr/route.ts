import { requireAdmin } from "@/lib/api-require-admin";
import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getUploadAdapter } from "@/lib/uploads";
import { setSetting } from "@/lib/settings";
import { ALLOWED_TYPES, MAX_SIZE } from "@/lib/uploads/constants";

const handleQrUpload = async (req: Request) => {
  const contentType = req.headers.get("content-type") || "";

  // Presigned URL request
  if (contentType.includes("application/json")) {
    const body = (await req.json()) as {
      contentType?: string;
      fileName?: string;
    };

    if (!body.contentType) {
      return errorResponse("contentType is required", 400);
    }

    if (!ALLOWED_TYPES.includes(body.contentType as (typeof ALLOWED_TYPES)[number])) {
      return errorResponse(
        `Invalid file type "${body.contentType}". Allowed: ${ALLOWED_TYPES.join(", ")}`,
        400,
      );
    }

    const adapter = getUploadAdapter();
    if (adapter.getPresignedPutUrl) {
      const ext = body.contentType.split("/")[1] ?? "jpg";
      const fileName = `payment-qr-${Date.now()}.${ext}`;
      const presigned = await adapter.getPresignedPutUrl(
        body.contentType,
        "settings",
        fileName,
      );
      return successResponse(presigned);
    }
  }

  // Direct FormData upload
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse("No file provided", 400);
    }

    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      return errorResponse(
        `Invalid file type "${file.type}". Allowed: ${ALLOWED_TYPES.join(", ")}`,
        400,
      );
    }

    if (file.size > MAX_SIZE) {
      return errorResponse("File size exceeds 5MB limit", 400);
    }

    const adapter = getUploadAdapter();
    const ext = file.type.split("/")[1] ?? "jpg";
    const fileName = `payment-qr-${Date.now()}.${ext}`;
    const publicUrl = await adapter.save(file, fileName);

    // Update the setting in the database
    await setSetting("payment_qr_url", publicUrl);

    return successResponse({ publicUrl });
  }

  return errorResponse("Unsupported upload format", 400);
};

export const POST = requireAdmin(withErrorHandler(handleQrUpload));
