import React from "react";
import { cn } from "@/utils/cn";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: these buttons have no visible text. */
  label: string;
}

/**
 * Icon-only button. The label is mandatory because the previous markup relied
 * on `title` alone, leaving every icon control unnamed for screen readers.
 */
export function IconButton({ label, className, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "brutal-ghost flex items-center justify-center shrink-0",
        className
      )}
      {...props}
    />
  );
}

/** The close glyph, previously re-inlined as raw SVG in four places. */
export function CloseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
