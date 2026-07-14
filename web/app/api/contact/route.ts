import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";

export const POST = withErrorHandler(async (req: Request) => {
  const body = (await req.json()) as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  const errors: Record<string, string[]> = {};

  if (!body.name || body.name.trim().length < 2) {
    errors.name = ["Name must be at least 2 characters"];
  }
  if (
    !body.email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
  ) {
    errors.email = ["Invalid email address"];
  }
  if (!body.subject || body.subject.trim().length < 3) {
    errors.subject = ["Subject must be at least 3 characters"];
  }
  if (!body.message || body.message.trim().length < 10) {
    errors.message = ["Message must be at least 10 characters"];
  }

  if (Object.keys(errors).length > 0) {
    return errorResponse("Invalid form data", 400, errors);
  }

  await prisma.contactMessage.create({
    data: {
      name: body.name!.trim(),
      email: body.email!.trim(),
      subject: body.subject!.trim(),
      message: body.message!.trim(),
    },
  });

  return successResponse(
    { message: "Thank you! We'll get back to you soon." },
    201,
  );
});