import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { withErrorHandler } from "@/lib/with-error-handler";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { validateAddress } from "@/lib/checkout";

export const GET = withErrorHandler(async () => {
  const session = await getSession();

  if (!session?.user?.id) {
    return unauthorizedResponse();
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
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
  });

  return successResponse(addresses);
});

export const POST = withErrorHandler(async (req: Request) => {
  const session = await getSession();

  if (!session?.user?.id) {
    return unauthorizedResponse();
  }

  const body = (await req.json()) as {
    fullName?: string;
    phone?: string;
    line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
    isDefault?: boolean;
  };

  const errors = validateAddress(body);
  if (Object.keys(errors).length > 0) {
    const formatted: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(errors)) {
      formatted[key] = [value];
    }
    return errorResponse("Invalid address", 400, formatted);
  }

  const result = await prisma.$transaction(async (tx) => {
    if (body.isDefault) {
      await tx.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        userId: session.user.id,
        fullName: body.fullName!,
        phone: body.phone!,
        line1: body.line1!,
        city: body.city!,
        state: body.state!,
        pincode: body.pincode!,
        isDefault: body.isDefault ?? false,
      },
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
    });
  });

  return successResponse(result, 201);
});