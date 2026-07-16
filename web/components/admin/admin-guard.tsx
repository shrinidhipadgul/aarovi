"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    let cancelled = false;
    const callbackURL = encodeURIComponent(pathname);

    fetch("/api/admin/me")
      .then((res) => {
        if (cancelled) return;
        if (res.ok) setStatus("ok");
        else {
          setStatus("denied");
          router.replace(`/admin/sign-in?callbackURL=${callbackURL}`);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("denied");
        router.replace(`/admin/sign-in?callbackURL=${callbackURL}`);
      });

    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" />
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-brand-text/60">Redirecting to admin sign in…</p>
      </div>
    );
  }

  return <>{children}</>;
}