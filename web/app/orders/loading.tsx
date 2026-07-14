export default function OrdersLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-36 rounded bg-brand-primary/10" />
        <div className="h-4 w-24 rounded bg-brand-primary/5" />
      </div>

      <div className="space-y-1 rounded-xl border border-brand-primary/10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 sm:gap-6"
          >
            <div className="h-16 w-14 flex-none rounded-lg bg-brand-primary/5 sm:h-20 sm:w-16" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-brand-primary/10" />
              <div className="h-3 w-32 rounded bg-brand-primary/5" />
              <div className="h-3 w-16 rounded bg-brand-primary/5" />
            </div>
            <div className="flex-none text-right">
              <div className="h-4 w-16 rounded bg-brand-primary/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}