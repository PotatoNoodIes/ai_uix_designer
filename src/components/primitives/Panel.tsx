import React from "react";
import { cn } from "@/utils/cn";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
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
