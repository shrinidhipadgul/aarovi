import { isAdmin } from "@/lib/is-admin";
import { errorResponse, unauthorizedResponse } from "@/lib/api-response";
import { RouteHandler } from "./route-handler";

export function requireAdmin(handler: RouteHandler): RouteHandler {
  return async (req, ...args) => {
    const { isAdmin: admin, session } = await isAdmin();

    if (!session?.user) {
      return unauthorizedResponse();
    }
    if (!admin) {
      return errorResponse("Forbidden", 403);
    }

    return handler(req, ...args);
  };
}