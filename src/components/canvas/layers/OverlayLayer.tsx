import React from "react";
import { ZoomControls } from "@/components/canvas/ZoomControls";
import { AddScreenPanel } from "@/components/canvas/AddScreenPanel";

interface OverlayLayerProps {
  isAddingScreen: boolean;
  isGenerating: boolean;
  newScreenPrompt: string;
  setNewScreenPrompt: (v: string) => void;
  isGeneratingNewScreen: boolean;
  onCloseAddScreen: () => void;
  onGenerateNewScreen: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: (opts?: any) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function OverlayLayer({
  isAddingScreen,
  isGenerating,
  newScreenPrompt,
  setNewScreenPrompt,
  isGeneratingNewScreen,
  onCloseAddScreen,
  onGenerateNewScreen,
  zoomIn,
  zoomOut,
  fitView,
  undo,
  redo,
  canUndo,
  canRedo,
}: OverlayLayerProps) {
  return (
    <>
      {isAddingScreen && (
        <AddScreenPanel
          newScreenPrompt={newScreenPrompt}
          setNewScreenPrompt={setNewScreenPrompt}
          isGeneratingNewScreen={isGeneratingNewScreen}
          onClose={onCloseAddScreen}
          onGenerate={onGenerateNewScreen}
        />
      )}

      <ZoomControls
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        fitView={fitView}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {isGenerating && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-50 pointer-events-none">
          <div className="uix-spinner" />
          <p
            className="font-display font-700 text-base"
            style={{ color: "var(--text-primary)", letterSpacing: "0.06em", textTransform: "uppercase" }}
          >
            Synthesizing…
          </p>
        </div>
      )}
    </>
  );
}
