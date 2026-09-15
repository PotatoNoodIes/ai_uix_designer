import { Background, BackgroundVariant } from "reactflow";

/**
 * Canvas grid. Previously drew 24px blue (#1a2033) dots — a leftover from the
 * abandoned palette — on top of the body's 40px grey graph paper, so two
 * mismatched grids were visible at once. Now it matches --grid-size and the
 * hairline colour, reinforcing the backdrop instead of fighting it.
 */
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
