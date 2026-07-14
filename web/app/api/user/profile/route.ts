import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { withErrorHandler } from "@/lib/with-error-handler";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

export const GET = withErrorHandler(async () => {
  const session = await getSession();

  if (!session?.user?.id) {
    return unauthorizedResponse();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      phone: true,
      addresses: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          line1: true,
          city: true,
          state: true,
          pincode: true,
          isDefault: true,
        },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!user) {
    return errorResponse("User not found", 404);
  }

  return successResponse(user);
});

export const PUT = withErrorHandler(async (req: Request) => {
  const session = await getSession();

  if (!session?.user?.id) {
    return unauthorizedResponse();
  }

  const body = (await req.json()) as {
    name?: string;
    email?: string;
    phone?: string;
  };

  const data: Record<string, string | null> = {};

  if (body.name !== undefined) {
    if (body.name.trim().length < 2) {
      return errorResponse("Name must be at least 2 characters", 400, {
        name: ["Name must be at least 2 characters"],
      });
    }
    data.name = body.name.trim();
  }

  if (body.email !== undefined) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return errorResponse("Invalid email address", 400, {
        email: ["Invalid email address"],
      });
    }
    const existing = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true },
    });
    if (existing && existing.id !== session.user.id) {
      return errorResponse("Email already in use", 409, {
        email: ["Email already in use"],
      });
    }
    data.email = body.email.trim();
  }

  if (body.phone !== undefined) {
    if (body.phone && !/^[6-9]\d{9}$/.test(body.phone)) {
      return errorResponse("Invalid phone number", 400, {
        phone: ["Invalid phone number"],
      });
    }
    data.phone = body.phone?.trim() ?? null;
  }

  if (Object.keys(data).length === 0) {
    return errorResponse("Nothing to update", 400);
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      phone: true,
    },
  });

  return successResponse(updated);
});