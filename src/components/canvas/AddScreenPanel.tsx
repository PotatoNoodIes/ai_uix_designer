import React from "react";
import { Panel } from "reactflow";

interface AddScreenPanelProps {
  newScreenPrompt: string;
  setNewScreenPrompt: (v: string) => void;
  isGeneratingNewScreen: boolean;
  onClose: () => void;
  onGenerate: () => void;
}

export function AddScreenPanel({
  newScreenPrompt,
  setNewScreenPrompt,
  isGeneratingNewScreen,
  onClose,
  onGenerate,
}: AddScreenPanelProps) {
  return (
    <Panel position="top-center" className="mt-4 md:mt-6 w-full px-4 md:px-0">
      <div className="uix-add-panel p-4 md:p-6 w-full md:w-[400px] animate-in slide-in-from-top-4 duration-300" style={{boxShadow:'var(--shadow-panel)'}}>
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div style={{width:6,height:6,borderRadius:'50%',background:'var(--brand)'}} />
            <span className="uix-label">New Screen</span>
          </div>
          <button onClick={onClose} className="uix-icon-btn">✕</button>
        </header>
        <textarea
          autoFocus
          value={newScreenPrompt}
          onChange={(e) => setNewScreenPrompt(e.target.value)}
          placeholder="e.g. 'A premium statistics page with line charts'"
          className="uix-textarea w-full h-24 p-3 mb-4 text-xs"
        />
        <button
          onClick={onGenerate}
          disabled={isGeneratingNewScreen || !newScreenPrompt.trim()}
          className="uix-btn-send w-full py-3 text-xs font-display font-bold uppercase tracking-wide disabled:opacity-50"
          style={{borderRadius:'var(--r-sm)'}}
        >
          {isGeneratingNewScreen ? "Synthesizing..." : "Generate New Screen"}
        </button>
      </div>
    </Panel>
  );
}
