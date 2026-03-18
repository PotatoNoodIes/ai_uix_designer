import React, { useState } from "react";
import { SignIn } from "@clerk/clerk-react";

interface SignInNudgeProps {
  onDismiss: () => void;
}

export function SignInNudge({ onDismiss }: SignInNudgeProps) {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="brutal-panel w-full max-w-md p-8 flex flex-col gap-6 bg-black"
        style={{border: '2px solid var(--border)', boxShadow: '8px 8px 0 var(--border)'}}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="brutal-micro text-white">DEMO COMPLETE</span>
            <h2 className="brutal-display text-[32px] uppercase">
              ALL 2 PREVIEWS USED
            </h2>
            <p className="brutal-micro opacity-70">
              Sign in to unlock 5 designs and save your workspace across sessions.
            </p>
          </div>
          <button className="brutal-ghost p-2" onClick={onDismiss}>[X]</button>
        </div>

        {!showSignIn ? (
          <div className="flex flex-col gap-3">
            <button
              className="brutal-btn w-full bg-white border-white text-black"
              onClick={() => setShowSignIn(true)}
            >
              SIGN IN / REGISTER
            </button>
            <button
              className="brutal-ghost w-full border border-[var(--border)]"
              onClick={onDismiss}
            >
              LATER
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

      <div className="absolute inset-0 -z-10" onClick={onDismiss} />
    </div>
  );
}
