import { Background, BackgroundVariant } from "reactflow";

const GRID_SIZE = 40;

export function GridLayer({ theme }: { theme: "dark" | "light" }) {
  return (
    <Background
      variant={BackgroundVariant.Dots}
      gap={GRID_SIZE}
      size={1}
      color={theme === "dark" ? "#2e2e2e" : "#d1d5db"}
    />
  );
}
