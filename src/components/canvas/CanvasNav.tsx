import React from "react";
import type { Project, Breakpoint } from "@/types";

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
    <nav className="absolute top-4 right-4 md:top-8 md:right-8 z-[4000] flex flex-col items-end gap-3 w-[180px] md:w-[260px]">
      <div className="brutal-panel p-2 md:p-3 flex flex-col gap-2 md:gap-3 w-full" style={{border:'1px solid var(--border)',background:'var(--bg)'}}>
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span className="brutal-micro text-[8px] md:text-[10px]">WORKSPACE</span>
          <span className="brutal-micro text-white text-right truncate pl-2 max-w-[80px] text-[8px] md:text-[10px]">{currentProject?.name || "VOID"}</span>
        </div>
        {currentProject && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsAddingScreen(true)}
              className="brutal-btn w-full flex items-center justify-center text-[9px] md:text-xs"
              disabled={isAiBusy}
            >
              [+] SCREEN
            </button>
            <div className="flex gap-2">
              <button onClick={handleSaveSnapshot} className="brutal-ghost flex-1 text-center text-[9px] md:text-xs" disabled={isAiBusy}>SAVE</button>
              <button onClick={handleExportZip} className="brutal-ghost flex-1 text-center text-lime text-[9px] md:text-xs">EXPORT</button>
            </div>
          </div>
        )}
      </div>

      <div className="brutal-panel p-2 flex gap-2 w-full" style={{border:'1px solid var(--border)',background:'var(--bg)'}}>
        <button onClick={() => setCurrentBreakpoint("desktop")} className={`brutal-ghost flex-1 text-center text-[9px] md:text-[10px] ${currentBreakpoint === "desktop" ? "text-lime bg-white !text-black" : ""}`}>DSK</button>
        <button onClick={() => setCurrentBreakpoint("tablet")} className={`brutal-ghost flex-1 text-center text-[9px] md:text-[10px] ${currentBreakpoint === "tablet" ? "text-lime bg-white !text-black" : ""}`}>TAB</button>
        <button onClick={() => setCurrentBreakpoint("mobile")} className={`brutal-ghost flex-1 text-center text-[9px] md:text-[10px] ${currentBreakpoint === "mobile" ? "text-lime bg-white !text-black" : ""}`}>MOB</button>
      </div>

      <button
        className="md:hidden brutal-btn w-full text-[9px]"
        style={{background:'var(--bg)',color:'var(--lime)',borderColor:'var(--border)'}}
        onClick={() => setMobilePanel("chat")}
      >
        ← BACK TO CHAT
      </button>
    </nav>
  );
}
