import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brief Submitted — Aarovi",
  description:
    "Your bespoke customization brief has been submitted. We will review it and get back to you within 48 hours.",
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-brand-ivory texture-weave px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-lg text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-brand-gold">
          N&deg; 00 &mdash; BESPOKE
        </p>
        <h1 className="mt-6 font-display text-3xl leading-tight text-brand-primary sm:text-4xl">
          Thank you for your brief.
        </h1>
        <p className="mx-auto mt-6 max-w-sm font-serif text-lg italic leading-relaxed text-brand-text/60">
          Our atelier will review your selections and respond within 48 hours
          with a quote and lead time.
        </p>
        {id && (
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-brand-gold">
            Brief ID &mdash; {id}
          </p>
        )}
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-text/30">
          You&rsquo;ll receive a confirmation by email shortly.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={id ? `/orders?tab=customize&id=${encodeURIComponent(id)}` : "/orders?tab=customize"}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-primary px-8 font-mono text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-brand-primary/90"
          >
            Track in My Orders &rarr;
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-brand-primary/20 bg-transparent px-8 font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand-primary transition-colors duration-300 hover:bg-brand-primary/5"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

