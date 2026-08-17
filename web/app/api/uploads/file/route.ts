import { NextResponse } from "next/server";
import { getUploadAdapter } from "@/lib/uploads";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return new NextResponse("Key parameter is required", { status: 400 });
  }

  const adapter = getUploadAdapter();

  if (adapter.getObject) {
    try {
      const obj = await adapter.getObject(key);
      const headers: Record<string, string> = {
        "Content-Type": obj.contentType || "application/octet-stream",
        "Cache-Control":
          obj.cacheControl || "public, max-age=31536000, immutable",
      };

      if (obj.contentLength !== undefined) {
        headers["Content-Length"] = obj.contentLength.toString();
      }
      if (obj.etag) {
        headers["ETag"] = obj.etag;
      }

      return new NextResponse(Buffer.from(obj.body), {
        status: 200,
        headers,
      });
    } catch {
      return new NextResponse("File not found or access denied", {
        status: 404,
      });
    }
  }

  if (adapter.getPresignedGetUrl) {
    try {
      const signedUrl = await adapter.getPresignedGetUrl(key);
      return NextResponse.redirect(signedUrl, { status: 307 });
    } catch {
      return new NextResponse("File not found or access denied", {
        status: 404,
      });
    }
  }

  const cleanKey = key.startsWith("/") ? key : `/${key}`;
  return NextResponse.redirect(new URL(cleanKey, req.url), { status: 307 });
}
