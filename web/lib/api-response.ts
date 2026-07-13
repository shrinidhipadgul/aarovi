import { NextResponse } from "next/server";

export interface ApiResponseBody<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data } satisfies ApiResponseBody<T>,
    { status },
  );
}

export function errorResponse(
  message: string,
  status = 400,
  errors?: Record<string, string[]>,
) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(errors && { errors }),
    } satisfies ApiResponseBody,
    { status },
  );
}

export function notFoundResponse(resource?: string) {
  return errorResponse(
    resource ? `${resource} not found` : "Resource not found",
    404,
  );
}

export function unauthorizedResponse() {
  return errorResponse("Unauthorized", 401);
}
