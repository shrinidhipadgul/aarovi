"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slugify";

interface Category {
  name: string;
  slug: string;
  gender: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAt: string;
  category: string;
  subCategory: string;
  sizes: string[];
  stock: string;
  featured: boolean;
  images: string[];
}

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: Partial<ProductFormData>;
  productId?: string;
}

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export function ProductForm({ mode, initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const defaultFormData: ProductFormData = {
    name: "",
    slug: "",
    description: "",
    price: "",
    compareAt: "",
    category: "",
    subCategory: "",
    sizes: [],
    stock: "",
    featured: false,
    images: [],
  };

  const [form, setForm] = useState<ProductFormData>(() => ({
    ...defaultFormData,
    ...initialData,
  }));

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      })
      .catch(() => {});
  }, []);

  const set = (field: keyof ProductFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const handleNameChange = (name: string) => {
    set("name", name);
    if (mode === "create" && !form.slug) {
      set("slug", slugify(name));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setServerError("");

    try {
      const body = new FormData();
      for (const file of Array.from(files)) {
        body.append("files", file);
      }

      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json();

      if (json.success && json.data.paths) {
        set("images", [...form.images, ...json.data.paths]);
      }
      if (json.data.errors && json.data.errors.length > 0) {
        setServerError(json.data.errors.map((e: { error: string }) => e.error).join(", "));
      }
    } catch {
      setServerError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    set("images", form.images.filter((_, i) => i !== index));
  };

  const toggleSize = (size: string) => {
    set(
      "sizes",
      form.sizes.includes(size)
        ? form.sizes.filter((s) => s !== size)
        : [...form.sizes, size],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setServerError("");
    setFieldErrors({});

    const body: Record<string, unknown> = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description,
      price: form.price ? parseFloat(form.price) : undefined,
      compareAt: form.compareAt ? parseFloat(form.compareAt) : undefined,
      category: form.category,
      subCategory: form.subCategory || undefined,
      sizes: form.sizes,
      stock: form.stock ? parseInt(form.stock, 10) : 0,
      featured: form.featured,
      images: form.images,
    };

    const url =
      mode === "create"
        ? "/api/admin/products"
        : `/api/admin/products/${productId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();

      if (!res.ok) {
        if (json.errors) setFieldErrors(json.errors);
        setServerError(json.message || "Something went wrong");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setServerError("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-w-2xl">
      {serverError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-brand-text">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full rounded-lg border border-brand-primary/15 bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold"
        />
        {fieldErrors.name && (
          <p className="mt-1 text-xs text-red-500">{fieldErrors.name[0]}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="mb-1 block text-sm font-medium text-brand-text">
          Slug
        </label>
        <input
          id="slug"
          type="text"
          value={form.slug}
          onChange={(e) => set("slug", e.target.value)}
          className="w-full rounded-lg border border-brand-primary/15 bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold"
        />
        {fieldErrors.slug && (
          <p className="mt-1 text-xs text-red-500">{fieldErrors.slug[0]}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-brand-text">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="w-full rounded-lg border border-brand-primary/15 bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold"
        />
        {fieldErrors.description && (
          <p className="mt-1 text-xs text-red-500">{fieldErrors.description[0]}</p>
        )}
      </div>

      {/* Price */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium text-brand-text">
            Price (₹) <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            className="w-full rounded-lg border border-brand-primary/15 bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold"
          />
          {fieldErrors.price && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.price[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="compareAt" className="mb-1 block text-sm font-medium text-brand-text">
            Compare At (₹)
          </label>
          <input
            id="compareAt"
            type="number"
            step="0.01"
            min="0"
            value={form.compareAt}
            onChange={(e) => set("compareAt", e.target.value)}
            className="w-full rounded-lg border border-brand-primary/15 bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium text-brand-text">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className="w-full rounded-lg border border-brand-primary/15 bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name} ({cat.gender})
            </option>
          ))}
        </select>
        {fieldErrors.category && (
          <p className="mt-1 text-xs text-red-500">{fieldErrors.category[0]}</p>
        )}
      </div>

      {/* Subcategory */}
      <div>
        <label htmlFor="subCategory" className="mb-1 block text-sm font-medium text-brand-text">
          Subcategory
        </label>
        <input
          id="subCategory"
          type="text"
          value={form.subCategory}
          onChange={(e) => set("subCategory", e.target.value)}
          className="w-full rounded-lg border border-brand-primary/15 bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold"
        />
      </div>

      {/* Sizes */}
      <div>
        <label className="mb-2 block text-sm font-medium text-brand-text">Sizes</label>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                form.sizes.includes(size)
                  ? "border-brand-primary bg-brand-primary text-white"
                  : "border-brand-primary/15 text-brand-text/70 hover:border-brand-primary/30"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Stock */}
      <div>
        <label htmlFor="stock" className="mb-1 block text-sm font-medium text-brand-text">
          Stock Quantity
        </label>
        <input
          id="stock"
          type="number"
          min="0"
          step="1"
          value={form.stock}
          onChange={(e) => set("stock", e.target.value)}
          className="w-full rounded-lg border border-brand-primary/15 bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-gold"
        />
        {fieldErrors.stock && (
          <p className="mt-1 text-xs text-red-500">{fieldErrors.stock[0]}</p>
        )}
      </div>

      {/* Featured */}
      <div>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="h-4 w-4 rounded border-brand-primary/15 text-brand-primary focus:ring-brand-gold"
          />
          <span className="text-sm font-medium text-brand-text">Featured product</span>
        </label>
      </div>

      {/* Images */}
      <div>
        <label className="mb-2 block text-sm font-medium text-brand-text">
          Images
        </label>

        <div className="flex flex-wrap gap-3">
          {form.images.map((url, i) => (
            <div key={i} className="relative h-24 w-24 overflow-hidden rounded-lg border border-brand-primary/15">
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}

          <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-brand-primary/15 bg-brand-bg text-2xl text-brand-text/30 transition-colors hover:border-brand-gold hover:text-brand-gold">
            <span>{uploading ? "…" : "+"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-60"
        >
          {saving ? "Saving…" : mode === "create" ? "Create Product" : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-brand-text/60 transition-colors hover:text-brand-primary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}