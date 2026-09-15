import { cn } from "@/utils/cn";

/**
 * The UIX lockup. Was duplicated verbatim in GateScreen, Canvas and
 * MobileTabBar, with the stroke weight drifting between copies.
 */
export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "w-7 h-7" : "w-8 h-8";
  const glyph = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(box, "bg-acid flex items-center justify-center p-0.5")}
        style={{ boxShadow: "2px 2px 0 var(--hairline)" }}
      >
        <svg
          className={cn(glyph, "text-canvas")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div className="brutal-display text-title">UIX</div>
    </div>
  );
}
