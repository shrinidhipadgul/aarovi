"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import MobileDrawer from "@/components/mobile-drawer";
import SearchOverlay from "@/components/search-overlay";
import { authClient } from "@/lib/auth-client";
import { useWishlistCount, fetchWishlist, resetWishlist } from "@/lib/stores/wishlist";
import { useCartCount, fetchCart, resetCart } from "@/lib/stores/cart";
import { useLocalCartCount } from "@/lib/stores/local-cart";

const womenSubcategories = [
  { label: "Kurtis", href: "/shop/kurtis" },
  { label: "Kurti-Sets", href: "/shop/kurti-sets" },
  { label: "Anarkalis", href: "/shop/anarkalis" },
  { label: "Lehengas", href: "/shop/lehengas" },
  { label: "Sheraras", href: "/shop/sheraras" },
];

const menSubcategories = [
  { label: "Kurtas", href: "/shop/kurtas" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"women" | "men" | null>(
    null,
  );
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const serverCartCount = useCartCount();
  const localCartCount = useLocalCartCount();
  const wishlistCount = useWishlistCount();

  const { data: session } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const loggedIn = !!session;
  const cartCount = loggedIn ? serverCartCount : localCartCount;

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setIsAdmin(j.success && j.data?.admin === true);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [session]);
  const handleSignOut = () => {
    resetWishlist();
    resetCart();
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (session) {
      fetchWishlist();
      fetchCart();
    }
  }, [session]);

  useEffect(() => {
    startTransition(() => {
      setMobileOpen(false);
      setActiveDropdown(null);
      setAccountOpen(false);
      setSearchOpen(false);
    });
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const renderDropdown = (
    key: "women" | "men",
    subs: { label: string; href: string }[],
  ) => {
    const isOpen = activeDropdown === key;
    return (
      <li
        className="relative"
        onMouseEnter={() => setActiveDropdown(key)}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <button
          aria-expanded={isOpen}
          aria-haspopup="menu"
          className={`flex items-center gap-1 text-sm font-medium uppercase tracking-wider transition-colors hover:text-brand-gold ${
            isOpen ? "text-brand-gold" : "text-brand-text"
          }`}
        >
          {key === "women" ? "WOMEN" : "MEN"}
          <svg
            className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isOpen && (
          <div role="menu" className="absolute left-0 top-full mt-2 min-w-48 rounded-lg bg-white p-2 shadow-lg ring-1 ring-black/5">
            {subs.map((sub) => (
              <Link
                key={sub.label}
                href={sub.href}
                role="menuitem"
                className={`block rounded-md px-4 py-2 text-sm transition-colors hover:bg-brand-bg ${
                  isActive(sub.href)
                    ? "font-medium text-brand-gold"
                    : "text-brand-text"
                }`}
              >
                {sub.label}
              </Link>
            ))}
          </div>
        )}
      </li>
    );
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-brand-bg/95 backdrop-blur-sm shadow-sm"
          : "bg-brand-bg"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <Link href="/">
          <img src="/logo.png" alt="AAROVI" className="h-12 w-auto" />
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          <li>
            <Link
              href="/"
              className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-brand-gold ${
                isActive("/") ? "text-brand-gold" : "text-brand-text"
              }`}
            >
              HOME
            </Link>
          </li>
          {renderDropdown("women", womenSubcategories)}
          {renderDropdown("men", menSubcategories)}
          <li>
            <Link
              href="/about"
              className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-brand-gold ${
                isActive("/about") ? "text-brand-gold" : "text-brand-text"
              }`}
            >
              ABOUT
            </Link>
          </li>
          <li>
            <Link
              href="/customize"
              className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-brand-gold ${
                isActive("/customize") ? "text-brand-gold" : "text-brand-text"
              }`}
            >
              CUSTOMIZE
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-brand-gold ${
                isActive("/contact") ? "text-brand-gold" : "text-brand-text"
              }`}
            >
              CONTACT
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-3 lg:gap-5">
          <button
            onClick={() => setSearchOpen(true)}
            className="text-brand-text transition-colors hover:text-brand-gold"
            aria-label="Search"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          <div className="relative">
            {loggedIn ? (
              <>
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  className="text-brand-text transition-colors hover:text-brand-gold"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
                {accountOpen && (
                  <div role="menu" className="absolute right-0 top-full mt-2 min-w-44 rounded-lg bg-white p-2 shadow-lg ring-1 ring-black/5">
                    <Link
                      href={`/profile/${session.user.id}`}
                      role="menuitem"
                      className="block rounded-md px-4 py-2 text-sm text-brand-text transition-colors hover:bg-brand-bg"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      role="menuitem"
                      className="block rounded-md px-4 py-2 text-sm text-brand-text transition-colors hover:bg-brand-bg"
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        role="menuitem"
                        className="block rounded-md px-4 py-2 text-sm font-medium text-brand-gold transition-colors hover:bg-brand-bg"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      role="menuitem"
                      className="block w-full rounded-md px-4 py-2 text-left text-sm text-brand-text transition-colors hover:bg-brand-bg"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/sign-in"
                className="text-brand-text transition-colors hover:text-brand-gold"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
            )}
          </div>

          <Link
            href="/wishlist"
            className="relative text-brand-text transition-colors hover:text-brand-gold"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-white">
              {wishlistCount}
            </span>
          </Link>

          <Link
            href="/cart"
            className="relative text-brand-text transition-colors hover:text-brand-gold"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-white">
              {cartCount}
            </span>
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-brand-text transition-colors hover:text-brand-gold lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </header>
  );
}
