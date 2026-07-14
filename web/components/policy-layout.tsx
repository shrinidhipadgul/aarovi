import type { ReactNode } from "react";

export function PolicyLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-brand-primary sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-brand-text/60">
        Last updated: {lastUpdated}
      </p>
      <div className="mt-8 space-y-8">{children}</div>
      <BackToTop />
    </div>
  );
}

export function PolicySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-brand-primary">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-brand-text/70 [&>p]:mt-2 [&>p]:first:mt-0 [&>ul]:mt-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1">
        {children}
      </div>
    </section>
  );
}

function BackToTop() {
  return (
    <a
      href="#"
      className="mt-12 inline-block text-sm font-medium text-brand-gold transition-colors hover:text-brand-primary"
    >
      &uarr; Back to top
    </a>
  );
}