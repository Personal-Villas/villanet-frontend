export function ListingCardSkeleton() {
    return (
      <div className="group border border-border rounded-lg overflow-hidden bg-card">
        <div className="relative aspect-[4/3] bg-muted animate-pulse" />
  
        <div className="p-4 space-y-3">
          <div className="h-5 w-2/3 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
  
          <div className="flex gap-3 pt-2">
            <div className="h-4 w-12 bg-muted animate-pulse rounded" />
            <div className="h-4 w-12 bg-muted animate-pulse rounded" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          </div>
  
          <div className="pt-3 border-t border-border" />
  
          <div className="flex gap-2">
            <div className="h-9 flex-1 bg-muted animate-pulse rounded-md" />
            <div className="h-9 w-28 bg-muted animate-pulse rounded-md" />
            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
          </div>
        </div>
      </div>
    );
  }
  