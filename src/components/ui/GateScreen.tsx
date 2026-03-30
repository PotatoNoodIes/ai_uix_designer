import React, { useState } from "react";
import { SignIn } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

interface GateScreenProps {
  onDemoGranted: () => void;
}

type DemoState = "idle" | "checking" | "blocked";

async function checkDemoAccess(): Promise<{ allowed: boolean }> {
  try {
    const res = await fetch("/uix/api/demo-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("non-2xx");
    return await res.json();
  } catch {
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
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-black noise text-white">
      <div className="flex flex-col justify-center p-8 md:p-16 gap-12 flex-1 border-b md:border-b-0 md:border-r border-[var(--border)] relative">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-lime flex items-center justify-center p-0.5" style={{boxShadow: '2px 2px 0 var(--border)'}}>
            <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="brutal-display text-[24px]">UIX</div>
        </div>

        <div className="w-full max-w-md mx-auto pt-8">
          <SignIn
            routing="hash"
            afterSignInUrl={window.location.href}
            afterSignUpUrl={window.location.href}
            appearance={{
              baseTheme: dark,
              variables: {
                colorBackground: "#050505",
                colorInputBackground: "#000000",
                colorText: "#FFFFFF",
                colorTextSecondary: "#888888",
                colorPrimary: "#d4ff00",
                colorNeutral: "#FFFFFF",
                borderRadius: "0px",
                fontFamily: "'Inter', sans-serif",
                colorInputText: "#FFFFFF",
              },
              elements: {
                card: {
                  boxShadow: "4px 4px 0 #333333",
                  border: "2px solid #333333",
                  background: "#0a0a0a",
                  padding: "32px",
                },
                headerTitle: { 
                  display: "none" 
                },
                headerSubtitle: { 
                  display: "none" 
                },
                socialButtonsBlockButton: {
                  border: "2px solid #333333",
                  borderRadius: "0px",
                  boxShadow: "2px 2px 0 #333333",
                },
                formButtonPrimary: {
                  border: "2px solid #d4ff00",
                  borderRadius: "0px",
                  boxShadow: "4px 4px 0 #d4ff00",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  color: "#000",
                },
                formFieldInput: {
                  border: "2px solid #333333",
                  borderRadius: "0px",
                }
              },
            }}
          />
        </div>
      </div>

      <div className="flex flex-col justify-center items-start p-8 md:p-16 gap-8 w-full md:w-[480px] bg-[#050505] flex-shrink-0 relative">
        <div className="absolute top-0 right-0 p-8 grid grid-cols-4 grid-rows-4 w-32 h-32 opacity-20 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(var(--border) 2px, transparent 2px)',
          backgroundSize: '16px 16px'
        }} />

        <div className="flex flex-col gap-4 w-full relative z-10">
          <span className="brutal-micro text-lime">NO ACCOUNT?</span>
          <h1 className="brutal-display text-[48px] uppercase leading-none">
            ENTER<br/>THE VOID
          </h1>
          <p className="brutal-micro opacity-60 mt-4 leading-relaxed max-w-[280px]">
            Execute temporary designs directly on the canvas. No sign-up required — limits apply.
          </p>
        </div>

        {demoState === "blocked" ? (
          <div className="brutal-panel p-6 w-full flex flex-col gap-3 bg-black" style={{border: '2px solid red', boxShadow: '4px 4px 0 red'}}>
            <span className="brutal-micro text-white">ACCESS DENIED</span>
            <p className="brutal-micro opacity-70">
              Maximum demo sessions reached for this IP. Authentication required to proceed.
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-6 relative z-10 mt-8">
            <button
              className="brutal-btn w-full bg-white text-black border-white flex justify-center py-4"
              onClick={handleTryDemo}
              disabled={demoState === "checking"}
            >
              {demoState === "checking" ? "[ CHECKING. . . ]" : "[ INITIATE DEMO ]"}
            </button>

            <ul className="flex flex-col gap-3 border-t border-[var(--border)] pt-6">
              {[
                "Instant canvas access",
                "2 generated previews / cycle",
                "Transient session storage",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="text-lime font-mono">»</span>
                  <span className="brutal-micro opacity-50">{item.toUpperCase()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
