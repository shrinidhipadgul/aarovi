export default function OrderStatusLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 h-4 w-32 rounded bg-brand-primary/10" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-brand-primary/10" />
          <div className="h-4 w-32 rounded bg-brand-primary/5" />
        </div>
        <div className="h-8 w-28 rounded-full bg-brand-primary/5" />
      </div>

      <div className="mt-8 space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-8 w-8 flex-none rounded-full border-2 border-brand-primary/10" />
            <div className="h-4 w-32 rounded bg-brand-primary/5" />
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 border-t border-brand-primary/10 pt-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="h-5 w-24 rounded bg-brand-primary/10" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-24 rounded bg-brand-primary/5" />
              <div className="h-4 w-28 rounded bg-brand-primary/5" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-5 w-32 rounded bg-brand-primary/10" />
          <div className="h-4 w-full rounded bg-brand-primary/5" />
          <div className="h-4 w-2/3 rounded bg-brand-primary/5" />
        </div>
      </div>
    </div>
  );
}