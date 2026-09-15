import type { Project, Breakpoint } from "@/types";
import { Panel, Button, Micro } from "@/components/primitives";

interface CanvasNavProps {
  currentProject: Project | null;
  currentBreakpoint: Breakpoint;
  setCurrentBreakpoint: (v: Breakpoint) => void;
  setIsAddingScreen: (v: boolean) => void;
  setMobilePanel: (v: "chat" | "canvas") => void;
  handleSaveSnapshot: () => void;
  handleExportZip: () => void;
  isAiBusy: boolean;
}

const BREAKPOINTS: { value: Breakpoint; label: string }[] = [
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "mobile", label: "Mobile" },
];

export function CanvasNav({
  currentProject,
  currentBreakpoint,
  setCurrentBreakpoint,
  setIsAddingScreen,
  setMobilePanel,
  handleSaveSnapshot,
  handleExportZip,
  isAiBusy,
}: CanvasNavProps) {
  return (
    <nav
      aria-label="Canvas"
      className="absolute top-4 right-4 md:top-8 md:right-8 z-nav flex flex-col items-end gap-3 w-[180px] md:w-[260px]"
    >
      <Panel variant="flush" className="p-2 md:p-3 flex flex-col gap-2 md:gap-3 w-full">
        <div className="flex items-center justify-between gap-2 border-b border-hairline pb-2">
          <Micro>Workspace</Micro>
          <Micro className="text-ink text-right truncate pl-2 max-w-[80px]">
            {currentProject?.name || "Empty"}
          </Micro>
        </div>

        {currentProject && (
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => setIsAddingScreen(true)}
              className="w-full text-micro"
              disabled={isAiBusy}
            >
              Add screen
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleSaveSnapshot}
                className="flex-1 text-center"
                disabled={isAiBusy}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                onClick={handleExportZip}
                className="flex-1 text-center text-acid"
              >
                Export
              </Button>
            </div>
          </div>
        )}
      </Panel>

      <Panel variant="flush" className="p-2 w-full">
        <div role="group" aria-label="Preview size" className="flex gap-2">
          {BREAKPOINTS.map((bp) => (
            <Button
              key={bp.value}
              variant="ghost"
              active={currentBreakpoint === bp.value}
              aria-pressed={currentBreakpoint === bp.value}
              onClick={() => setCurrentBreakpoint(bp.value)}
              className="flex-1 text-center"
            >
              {bp.label}
            </Button>
          ))}
        </div>
      </Panel>

      <Button
        variant="ghost"
        className="md:hidden w-full border border-hairline py-2 text-acid"
        onClick={() => setMobilePanel("chat")}
      >
        Back to chat
      </Button>
    </nav>
  );
}
