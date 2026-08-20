import { requireAuth } from "@/lib/api-require-auth";
import { withErrorHandler } from "@/lib/with-error-handler";
import { errorResponse, successResponse } from "@/lib/api-response";
import { getSession } from "@/lib/get-session";
import { getUploadAdapter } from "@/lib/uploads";
import { ALLOWED_TYPES, MAX_SIZE } from "@/lib/uploads/constants";

export const POST = requireAuth(
  withErrorHandler(async (req: Request) => {
    const session = await getSession();
    const userId = session?.user?.id;
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const contentType = req.headers.get("content-type") || "";

    // If client sends JSON requesting presigned URL
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
        const fileName = body.fileName || `proof-${Date.now()}.${ext}`;
        const presigned = await adapter.getPresignedPutUrl(
          body.contentType,
          `payment-proofs/${userId}`,
          fileName,
        );
        return successResponse(presigned);
      }
    }

    // Direct FormData upload fallback
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
      const fileName = `proof-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const publicUrl = await adapter.save(file, fileName);

      return successResponse({ publicUrl });
    }

    return errorResponse("Unsupported upload format", 400);
  }),
);
