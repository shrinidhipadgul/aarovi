"use client";

import { useState, FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setStatus("error");
      setMessage("Please enter your email address");
      return;
    }

    if (!isValidEmail(trimmed)) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.data?.message ?? "Thanks for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <section className="bg-brand-dark px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
          Join Our Newsletter
        </h2>
        <p className="mt-3 text-sm text-white/60">
          Subscribe to get early access to new arrivals, exclusive offers, and
          styling inspiration.
        </p>

        {status === "success" ? (
          <div className="mt-8 rounded-lg border border-brand-gold/30 bg-brand-gold/10 px-6 py-4">
            <p className="text-brand-gold">{message}</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-lg gap-3"
          >
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") {
                    setStatus("idle");
                    setMessage("");
                  }
                }}
                placeholder="Enter your email"
                disabled={status === "loading"}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-brand-gold disabled:opacity-50"
              />
              {status === "error" && message && (
                <p className="mt-1.5 text-left text-xs text-red-400">
                  {message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="shrink-0 rounded-lg bg-brand-gold px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-gold/90 disabled:opacity-50"
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
