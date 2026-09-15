import React from "react";
import { cn } from "@/utils/cn";

/** Small monospace label. Replaces ~18 hand-written `brutal-micro` strings. */
export function Micro({
  className,
  as: Tag = "span",
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: "span" | "div" | "p" | "label" }) {
  return <Tag className={cn("brutal-micro", className)} {...props} />;
}
