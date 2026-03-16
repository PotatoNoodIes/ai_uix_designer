import React, { useState } from "react";
import { SignIn } from "@clerk/clerk-react";

interface SignInNudgeProps {
  onDismiss: () => void;
}

export function SignInNudge({ onDismiss }: SignInNudgeProps) {
  const [showSignIn, setShowSignIn] = useState(false);

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
                  background: "var(--accent)",
                }}
              />
              <span className="uix-label" style={{ color: "var(--accent)" }}>
                Free previews used
              </span>
            </div>
            <h2
              className="font-display font-800 text-xl leading-snug"
              style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
            >
              {"You've used your 2 free previews"}
            </h2>
            <p
              className="uix-micro mt-2"
              style={{ lineHeight: 1.65, opacity: 0.7 }}
            >
              Sign in to unlock 5 designs and save your workspace across
              sessions.
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

        {/* CTA or Clerk SignIn */}
        {!showSignIn ? (
          <div className="flex flex-col gap-3">
            <button
              className="uix-btn-brand w-full py-3 text-sm font-display font-700"
              style={{ borderRadius: "var(--r-sm)" }}
              onClick={() => setShowSignIn(true)}
            >
              Sign in / Create account
            </button>
            <button
              className="uix-btn-ghost w-full py-2.5 text-xs"
              style={{ borderRadius: "var(--r-sm)" }}
              onClick={onDismiss}
            >
              Maybe later
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <SignIn
              routing="hash"
              afterSignInUrl={window.location.href}
              afterSignUpUrl={window.location.href}
            />
          </div>
        )}
      </div>

      {/* backdrop click to dismiss */}
      <div className="absolute inset-0 -z-10" onClick={onDismiss} />
    </div>
  );
}
