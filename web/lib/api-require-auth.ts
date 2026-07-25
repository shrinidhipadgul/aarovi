import { getSession } from "@/lib/get-session";
import { unauthorizedResponse } from "@/lib/api-response";
import { RouteHandler } from "./route-handler";

export function requireAuth(handler: RouteHandler): RouteHandler {
  return async (req, ...args) => {
    const session = await getSession();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }
    return handler(req, ...args);
  };
}
