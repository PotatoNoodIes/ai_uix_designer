import React from "react";
import { cn } from "@/utils/cn";

type Variant = "solid" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;

  active?: boolean;
}

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
