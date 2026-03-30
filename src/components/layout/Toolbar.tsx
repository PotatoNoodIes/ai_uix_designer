import React from "react";
import { UserButton } from "@clerk/clerk-react";
import type { UsageLimitResult } from "@/hooks/useUsageLimit";
import type { Project } from "@/types";

interface ToolbarProps {
  compact?: boolean;
  currentProject: Project | null;
  usage: UsageLimitResult;
  onNew: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onImportHistory: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportHistory: () => void;
  onShowUpgrade: () => void;
  onShowNudge: () => void;
}

export function Toolbar({
  compact = false,
  currentProject,
  usage,
  onNew,
  onOpenHistory,
  onOpenSettings,
  onImportHistory,
  onExportHistory,
  onShowUpgrade,
  onShowNudge,
}: ToolbarProps) {
  const btnClass = compact ? "brutal-ghost text-xs" : "brutal-ghost";
  const panelPadding = compact ? "p-3" : "p-4";
  const borderTopClass = compact ? "pt-2" : "mt-2 pt-3";

  const handleUsageClick = () => {
    if (usage.isAtLimit) {
      if (usage.isSignedIn) onShowUpgrade();
      else onShowNudge();
    }
  };

  return (
    <div className={`brutal-panel ${panelPadding} flex flex-col gap-3`} style={{border:'1px solid var(--border)',background:'var(--bg)'}}>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={onNew} className={btnClass} title="New Workspace">[NEW]</button>
        <button onClick={onOpenHistory} className={btnClass} title="History">[HST]</button>
        <button onClick={onOpenSettings} className={btnClass} title="Settings">[CFG]</button>
        <label className={`${btnClass} cursor-pointer`} title="Import History">
          [IMP]
          <input type="file" className="hidden" accept=".json" onChange={onImportHistory} />
        </label>
        <button onClick={onExportHistory} className={btnClass} title="Export History">[EXP]</button>
      </div>
      <div className={`${borderTopClass} border-t flex items-center justify-between`} style={{borderColor:'var(--border)'}}>
        <span className="brutal-micro">{usage.isSignedIn ? 'PRO' : 'DEMO'}</span>
        <button
          className="brutal-ghost"
          style={{color:'var(--lime)',padding:0}}
          onClick={handleUsageClick}
        >
          {usage.isAtLimit ? (usage.isSignedIn ? 'UPGRADE' : 'SIGN IN') : usage.usageLabel}
        </button>
      </div>
    </div>
  );
}
