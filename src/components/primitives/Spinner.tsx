import { cn } from "@/utils/cn";

/**
 * Loading indicator. The markup previously asked for a spinner class
 * that was removed with the old stylesheet, so loading states rendered blank.
 */
export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("brutal-spinner", className)}
    />
  );
}
