import { requireAuth } from "@/lib/api-require-auth";
import { withErrorHandler } from "@/lib/with-error-handler";
import { errorResponse, successResponse } from "@/lib/api-response";
import { getSession } from "@/lib/get-session";
import { getUploadAdapter } from "@/lib/uploads";
import type { PresignedUpload } from "@/lib/uploads/storage";

const handlePresign = async (req: Request) => {
  const body = (await req.json()) as {
    contentType?: string;
    folder?: string;
  };

  const { contentType, folder } = body;

  if (!contentType) {
    return errorResponse("contentType is required", 400);
  }

  const adapter = getUploadAdapter();

  if (!adapter.getPresignedPutUrl) {
    return errorResponse(
      "Presigned uploads require the S3 adapter. Set UPLOAD_ADAPTER=s3.",
      500,
    );
  }

  const session = await getSession();
  const sessionId = session?.user?.id;
  if (!sessionId) {
    return errorResponse("Session not found", 401);
  }

  const ext = contentType.split("/")[1] ?? "bin";
  const namespace = folder
    ? `customize/${folder}`
    : `customize/${sessionId}`;
  const result: PresignedUpload = await adapter.getPresignedPutUrl(
    contentType,
    namespace,
    `reference.${ext}`,
  );

  return successResponse(result);
};

export const POST = requireAuth(withErrorHandler(handlePresign));
