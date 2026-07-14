export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-8 w-40 rounded bg-brand-primary/10" />
      <div className="mt-8 space-y-8">
        <div className="rounded-xl border border-brand-primary/10 p-6">
          <div className="h-5 w-28 rounded bg-brand-primary/10" />
          <div className="mt-6 space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-3 w-12 rounded bg-brand-primary/5" />
                  <div className="h-4 w-32 rounded bg-brand-primary/5" />
                </div>
                <div className="h-7 w-14 rounded bg-brand-primary/5" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-brand-primary/10 p-6">
          <div className="h-5 w-36 rounded bg-brand-primary/10" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-28 rounded bg-brand-primary/5" />
                  <div className="h-3 w-48 rounded bg-brand-primary/5" />
                  <div className="h-3 w-36 rounded bg-brand-primary/5" />
                </div>
                <div className="h-7 w-14 rounded bg-brand-primary/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}