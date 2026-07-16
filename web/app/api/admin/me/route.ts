import { withErrorHandler } from "@/lib/with-error-handler";
import { isAdmin } from "@/lib/is-admin";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-response";

export const GET = withErrorHandler(async () => {
  const { isAdmin: admin, session } = await isAdmin();

  if (!session?.user) {
    return unauthorizedResponse();
  }
  if (!admin) {
    return errorResponse("Forbidden", 403);
  }

  return successResponse({
    admin: true,
    user: { id: session.user.id, email: session.user.email },
  });
});