"use client";

import { useState } from "react";
import type { FormEvent } from "react";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY_FORM: FormData = { name: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (status !== "idle") setStatus("idle");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus("idle");
    setStatusMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json?.errors) {
          const flat: Record<string, string[]> = {};
          for (const [key, value] of Object.entries(
            json.errors as Record<string, string[]>,
          )) {
            flat[key] = Array.isArray(value) ? value : [String(value)];
          }
          setErrors(flat);
        }
        setStatus("error");
        setStatusMsg(json?.message ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setStatus("success");
      setStatusMsg(json?.data?.message ?? "Thank you! We'll get back to you soon.");
      setForm(EMPTY_FORM);
    } catch {
      setStatus("error");
      setStatusMsg("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-semibold text-brand-primary sm:text-4xl">
          Get in Touch
        </h1>
        <p className="mt-3 text-base text-brand-text/60">
          We&apos;d love to hear from you. Drop us a message and we&apos;ll get
          back as soon as possible.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <section>
          <h2 className="sr-only">Contact form</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Name"
                value={form.name}
                error={errors.name?.[0]}
                onChange={(v) => handleChange("name", v)}
                placeholder="Your full name"
              />
              <FormField
                label="Email"
                value={form.email}
                error={errors.email?.[0]}
                onChange={(v) => handleChange("email", v)}
                placeholder="you@example.com"
                type="email"
              />
            </div>
            <FormField
              label="Subject"
              value={form.subject}
              error={errors.subject?.[0]}
              onChange={(v) => handleChange("subject", v)}
              placeholder="What is this about?"
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-text">
                Message
              </label>
              <textarea
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="Tell us more…"
                rows={5}
                className={`w-full rounded-lg border bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold ${
                  errors.message ? "border-red-300" : "border-brand-primary/15"
                }`}
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-500">{errors.message[0]}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting ? "Sending…" : "Send Message"}
            </button>

            {status === "success" && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                {statusMsg}
              </div>
            )}
            {status === "error" && !Object.keys(errors).length && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {statusMsg}
              </div>
            )}
          </form>
        </section>

        <aside className="space-y-8">
          <div className="rounded-xl border border-brand-primary/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-brand-primary">
              Contact Info
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              <ContactItem
                label="Phone"
                value="+91 7416964805"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
              />
              <ContactItem
                label="Email"
                value="aaroviofficial@gmail.com"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
              <ContactItem
                label="Address"
                value="Hyderabad, Telangana, India"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
            </dl>
          </div>

          <div className="rounded-xl border border-brand-primary/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-brand-primary">
              Follow Us
            </h2>
            <div className="mt-4 flex gap-4">
              <SocialLink
                href="https://www.instagram.com/aaroviofficial"
                label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </SocialLink>
              <SocialLink
                href="https://www.linkedin.com/company/aaroviofficial"
                label="LinkedIn"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </SocialLink>
              <SocialLink
                href="https://x.com/aaroviofficial"
                label="Twitter / X"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </SocialLink>
            </div>
          </div>

          <div className="rounded-xl border border-brand-primary/10 bg-brand-bg p-6">
            <h2 className="text-lg font-semibold text-brand-primary">
              Visit Us
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-text/70">
              We&apos;re based in Hyderabad, Telangana, India. While we
              primarily operate online, you can reach us via phone or email
              during business hours (Mon&ndash;Sat, 10 AM&ndash;7 PM IST).
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  error,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-brand-text">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold ${
          error ? "border-red-300" : "border-brand-primary/15"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function ContactItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex-none text-brand-gold">{icon}</div>
      <div>
        <dt className="text-xs text-brand-text/60">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-brand-text">{value}</dd>
      </div>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-primary/15 text-brand-text/60 transition-colors hover:border-brand-gold hover:text-brand-gold"
    >
      {children}
    </a>
  );
}