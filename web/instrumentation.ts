export async function register(): Promise<void> {
  if (process.env.SKIP_ADMIN_SEED === "1") return;

  const { isAdminConfigured, adminEmail, adminPassword } = await import(
    "@/lib/admin-config"
  );
  if (!isAdminConfigured()) return;

  try {
    const { hashPassword } = await import("better-auth/crypto");
    const { prisma } = await import("@/lib/prisma");

    const hashedPassword = await hashPassword(adminPassword);
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

    console.log(`[admin] Provisioned admin user: ${adminEmail}`);
  } catch (error) {
    console.error("[admin] Failed to provision admin user:", error);
  }
}