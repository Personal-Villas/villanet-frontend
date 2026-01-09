import { ShoppingCart } from "lucide-react";

interface CartButtonProps {
  count?: number;
  onClick?: () => void;
  className?: string;
  showLabel?: boolean;
  variant?: "default" | "compact" | "icon-only";
}

export default function CartButton({
  count = 0,
  onClick,
  className = "",
  showLabel = true,
  variant = "default",
}: CartButtonProps) {
  const hasItems = count > 0;
  
  const baseStyles = "inline-flex items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  
  const variants = {
    default: "gap-2 px-3 py-2 text-sm border border-input rounded-md bg-background hover:bg-muted",
    compact: "gap-1.5 px-2.5 py-1.5 text-sm border border-input rounded-md bg-background hover:bg-muted",
    "icon-only": "p-2 border border-input rounded-lg bg-background hover:bg-muted",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      aria-label={hasItems ? `View quote with ${count} items` : "View quote"}
    >
      <div className="relative">
        <ShoppingCart className="w-4 h-4" />
        {hasItems && (
          <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[hsl(0,0%,6.7%)] text-white text-xs font-semibold">
            {count}
          </span>
        )}
      </div>
      
      {showLabel && variant !== "icon-only" && (
        <>
          <span>View quote</span>
          {variant === "default" && hasItems && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({count} {count === 1 ? 'item' : 'items'})
            </span>
          )}
        </>
      )}
    </button>
  );
}