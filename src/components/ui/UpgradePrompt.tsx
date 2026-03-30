import React from "react";
import { UserButton } from "@clerk/clerk-react";

interface UpgradePromptProps {
  onDismiss: () => void;
}

export function UpgradePrompt({ onDismiss }: UpgradePromptProps) {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="brutal-panel w-full max-w-md p-8 flex flex-col gap-6 bg-black"
        style={{border: '2px solid var(--border)', boxShadow: '8px 8px 0 var(--lime)'}}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="brutal-micro text-lime">LIMIT REACHED</span>
            <h2 className="brutal-display text-[32px] uppercase">
              ALL 5 DESIGNS USED
            </h2>
            <p className="brutal-micro opacity-70">
              Upgrade for unlimited designs, priority queue, and team workspaces.
            </p>
          </div>
          <button className="brutal-ghost p-2" onClick={onDismiss}>[X]</button>
        </div>

        <ul className="flex flex-col gap-2 p-4 border border-[var(--border)] bg-[#050505]">
          {[
            "Unlimited AI-generated designs",
            "Priority generation queue",
            "Team workspaces & sharing",
            "Export to Figma (coming soon)",
          ].map((f) => (
            <li key={f} className="flex items-center gap-3">
              <span className="text-lime font-mono">»</span>
              <span className="brutal-micro">{f}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 mt-2">
          <button
            className="brutal-btn w-full bg-lime border-lime text-black"
            onClick={() => {
              alert("Upgrade flow coming soon!");
            }}
          >
            UPGRADE TO PRO
          </button>
          <button
            className="brutal-ghost w-full border border-[var(--border)]"
            onClick={onDismiss}
          >
            LATER
          </button>
        </div>

        <div
          className="flex items-center gap-3 pt-4 border-t border-[var(--border)]"
        >
          <UserButton afterSignOutUrl={window.location.href} />
          <span className="brutal-micro opacity-50">
            PRO ACCOUNT ENGINES ENABLED
          </span>
        </div>
      </div>

      <div className="absolute inset-0 -z-10" onClick={onDismiss} />
    </div>
  );
}
