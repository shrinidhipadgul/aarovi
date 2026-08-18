"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt: number | null;
  images: string[];
  sizes: string[];
  inStock: boolean;
  stock: number;
  featured: boolean;
  category: string;
  createdAt: string;
}

interface ProductListClientProps {
  initialProducts: Product[];
  initialTotal: number;
}

export function ProductListClient({
  initialProducts,
  initialTotal,
}: ProductListClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const limit = 20;

  const fetchProducts = useCallback(
    async (q: string, p: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        params.set("page", String(p));
        params.set("limit", String(limit));

        const res = await fetch(`/api/admin/products?${params}`);
        const json = await res.json();

        if (json.success) {
          setProducts(json.data.products);
          setTotal(json.data.pagination.total);
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(search, 1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setTotal((prev) => prev - 1);
        router.refresh();
      } else {
        alert(json?.message || "Failed to delete product. Please try again.");
      }
    } catch {
      alert("Network error while deleting product.");
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mt-6">
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="flex-1 rounded-lg border border-brand-primary/15 bg-brand-bg px-4 py-2 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-60"
        >
          {loading ? "…" : "Search"}
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-brand-primary/15">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-primary/15 bg-brand-primary/5">
              <th className="px-3 py-2 font-medium text-brand-text/70">Image</th>
              <th className="px-3 py-2 font-medium text-brand-text/70">Name</th>
              <th className="px-3 py-2 font-medium text-brand-text/70">Price</th>
              <th className="px-3 py-2 font-medium text-brand-text/70">Stock</th>
              <th className="px-3 py-2 font-medium text-brand-text/70">In Stock</th>
              <th className="px-3 py-2 font-medium text-brand-text/70">Featured</th>
              <th className="px-3 py-2 font-medium text-brand-text/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-brand-primary/5 transition-colors hover:bg-brand-primary/[0.02]"
              >
                <td className="px-3 py-2">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-brand-primary/10" />
                  )}
                </td>
                <td className="max-w-[200px] truncate px-3 py-2 font-medium text-brand-text">
                  {product.name}
                </td>
                <td className="px-3 py-2 text-brand-text/80">
                  ₹{product.price.toLocaleString("en-IN")}
                </td>
                <td className="px-3 py-2 text-brand-text/80">{product.stock}</td>
                <td className="px-3 py-2">
                  {product.inStock ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Yes
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      No
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {product.featured ? (
                    <span className="text-brand-gold">★</span>
                  ) : (
                    <span className="text-brand-text/20">☆</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-brand-gold transition-colors hover:bg-brand-gold/10"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-brand-text/40">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => {
              setPage((p) => p - 1);
              fetchProducts(search, page - 1);
            }}
            className="rounded-lg px-3 py-1.5 text-brand-text/60 transition-colors hover:bg-brand-primary/5 disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-brand-text/60">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => {
              setPage((p) => p + 1);
              fetchProducts(search, page + 1);
            }}
            className="rounded-lg px-3 py-1.5 text-brand-text/60 transition-colors hover:bg-brand-primary/5 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}