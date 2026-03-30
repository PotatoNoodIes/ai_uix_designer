import React from "react";
import { Background, BackgroundVariant } from "reactflow";

export function GridLayer({ theme }: { theme: "dark" | "light" }) {
  return (
    <Background
      variant={BackgroundVariant.Dots}
      gap={24}
      size={1}
      color={theme === "dark" ? "#1a2033" : "#d1d5db"}
    />
  );
}
