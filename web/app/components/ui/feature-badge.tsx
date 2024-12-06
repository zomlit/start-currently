import { cn } from "@/lib/utils";

interface FeatureBadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "pink" | "green";
  className?: string;
}

export function FeatureBadge({
  children,
  variant = "blue",
  className,
}: FeatureBadgeProps) {
  const colors = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950",
      text: "text-blue-500",
      stroke: "text-blue-200 dark:text-blue-900",
    },
    pink: {
      bg: "bg-pink-50 dark:bg-pink-950",
      text: "text-pink-500",
      stroke: "text-pink-200 dark:text-pink-900",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-950",
      text: "text-green-500",
      stroke: "text-green-200 dark:text-green-900",
    },
  };

  return (
    <span
      className={cn(
        "relative inline-flex",
        "px-[0.1875rem] text-[0.625rem]/[0.875rem] font-medium",
        "mr-[0.1875rem]",
        colors[variant].bg,
        colors[variant].text,
        className
      )}
    >
      {children}
      {/* Top border */}
      <span
        className={cn(
          "absolute inset-x-[-0.1875rem] -top-px block transform-gpu",
          colors[variant].stroke
        )}
      >
        <svg
          width="100%"
          height="1"
          stroke="currentColor"
          strokeDasharray="3.3 1"
          aria-hidden="true"
        >
          <line x1="0" y1="0.5" x2="100%" y2="0.5" />
        </svg>
      </span>
      {/* Bottom border */}
      <span
        className={cn(
          "absolute inset-x-[-0.1875rem] -bottom-px block transform-gpu",
          colors[variant].stroke
        )}
      >
        <svg
          width="100%"
          height="1"
          stroke="currentColor"
          strokeDasharray="3.3 1"
          aria-hidden="true"
        >
          <line x1="0" y1="0.5" x2="100%" y2="0.5" />
        </svg>
      </span>
      {/* Left border */}
      <span
        className={cn(
          "absolute inset-y-[-0.1875rem] -left-px block transform-gpu",
          colors[variant].stroke
        )}
      >
        <svg
          width="1"
          height="100%"
          stroke="currentColor"
          strokeDasharray="3.3 1"
          aria-hidden="true"
        >
          <line x1="0.5" y1="0" x2="0.5" y2="100%" />
        </svg>
      </span>
      {/* Right border */}
      <span
        className={cn(
          "absolute inset-y-[-0.1875rem] -right-px block transform-gpu",
          colors[variant].stroke
        )}
      >
        <svg
          width="1"
          height="100%"
          stroke="currentColor"
          strokeDasharray="3.3 1"
          aria-hidden="true"
        >
          <line x1="0.5" y1="0" x2="0.5" y2="100%" />
        </svg>
      </span>
    </span>
  );
}
