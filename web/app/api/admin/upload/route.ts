import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-require-admin";
import { withErrorHandler } from "@/lib/with-error-handler";
import { errorResponse } from "@/lib/api-response";
import { uploadAdapter } from "@/lib/uploads";

const handleUpload = async (req: Request) => {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return errorResponse("No files provided", 400);
  }

  const paths: string[] = [];
  const errors: { name: string; error: string }[] = [];

  for (const file of files) {
    try {
      const path = await uploadAdapter.save(file, file.name);
      paths.push(path);
    } catch (err) {
      errors.push({
        name: file.name,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: { paths, errors },
  });
};

const handleDelete = async (req: Request) => {
  const body = (await req.json()) as { path: string };
  if (!body.path) {
    return errorResponse("path is required", 400);
  }

  await uploadAdapter.delete(body.path);
  return NextResponse.json({ success: true });
};

export const POST = requireAdmin(withErrorHandler(handleUpload));
export const DELETE = requireAdmin(withErrorHandler(handleDelete));