import React from "react";
import { cn } from "@/utils/cn";

type Variant = "solid" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Renders the ghost variant in its selected state. */
  active?: boolean;
}

/**
 * The two button treatments in the design: a solid block that displaces on
 * hover, and a quiet monospace ghost. Replaces ~20 copy-pasted
 * `className="brutal-ghost ..."` strings.
 */
export function Button({
  variant = "solid",
  active,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      data-active={active ? "true" : undefined}
      className={cn(variant === "solid" ? "brutal-btn" : "brutal-ghost", className)}
      {...props}
    />
  );
}
