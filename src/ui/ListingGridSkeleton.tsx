// Estilos del shimmer — definidos una sola vez aquí, compartidos por todas las cards
const SHIMMER_STYLES = `
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .skeleton-shimmer { animation: none !important; }
  }
  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      #ebebeb 25%,
      #d6d6d6 50%,
      #ebebeb 75%
    );
    background-size: 800px 100%;
    animation: shimmer 1.5s infinite linear;
  }
  @media (prefers-color-scheme: dark) {
    .skeleton-shimmer {
      background: linear-gradient(
        90deg,
        #ebebeb 25%,
        #d6d6d6 50%,
        #ebebeb 75%
      );
      background-size: 800px 100%;
    }
  }
`;

function SkeletonCard() {
  return (
    <div
      className="border border-border rounded-lg overflow-hidden bg-card"
      role="status"
      aria-label="Loading property..."
      aria-busy="true"
    >
      {/* Image — aspect-ratio reserva el espacio para evitar reflow (CA3) */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="skeleton-shimmer absolute inset-0" />
      </div>

      <div className="p-4 space-y-3">
        <div className="skeleton-shimmer h-5 w-2/3 rounded" />
        <div className="skeleton-shimmer h-4 w-1/2 rounded" />

        <div className="flex gap-3 pt-1">
          <div className="skeleton-shimmer h-4 w-12 rounded" />
          <div className="skeleton-shimmer h-4 w-12 rounded" />
          <div className="skeleton-shimmer h-4 w-20 rounded" />
        </div>

        <div className="pt-2 border-t border-border" />

        <div className="skeleton-shimmer h-4 w-1/3 rounded" />

        <div className="flex gap-2 pt-1">
          <div className="skeleton-shimmer h-9 flex-1 rounded-md" />
          <div className="skeleton-shimmer h-9 w-24 rounded-md" />
          <div className="skeleton-shimmer h-9 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ListingGridSkeleton({
  count = 12,
  variant = 'grid',
  className,
}: {
  count?: number;
  variant?: 'grid' | 'card';
  className?: string;
}) {
  if (variant === 'card') {
    return (
      <>
        <style>{SHIMMER_STYLES}</style>
        <SkeletonCard />
      </>
    );
  }

  return (
    <>
      <style>{SHIMMER_STYLES}</style>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className ?? 'pt-10 md:pt-[260px]'}`}
        aria-label={`Loading ${count} properties...`}
        aria-busy="true"
      >
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </>
  );
}