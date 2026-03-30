import React from "react";
import { Panel } from "reactflow";

interface ZoomControlsProps {
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: (opts?: any) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function ZoomControls({ zoomIn, zoomOut, fitView, undo, redo, canUndo, canRedo }: ZoomControlsProps) {
  return (
    <Panel position="bottom-right" className="mb-4 mr-4 md:mb-8 md:mr-8 z-[3000]">
      <div className="flex flex-col gap-2">
        <div className="brutal-panel flex flex-col bg-black overflow-hidden pt-2" style={{border:'1px solid var(--border)'}}>
          <button onClick={() => zoomIn()} className="brutal-ghost border-b border-[var(--border)] p-2 md:p-3 hover:bg-white hover:text-black" title="Zoom In">+</button>
          <button onClick={() => zoomOut()} className="brutal-ghost border-b border-[var(--border)] p-2 md:p-3 hover:bg-white hover:text-black" title="Zoom Out">-</button>
          <button onClick={() => fitView({ padding: 0.2, duration: 800 })} className="brutal-ghost p-2 md:p-3 text-[10px] hover:bg-white hover:text-black" title="Fit">FIT</button>
        </div>
        <div className="brutal-panel flex flex-col bg-black mt-2 overflow-hidden" style={{border:'1px solid var(--border)'}}>
          <button onClick={undo} disabled={!canUndo} className="brutal-ghost border-b border-[var(--border)] p-2 md:p-3 disabled:opacity-30 hover:bg-white hover:text-black" title="Undo">{"<"}</button>
          <button onClick={redo} disabled={!canRedo} className="brutal-ghost p-2 md:p-3 disabled:opacity-30 hover:bg-white hover:text-black" title="Redo">{">"}</button>
        </div>
      </div>
    </Panel>
  );
}
