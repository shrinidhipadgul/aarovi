import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/is-admin";
import { errorResponse, unauthorizedResponse } from "@/lib/api-response";

type RouteHandler = (req: Request, ...args: unknown[]) => Promise<NextResponse>;

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