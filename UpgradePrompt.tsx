import React from "react";
import { UserButton } from "@clerk/clerk-react";

interface UpgradePromptProps {
  onDismiss: () => void;
}

export function UpgradePrompt({ onDismiss }: UpgradePromptProps) {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center modal-backdrop animate-in fade-in">
      <div
        className="uix-modal w-full max-w-md p-8 flex flex-col gap-5 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--brand)",
                }}
              />
              <span className="uix-label" style={{ color: "var(--brand)" }}>
                All designs used
              </span>
            </div>
            <h2
              className="font-display font-800 text-xl leading-snug"
              style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
            >
              {"You've used all 5 free designs"}
            </h2>
            <p
              className="uix-micro mt-2"
              style={{ lineHeight: 1.65, opacity: 0.7 }}
            >
              Upgrade for unlimited designs, priority generation, and team
              workspaces.
            </p>
          </div>
          <button className="uix-icon-btn shrink-0" onClick={onDismiss}>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* feature list */}
        <ul className="flex flex-col gap-2">
          {[
            "Unlimited AI-generated designs",
            "Priority generation queue",
            "Team workspaces & sharing",
            "Export to Figma (coming soon)",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2.5">
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: "var(--brand)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="uix-micro">{f}</span>
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="flex flex-col gap-3 mt-1">
          <button
            className="uix-btn-brand w-full py-3 text-sm font-display font-700"
            style={{ borderRadius: "var(--r-sm)" }}
            onClick={() => {
              /* placeholder — wire up payment link here */
              alert("Upgrade flow coming soon!");
            }}
          >
            Upgrade to Pro →
          </button>
          <button
            className="uix-btn-ghost w-full py-2.5 text-xs"
            style={{ borderRadius: "var(--r-sm)" }}
            onClick={onDismiss}
          >
            Maybe later
          </button>
        </div>

        {/* account area */}
        <div
          className="flex items-center gap-3 pt-4"
          style={{ borderTop: "1px solid var(--panel-border)" }}
        >
          <UserButton afterSignOutUrl={window.location.href} />
          <span className="uix-micro" style={{ opacity: 0.5 }}>
            Signed in
          </span>
        </div>
      </div>

      {/* backdrop click to dismiss */}
      <div className="absolute inset-0 -z-10" onClick={onDismiss} />
    </div>
  );
}
