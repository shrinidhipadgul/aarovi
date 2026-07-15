import Link from "next/link";

const quickLinks = [
  { label: "Shop", href: "/shop/collection" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Customize", href: "/customize" },
];

const policies = [
  { label: "Shipping Policy", href: "/shippingpolicy" },
  { label: "Return Policy", href: "/refundpolicy" },
  { label: "Privacy Policy", href: "/privacypolicy" },
  { label: "Terms & Conditions", href: "/termsconditions" },
];

const support = [
  { label: "Get Help", href: "/support" },
  { label: "FAQs", href: "/faqs" },
  { label: "My Orders", href: "/orders" },
];

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-white/60 transition-colors hover:text-brand-gold"
    >
      {children}
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block text-sm text-white/60 transition-colors hover:text-brand-gold"
    >
      {children}
    </Link>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand-gold">
        {title}
      </h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-brand-dark">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="/" className="text-lg font-bold tracking-[0.2em] text-brand-gold">
              AAROVI
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Bringing you the finest curated handcrafted fashion. Each piece in our collection
              is thoughtfully selected to celebrate timeless elegance and modern style.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <SocialIcon href="https://instagram.com" label="Instagram">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://linkedin.com" label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://x.com" label="X (Twitter)">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Quick Links */}
          <FooterColumn title="Quick Links">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </FooterColumn>

          {/* Policies */}
          <FooterColumn title="Policies">
            {policies.map((link) => (
              <li key={link.label}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </FooterColumn>

          {/* Support & Contact */}
          <FooterColumn title="Support">
            {support.map((link) => (
              <li key={link.label}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
            <li className="pt-2">
              <p className="text-sm font-semibold tracking-wider text-brand-gold">
                Contact
              </p>
            </li>
            <li>
              <a
                href="tel:+917416964805"
                className="block text-sm text-white/60 transition-colors hover:text-brand-gold"
              >
                +91 74169 64805
              </a>
            </li>
            <li>
              <a
                href="mailto:aaroviofficial@gmail.com"
                className="block text-sm text-white/60 transition-colors hover:text-brand-gold"
              >
                aaroviofficial@gmail.com
              </a>
            </li>
            <li className="text-sm text-white/60">Hyderabad, India</li>
          </FooterColumn>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-white/40 lg:px-8">
          &copy; {new Date().getFullYear()} Aarovi Fashions. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
