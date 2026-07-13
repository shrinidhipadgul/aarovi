import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "./api-errors";

type RouteHandler = (
  req: NextRequest,
  ...args: unknown[]
) => Promise<NextResponse>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req, ...args) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
