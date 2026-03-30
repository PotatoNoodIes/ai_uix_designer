import React from "react";
import { UserButton } from "@clerk/clerk-react";
import type { UsageLimitResult } from "@/hooks/useUsageLimit";
import type { Project } from "@/types";

interface MobileTabBarProps {
  mobilePanel: "chat" | "canvas";
  setMobilePanel: (v: "chat" | "canvas") => void;
  currentProject: Project | null;
  usage: UsageLimitResult;
}

export function MobileTabBar({ mobilePanel, setMobilePanel, currentProject, usage }: MobileTabBarProps) {
  return (
    <div className="md:hidden flex items-center border-b border-[var(--border)] bg-[#050505] shrink-0 z-[5001]">
      <div className="flex items-center gap-2 px-4 py-3 flex-1">
        <div className="w-6 h-6 bg-lime flex items-center justify-center" style={{boxShadow:'2px 2px 0 var(--border)'}}>
          <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="brutal-display text-[18px]">UIX</span>
      </div>
      <div className="flex">
        <button
          onClick={() => setMobilePanel("chat")}
          className={`px-5 py-3 brutal-micro text-xs transition-all border-b-2 ${
            mobilePanel === "chat" ? "border-lime text-white" : "border-transparent text-[var(--text-muted)]"
          }`}
        >
          CHAT
        </button>
        <button
          onClick={() => setMobilePanel("canvas")}
          className={`px-5 py-3 brutal-micro text-xs transition-all border-b-2 ${
            mobilePanel === "canvas" ? "border-lime text-white" : "border-transparent text-[var(--text-muted)]"
          }`}
        >
          CANVAS {currentProject ? `(${currentProject.data.screens?.length || 0})` : ""}
        </button>
      </div>
      {usage.isSignedIn && (
        <div className="px-4">
          <UserButton afterSignOutUrl={window.location.href} />
        </div>
      )}
    </div>
  );
}
