import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";

export const POST = withErrorHandler(async (req: Request) => {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return errorResponse("Email is required", 400);
  }

  const trimmed = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return errorResponse("Please enter a valid email address", 400);
  }

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: trimmed },
  });

  if (existing) {
    return successResponse({ message: "You're already subscribed!" }, 200);
  }

  await prisma.newsletterSubscriber.create({
    data: { email: trimmed },
  });

  return successResponse({ message: "Thanks for subscribing!" }, 201);
});
