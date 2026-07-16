import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with your Aarovi orders. Find FAQs, track your order, or contact our support team.",
  openGraph: {
    title: "Support | Aarovi",
    description:
      "Get help with your Aarovi orders. Find FAQs, track your order, or contact our support team.",
  },
};

const topics = [
  {
    title: "Track Your Order",
    description: "Check the status and estimated delivery of your order.",
    href: "/status",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Return & Exchange",
    description: "Learn about our return policy and how to initiate a return.",
    href: "/refundpolicy",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: "Shipping Info",
    description: "Domestic and international shipping times and charges.",
    href: "/shippingpolicy",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
  },
  {
    title: "Contact Support",
    description: "Reach out to our team for personalised assistance.",
    href: "/contact",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172a3 3 0 105.656 0 3 3 0 00-5.656 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.225 8.86A8.976 8.976 0 003 12a9 9 0 008.14 8.14" />
      </svg>
    ),
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-brand-primary sm:text-4xl">
          How can we help?
        </h1>
        <p className="mt-3 text-base text-brand-text/60">
          Find answers, track orders, or get in touch with our team.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-4">
        <Link
          href="/faqs"
          className="rounded-lg bg-brand-bg px-4 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-brand-primary/10"
        >
          FAQs
        </Link>
        <Link
          href="/contact"
          className="rounded-lg bg-brand-bg px-4 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-brand-primary/10"
        >
          Contact Us
        </Link>
        <Link
          href="/orders"
          className="rounded-lg bg-brand-bg px-4 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-brand-primary/10"
        >
          My Orders
        </Link>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {topics.map((topic) => (
          <Link
            key={topic.title}
            href={topic.href}
            className="group rounded-xl border border-brand-primary/10 bg-white p-6 transition-all hover:border-brand-gold hover:shadow-sm"
          >
            <div className="text-brand-gold transition-colors group-hover:text-brand-primary">
              {topic.icon}
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-brand-primary">
              {topic.title}
            </h2>
            <p className="mt-2 text-sm text-brand-text/60">
              {topic.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-16 rounded-xl border border-brand-primary/10 bg-brand-bg p-8 text-center">
        <h2 className="font-display text-xl font-bold text-brand-primary">
          Still need help?
        </h2>
        <p className="mt-2 text-sm text-brand-text/60">
          Our support team is available Monday&ndash;Saturday, 10 AM&ndash;7 PM IST.
        </p>
        <div className="mt-6 space-y-2 text-sm">
          <p>
            <span className="font-medium text-brand-text">Phone: </span>
            <a href="tel:+917416964805" className="text-brand-gold hover:text-brand-primary transition-colors">
              +91 74169 64805
            </a>
          </p>
          <p>
            <span className="font-medium text-brand-text">Email: </span>
            <a href="mailto:aaroviofficial@gmail.com" className="text-brand-gold hover:text-brand-primary transition-colors">
              aaroviofficial@gmail.com
            </a>
          </p>
        </div>
        <p className="mt-4 text-xs text-brand-text/40">
          We typically respond within 24 hours.
        </p>
      </div>
    </div>
  );
}
