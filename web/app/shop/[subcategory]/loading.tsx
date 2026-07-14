import { ProductCardSkeleton } from "@/components/product-card";

export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="h-8 w-48 rounded bg-brand-primary/10" />
        <div className="mt-3 h-4 w-32 rounded bg-brand-primary/5" />
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="space-y-6">
            <div className="h-40 rounded-lg bg-brand-primary/5" />
            <div className="h-32 rounded-lg bg-brand-primary/5" />
            <div className="h-24 rounded-lg bg-brand-primary/5" />
          </div>
        </aside>
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}