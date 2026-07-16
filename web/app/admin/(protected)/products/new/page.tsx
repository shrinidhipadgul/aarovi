import type { Metadata } from "next";
import { ProductForm } from "../product-form";

export const metadata: Metadata = {
  title: "New Product",
  description: "Create a new product — Aarovi admin.",
  robots: { index: false, follow: false },
};

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-brand-primary">
        New Product
      </h1>
      <ProductForm mode="create" />
    </div>
  );
}