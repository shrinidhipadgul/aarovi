export function PageSkeleton({
  count = 1,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 ${className ?? ""}`}>
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 rounded bg-brand-primary/10" />
        <div className="h-4 w-32 rounded bg-brand-primary/5" />
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="h-5 w-36 rounded bg-brand-primary/10" />
          {Array.from({ length: 3 }).map((_, j) => (
            <div
              key={j}
              className="h-4 w-full rounded bg-brand-primary/5"
              style={{ width: `${85 - j * 15}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({
  rows = 4,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-1 rounded-xl border border-brand-primary/10 ${className ?? ""}`}>
      {Array.from({ length: rows }).map((_, i) => (
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
  );
}

export function FormSkeleton({
  fields = 3,
  className,
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-5 ${className ?? ""}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1">
          <div className="h-4 w-20 rounded bg-brand-primary/5" />
          <div className="h-10 w-full rounded-lg bg-brand-primary/5" />
        </div>
      ))}
      <div className="h-10 w-32 rounded-lg bg-brand-primary/5" />
    </div>
  );
}