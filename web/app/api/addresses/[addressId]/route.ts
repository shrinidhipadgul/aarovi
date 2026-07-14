import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { handleApiError } from "@/lib/api-errors";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";
import { validateAddress } from "@/lib/checkout";

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/addresses/[addressId]">,
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { addressId } = await ctx.params;
    const body = (await req.json()) as {
      fullName?: string;
      phone?: string;
      line1?: string;
      city?: string;
      state?: string;
      pincode?: string;
      isDefault?: boolean;
    };

    const existing = await prisma.address.findUnique({
      where: { id: addressId },
      select: { id: true, userId: true },
    });

    if (!existing) {
      return notFoundResponse("Address");
    }

    if (existing.userId !== session.user.id) {
      return errorResponse("Forbidden", 403);
    }

    if (body.fullName !== undefined || body.phone !== undefined || body.line1 !== undefined || body.city !== undefined || body.state !== undefined || body.pincode !== undefined) {
      const errors = validateAddress({
        fullName: body.fullName,
        phone: body.phone,
        line1: body.line1,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
      });
      if (Object.keys(errors).length > 0) {
        const formatted: Record<string, string[]> = {};
        for (const [key, value] of Object.entries(errors)) {
          formatted[key] = [value];
        }
        return errorResponse("Invalid address", 400, formatted);
      }
    }

    const updateData: Record<string, string | boolean> = {};
    if (body.fullName !== undefined) updateData.fullName = body.fullName;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.line1 !== undefined) updateData.line1 = body.line1;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.pincode !== undefined) updateData.pincode = body.pincode;
    if (body.isDefault !== undefined) updateData.isDefault = body.isDefault;

    const result = await prisma.$transaction(async (tx) => {
      if (body.isDefault) {
        await tx.address.updateMany({
          where: { userId: session.user.id, id: { not: addressId } },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: updateData,
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

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/addresses/[addressId]">,
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { addressId } = await ctx.params;

    const existing = await prisma.address.findUnique({
      where: { id: addressId },
      select: { id: true, userId: true },
    });

    if (!existing) {
      return notFoundResponse("Address");
    }

    if (existing.userId !== session.user.id) {
      return errorResponse("Forbidden", 403);
    }

    await prisma.address.delete({ where: { id: addressId } });

    return successResponse({ deleted: addressId });
  } catch (error) {
    return handleApiError(error);
  }
}