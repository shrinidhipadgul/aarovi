"use client";

import { useState, useEffect, useRef, useCallback, startTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: string;
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "aarovi:recent-searches";
const MAX_RECENT = 5;
const DEBOUNCE_MS = 300;

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      startTransition(() => {
        setQuery("");
        setResults([]);
      });
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) startTransition(() => setRecentSearches(JSON.parse(stored)));
      } catch {
        /* ignore parse errors */
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      startTransition(() => {
        setResults([]);
        setLoading(false);
      });
      return;
    }
    startTransition(() => setLoading(true));
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const json = await res.json();
        setResults(json.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const persistSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;
      persistSearch(trimmed);
      onClose();
      router.push(`/shop/collection?q=${encodeURIComponent(trimmed)}`);
    },
    [query, onClose, router, persistSearch],
  );

  const handleSuggestionClick = useCallback(
    (product: SearchProduct) => {
      persistSearch(product.name);
      onClose();
      router.push(`/product/${product.id}`);
    },
    [persistSearch, onClose, router],
  );

  const handleRecentClick = useCallback(
    (term: string) => {
      setQuery(term);
      inputRef.current?.focus();
    },
    [],
  );

  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const showRecent = query.trim().length < 2 && recentSearches.length > 0;
  const showResults = query.trim().length >= 2;
  const showNoResults = showResults && !loading && results.length === 0;

  return (
    <div
      className={`fixed inset-0 z-[60] flex justify-center bg-black/60 px-4 pt-20 transition-opacity duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className="mx-auto w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-xl border border-brand-primary/10 bg-brand-bg shadow-2xl transition-transform duration-300">
          {/* Search input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-brand-primary/10 px-5 py-4">
            <svg
              className="h-5 w-5 shrink-0 text-brand-text/50"
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
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-base text-brand-text outline-none placeholder:text-brand-text/40"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="shrink-0 rounded-md p-1 text-brand-text/50 transition-colors hover:text-brand-text"
                aria-label="Clear input"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-md p-1 text-brand-text/50 transition-colors hover:text-brand-text"
              aria-label="Close search"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </form>

          {/* Content area */}
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {/* Loading */}
            {loading && (
              <p className="py-6 text-center text-sm text-brand-text/50">Searching...</p>
            )}

            {/* Recent searches */}
            {showRecent && !loading && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-gold">
                    Recent Searches
                  </h3>
                  <button
                    type="button"
                    onClick={clearRecent}
                    className="text-xs text-brand-text/50 transition-colors hover:text-brand-gold"
                  >
                    Clear All
                  </button>
                </div>
                <ul className="space-y-1">
                  {recentSearches.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => handleRecentClick(term)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-brand-text/70 transition-colors hover:bg-brand-primary/5 hover:text-brand-text"
                      >
                        <svg className="h-4 w-4 text-brand-text/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Results */}
            {showResults && !loading && results.length > 0 && (
              <ul className="space-y-2">
                {results.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => handleSuggestionClick(product)}
                      className="flex w-full items-center gap-4 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-brand-primary/5"
                    >
                      {product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={56}
                          height={56}
                          className="h-14 w-14 shrink-0 rounded-md object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-brand-text">
                          {product.name}
                        </p>
                        <p className="text-xs text-brand-text/50">
                          {product.category}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-brand-primary">
                        &#8377;{product.price.toLocaleString("en-IN")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* No results */}
            {showNoResults && (
              <p className="py-8 text-center text-sm text-brand-text/50">
                No products found for &ldquo;{query.trim()}&rdquo;
              </p>
            )}

            {/* Empty initial state */}
            {query.trim().length < 2 && recentSearches.length === 0 && !loading && (
              <p className="py-8 text-center text-sm text-brand-text/40">
                Start typing to search our collection
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}