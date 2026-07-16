"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AdminSignOut() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace("/admin/sign-in");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="text-left text-sm font-medium text-brand-text/50 transition-colors hover:text-brand-primary"
    >
      Sign out
    </button>
  );
}