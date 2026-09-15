import React from "react";
import { cn } from "@/utils/cn";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * "surface" sits on its own fill; "flush" keeps the canvas grid visible
   * behind it. Every previous call site applied .brutal-panel and then
   * overrode its background inline — this makes the choice explicit.
   */
  variant?: "surface" | "flush";
}

export function Panel({ variant = "surface", className, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        variant === "surface" ? "brutal-panel" : "brutal-panel-flush",
        className
      )}
      {...props}
    />
  );
}
