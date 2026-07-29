import { NextResponse } from "next/server";
import { getUploadAdapter } from "@/lib/uploads";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return new NextResponse("Key parameter is required", { status: 400 });
  }

  const adapter = getUploadAdapter();

  if (adapter.getPresignedGetUrl) {
    try {
      const signedUrl = await adapter.getPresignedGetUrl(key);
      return NextResponse.redirect(signedUrl, { status: 307 });
    } catch {
      return new NextResponse("File not found or access denied", { status: 404 });
    }
  }

  const cleanKey = key.startsWith("/") ? key : `/${key}`;
  return NextResponse.redirect(new URL(cleanKey, req.url), { status: 307 });
}
