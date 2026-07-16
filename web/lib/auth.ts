import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { adminEmail, isAdminEmail } from "@/lib/admin-config";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          if (!session?.userId || !adminEmail) return;
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { email: true },
          });
          if (isAdminEmail(user?.email)) {
            await prisma.user.update({
              where: { id: session.userId },
              data: { role: "ADMIN" },
            });
          }
        },
      },
    },
  },
});