"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function AdminSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL") || "/admin";
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const { error: authError } = await authClient.signIn.email({
      email,
      password,
      callbackURL,
    });

    if (authError) {
      setError(authError.message ?? authError.statusText ?? "Something went wrong");
      setLoading(false);
      return;
    }

    router.push(callbackURL);
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-center font-display text-3xl font-bold text-brand-primary">
        Admin Portal
      </h1>
      <p className="mt-2 text-center text-sm text-brand-text/60">
        Restricted access. Authorized administrators only.
      </p>

      {reason === "forbidden" && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          You do not have permission to access the admin area.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-brand-text">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-brand-primary/15 bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold"
            placeholder="admin@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-brand-text">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-brand-primary/15 bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold"
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default function AdminSignInPage() {
  return (
    <Suspense fallback={null}>
      <AdminSignInForm />
    </Suspense>
  );
}