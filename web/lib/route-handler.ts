import { NextRequest, NextResponse } from "next/server";

export type RouteHandler = (
  req: NextRequest,
  ...args: any[]
) => Promise<NextResponse>;
