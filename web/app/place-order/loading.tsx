export default function PlaceOrderLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-8 w-40 rounded bg-brand-primary/10" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-5 w-36 rounded bg-brand-primary/10" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-4 w-20 rounded bg-brand-primary/5" />
                  <div className="h-10 w-full rounded-lg bg-brand-primary/5" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-5 w-32 rounded bg-brand-primary/10" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-16 rounded-lg bg-brand-primary/5" />
              <div className="h-16 rounded-lg bg-brand-primary/5" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-5 w-32 rounded bg-brand-primary/10" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-16 w-14 flex-none rounded-lg bg-brand-primary/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-brand-primary/5" />
                  <div className="h-3 w-20 rounded bg-brand-primary/5" />
                </div>
                <div className="h-4 w-16 rounded bg-brand-primary/5" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="h-48 rounded-xl bg-brand-primary/5" />
        </div>
      </div>
    </div>
  );
}