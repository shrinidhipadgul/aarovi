import { getSession } from "@/lib/get-session";
import { isAdminEmail, warnIfAdminNotConfigured } from "@/lib/admin-config";
import { prisma } from "@/lib/prisma";

export interface AdminCheckResult {
  isAdmin: boolean;
  session?: Awaited<ReturnType<typeof getSession>>;
}

export async function isAdmin(): Promise<AdminCheckResult> {
  warnIfAdminNotConfigured();

  const session = await getSession();
  if (!session?.user?.id) {
    return { isAdmin: false };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, role: true },
  });

  if (!user) {
    return { isAdmin: false, session };
  }

  const isAdmin =
    user.role === "ADMIN" || isAdminEmail(session.user.email) || isAdminEmail(user.email);

  return { isAdmin, session };
}