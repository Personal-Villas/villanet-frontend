export function ListingGridSkeleton({
  count = 12,
  variant = 'grid',
}: {
  count?: number;
  variant?: 'grid' | 'card';
}) {
  const Card = () => (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted animate-pulse">
        {/* Top badges placeholders (mismo lugar que tu card real) */}
        <div className="absolute top-3 left-3 right-3 flex justify-between gap-2">
          <div className="h-6 w-28 rounded-full bg-muted/80 border border-border" />
          <div className="h-6 w-12 rounded-full bg-muted/80 border border-border" />
        </div>

        {/* Counter placeholder */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 h-5 w-16 rounded-full bg-muted/80" />
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="h-5 w-2/3 bg-muted animate-pulse rounded" />
        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />

        <div className="pt-2 border-t border-border" />

        <div className="flex gap-3">
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>

        {/* Trust row */}
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />

        {/* Buttons row (3 botones como tu card real) */}
        <div className="flex gap-2 pt-1">
          <div className="h-9 flex-1 bg-muted animate-pulse rounded-md" />
          <div className="h-9 w-28 bg-muted animate-pulse rounded-md" />
          <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );

  // ✅ “card”: unitario (para slots)
  if (variant === 'card') return <Card />;

  // ✅ “grid”: para estado skeleton completo (12 cards)
  return (
    <div className="pt-10 md:pt-[260px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Card />
        </div>
      ))}
    </div>
  );
}