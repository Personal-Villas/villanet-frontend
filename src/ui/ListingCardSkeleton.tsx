// Nota: los keyframes shimmer son inyectados por Properties.tsx via <style>
// Estructura replica exactamente PropertyCard.tsx

export function ListingCardSkeleton() {
  return (
    <div
      className="border border-border rounded-lg overflow-hidden bg-card mt-10"
      role="status"
      aria-label="Loading property..."
      aria-busy="true"
    >
      {/* Imagen — mismo aspect-[4/3] que PropertyCard, bg-muted como base */}
      <div className="relative aspect-[4/3] bg-muted">
        <div className="skeleton-shimmer absolute inset-0" />
      </div>

      {/* Info — mismo p-4 que PropertyCard */}
      <div className="p-4">

        {/* Título + ubicación — mismo mb-2, space-y-1 */}
        <div className="mb-2 space-y-1">
          <div className="skeleton-shimmer h-[26px] w-2/3 rounded" />
          <div className="skeleton-shimmer h-[16px] w-1/2 rounded" />
        </div>

        {/* Métricas BR / BA — mismo mb-3 pb-3 border-b */}
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
          <div className="skeleton-shimmer h-4 w-10 rounded" />
          <div className="skeleton-shimmer h-4 w-10 rounded" />
        </div>

        {/* Villa Net Verified — mismo mb-4 text-xs */}
        <div className="mb-4">
          <div className="skeleton-shimmer h-[14px] w-32 rounded" />
        </div>

        {/* Botones — mismo flex flex-col gap-2 */}
        <div className="flex flex-col gap-2">
          <div className="skeleton-shimmer h-9 w-full rounded-md" />
          <div className="flex gap-2">
            <div className="skeleton-shimmer h-9 flex-1 rounded-md" />
            <div className="skeleton-shimmer h-9 flex-1 rounded-md" />
          </div>
        </div>

      </div>
    </div>
  );
}