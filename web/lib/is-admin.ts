import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export interface AdminCheckResult {
  isAdmin: boolean;
  session?: Awaited<ReturnType<typeof getSession>>;
}

export async function isAdmin(): Promise<AdminCheckResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { isAdmin: false };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user) {
    return { isAdmin: false, session };
  }

  return { isAdmin: user.role === "ADMIN", session };
}
