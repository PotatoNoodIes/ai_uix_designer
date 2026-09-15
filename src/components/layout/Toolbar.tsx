import React from "react";
import type { UsageLimitResult } from "@/hooks/useUsageLimit";
import type { Project } from "@/types";
import { Panel, Button, Micro } from "@/components/primitives";
import { cn } from "@/utils/cn";

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
  usage,
  onNew,
  onOpenHistory,
  onOpenSettings,
  onImportHistory,
  onExportHistory,
  onShowUpgrade,
  onShowNudge,
}: ToolbarProps) {
  const handleUsageClick = () => {
    if (!usage.isAtLimit) return;
    if (usage.isSignedIn) onShowUpgrade();
    else onShowNudge();
  };

  return (
    <Panel
      variant="flush"
      className={cn("flex flex-col gap-3", compact ? "p-3" : "p-4")}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={onNew}>
          New
        </Button>
        <Button variant="ghost" onClick={onOpenHistory}>
          History
        </Button>
        <Button variant="ghost" onClick={onOpenSettings}>
          Settings
        </Button>
        <label className="brutal-ghost cursor-pointer" tabIndex={0}>
          Import
          <input
            type="file"
            className="sr-only"
            accept=".json"
            onChange={onImportHistory}
          />
        </label>
        <Button variant="ghost" onClick={onExportHistory}>
          Export
        </Button>
      </div>

      <div
        className={cn(
          "border-t border-hairline flex items-center justify-between gap-2",
          compact ? "pt-2" : "mt-2 pt-3"
        )}
      >
        <Micro>{usage.isSignedIn ? "Pro" : "Demo"}</Micro>
        {usage.isAtLimit ? (
          <Button variant="ghost" className="text-acid !p-0" onClick={handleUsageClick}>
            {usage.isSignedIn ? "Upgrade" : "Sign in"}
          </Button>
        ) : (
          <Micro className="text-acid">{usage.usageLabel}</Micro>
        )}
      </div>
    </Panel>
  );
}
