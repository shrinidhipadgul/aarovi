import { ProductCardSkeleton } from "@/components/product-card";

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="aspect-[4/5] w-full rounded-xl bg-brand-primary/5 lg:w-1/2" />
        <div className="flex-1 space-y-6">
          <div className="h-8 w-3/4 rounded bg-brand-primary/10" />
          <div className="h-6 w-1/4 rounded bg-brand-primary/5" />
          <div className="h-4 w-1/3 rounded bg-brand-primary/5" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-brand-primary/5" />
            <div className="h-4 w-5/6 rounded bg-brand-primary/5" />
            <div className="h-4 w-4/6 rounded bg-brand-primary/5" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-12 rounded-lg bg-brand-primary/5" />
            <div className="h-10 w-12 rounded-lg bg-brand-primary/5" />
            <div className="h-10 w-12 rounded-lg bg-brand-primary/5" />
            <div className="h-10 w-12 rounded-lg bg-brand-primary/5" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 rounded bg-brand-primary/5" />
            <div className="h-10 w-8 rounded bg-brand-primary/5" />
            <div className="h-10 w-8 rounded bg-brand-primary/5" />
          </div>
          <div className="h-12 w-full rounded-lg bg-brand-primary/10" />
        </div>
      </div>
      <div className="mt-16">
        <div className="mb-8 h-6 w-40 rounded bg-brand-primary/10" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}