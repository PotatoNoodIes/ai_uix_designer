import React, { useState } from "react";
import { SignIn } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

interface GateScreenProps {
  onDemoGranted: () => void;
}

type DemoState = "idle" | "checking" | "blocked";

async function checkDemoAccess(): Promise<{ allowed: boolean }> {
  try {
    const res = await fetch("/api/demo-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("non-2xx");
    return await res.json();
  } catch {
    // Fail open during local dev — Vite doesn't serve /api routes
    return { allowed: true };
  }
}

export function GateScreen({ onDemoGranted }: GateScreenProps) {
  const [demoState, setDemoState] = useState<DemoState>("idle");

  const handleTryDemo = async () => {
    setDemoState("checking");
    const { allowed } = await checkDemoAccess();
    if (allowed) {
      onDemoGranted();
    } else {
      setDemoState("blocked");
    }
  };

  return (
    <div
      className="h-screen w-full flex overflow-hidden"
      style={{ background: "var(--canvas-bg)" }}
    >
      {/* Subtle radial glow */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "40%",
          left: "35%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,91,219,0.09) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* ─── Left column: branding + Clerk SignIn ─────────────────────── */}
      <div
        className="flex flex-col justify-center items-center p-12 gap-8 flex-1"
        style={{ minWidth: 0 }}
      >
        {/* Logo + wordmark */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <div
            className="uix-icon-badge"
            style={{ width: 48, height: 48, borderRadius: "var(--r-md)" }}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div
            className="uix-wordmark"
            style={{ fontSize: 22, letterSpacing: "-0.025em" }}
          >
            UIX <span>Agent</span>
          </div>
        </div>

        {/* Clerk SignIn — always visible, dark-themed */}
        <SignIn
          routing="hash"
          afterSignInUrl={window.location.href}
          afterSignUpUrl={window.location.href}
          appearance={{
            baseTheme: dark,
            variables: {
              colorBackground: "#0e1117",
              colorInputBackground: "#131722",
              colorText: "#f0f4ff",
              colorTextSecondary: "#8892aa",
              colorPrimary: "#3B5BDB",
              colorNeutral: "#8892aa",
              borderRadius: "8px",
              fontFamily: "'Outfit', 'DM Sans', sans-serif",
            },
            elements: {
              card: {
                boxShadow: "0 0 0 1px rgba(255,255,255,0.07)",
                background: "transparent",
              },
              headerTitle: {
                display: "none",
              },
              headerSubtitle: {
                display: "none",
              },
              socialButtonsBlockButton: {
                border: "1px solid rgba(255,255,255,0.09)",
              },
            },
          }}
        />
      </div>

      {/* ─── Right column: demo CTA ───────────────────────────────────── */}
      <div
        className="flex flex-col justify-center items-center p-12 gap-6"
        style={{
          width: 320,
          borderLeft: "1px solid var(--panel-border)",
          background: "rgba(255,255,255,0.015)",
          flexShrink: 0,
        }}
      >
        <div className="flex flex-col gap-2 text-center">
          <span
            className="font-display font-700 text-lg"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Just browsing?
          </span>
          <p
            className="uix-micro"
            style={{ lineHeight: 1.65, opacity: 0.55, maxWidth: 220 }}
          >
            Try the app without an account. No sign-up required — 2 free
            previews per day.
          </p>
        </div>

        {demoState === "blocked" ? (
          <div
            className="w-full rounded-xl p-4 flex flex-col gap-1.5 text-center"
            style={{
              background: "rgba(249,115,22,0.08)",
              border: "1px solid rgba(249,115,22,0.25)",
            }}
          >
            <span
              className="font-display font-700 text-sm"
              style={{ color: "var(--accent)" }}
            >
              Demo limit reached
            </span>
            <p
              className="uix-micro"
              style={{ opacity: 0.75, lineHeight: 1.6 }}
            >
              You&apos;ve used 2 free demo sessions from this device today.
              Sign in to continue — it&apos;s free.
            </p>
          </div>
        ) : (
          <>
            <button
              className="uix-btn-ghost w-full py-3 font-display font-700 text-sm flex items-center justify-center gap-2"
              style={{ borderRadius: "var(--r-sm)" }}
              onClick={handleTryDemo}
              disabled={demoState === "checking"}
            >
              {demoState === "checking" ? (
                <>
                  <div
                    className="uix-spinner"
                    style={{ width: 14, height: 14, borderWidth: 2 }}
                  />
                  Checking…
                </>
              ) : (
                "Try Demo →"
              )}
            </button>

            <ul className="flex flex-col gap-2 w-full">
              {[
                "No account needed",
                "2 free previews / day",
                "All AI features unlocked",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <svg
                    className="w-3 h-3 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ color: "var(--brand)", opacity: 0.7 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="uix-micro" style={{ opacity: 0.55 }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
