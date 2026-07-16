import { prisma } from "@/lib/prisma";
import { adminEmail, isAdminConfigured } from "@/lib/admin-config";

export async function ensureAdminProvisioned(): Promise<void> {
  if ((globalThis as Record<string, unknown>).__adminSeed) return;
  (globalThis as Record<string, unknown>).__adminSeed = true;

  if (process.env.SKIP_ADMIN_SEED === "1") return;
  if (!isAdminConfigured()) return;

  try {
    const { hashPassword } = await import("better-auth/crypto");

    const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD!);
    const ADMIN_NAME = process.env.ADMIN_NAME ?? "Admin";

    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN" },
      create: {
        id: crypto.randomUUID(),
        email: adminEmail,
        name: ADMIN_NAME,
        emailVerified: true,
        role: "ADMIN",
      },
      select: { id: true },
    });

    const credentialAccount = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
      select: { id: true },
    });

    if (credentialAccount) {
      await prisma.account.update({
        where: { id: credentialAccount.id },
        data: { password: hashedPassword },
      });
    } else {
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          providerId: "credential",
          accountId: user.id,
          password: hashedPassword,
        },
      });
    }
  } catch (error) {
    console.error("[admin] Failed to provision admin user:", error);
  }
}