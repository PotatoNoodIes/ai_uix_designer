import { Panel as FlowPanel } from "reactflow";
import { Panel, IconButton } from "@/components/primitives";

interface ZoomControlsProps {
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: (opts?: any) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const BTN = "p-2 md:p-3 w-full";

export function ZoomControls({
  zoomIn,
  zoomOut,
  fitView,
  undo,
  redo,
  canUndo,
  canRedo,
}: ZoomControlsProps) {
  return (
    <FlowPanel position="bottom-right" className="mb-4 mr-4 md:mb-8 md:mr-8 z-nav">
      <div className="flex flex-col gap-4">
        <Panel variant="flush" className="flex flex-col overflow-hidden">
          <IconButton label="Zoom in" onClick={() => zoomIn()} className={`${BTN} border-b border-hairline`}>
            +
          </IconButton>
          <IconButton label="Zoom out" onClick={() => zoomOut()} className={`${BTN} border-b border-hairline`}>
            −
          </IconButton>
          <IconButton
            label="Fit to view"
            onClick={() => fitView({ padding: 0.2, duration: 800 })}
            className={BTN}
          >
            Fit
          </IconButton>
        </Panel>

        <Panel variant="flush" className="flex flex-col overflow-hidden">
          <IconButton
            label="Undo"
            onClick={undo}
            disabled={!canUndo}
            className={`${BTN} border-b border-hairline`}
          >
            ←
          </IconButton>
          <IconButton label="Redo" onClick={redo} disabled={!canRedo} className={BTN}>
            →
          </IconButton>
        </Panel>
      </div>
    </FlowPanel>
  );
}
