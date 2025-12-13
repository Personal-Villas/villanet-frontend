export function ListingGridSkeleton({ count = 12 }: { count?: number }) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="border rounded-xl overflow-hidden">
            <div className="h-44 bg-muted animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }