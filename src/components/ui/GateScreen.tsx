import { useState } from "react";
import { SignIn } from "@clerk/clerk-react";
import { Panel, Button, Micro, Logo, clerkAppearance } from "@/components/primitives";

interface GateScreenProps {
  onDemoGranted: () => void;
}

type DemoState = "idle" | "checking" | "blocked";

const DEMO_INCLUDES = [
  "Instant canvas access",
  "Two generated previews",
  "Saved in this browser only",
];

async function checkDemoAccess(): Promise<{ allowed: boolean }> {
  try {
    const res = await fetch("/uix/api/demo-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("non-2xx");
    return await res.json();
  } catch {
    // The gate only unlocks the UI; /generate enforces the real limit.
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
    <div className="min-h-screen w-full flex flex-col md:flex-row overflow-y-auto bg-canvas text-ink">
      <div className="flex flex-col justify-center p-8 md:p-16 gap-12 flex-1 border-b md:border-b-0 md:border-r border-hairline relative">
        <Logo className="absolute top-8 left-8" />

        <div className="w-full max-w-md mx-auto pt-8">
          <SignIn
            routing="hash"
            afterSignInUrl={window.location.href}
            afterSignUpUrl={window.location.href}
            appearance={clerkAppearance}
          />
        </div>
      </div>

      <div className="flex flex-col justify-center items-start p-8 md:p-16 gap-8 w-full md:w-[480px] bg-sunken shrink-0 relative">
        <div className="flex flex-col gap-4 w-full">
          <h1 className="brutal-display">Try it without an account</h1>
          <p className="text-subtle leading-relaxed max-w-[34ch]">
            Generate designs straight on the canvas. Nothing to set up, and
            nothing saved to an account until you sign in.
          </p>
        </div>

        {demoState === "blocked" ? (
          <Panel variant="flush" className="p-6 w-full flex flex-col gap-3 border-ink">
            <Micro className="text-ink">Demo unavailable</Micro>
            <p className="text-subtle leading-relaxed">
              This network has used its demo previews. Sign in to keep going —
              you'll get five designs and a workspace that persists.
            </p>
          </Panel>
        ) : (
          <div className="w-full flex flex-col gap-6">
            <Button
              className="w-full flex justify-center py-4"
              onClick={handleTryDemo}
              disabled={demoState === "checking"}
            >
              {demoState === "checking" ? "Checking…" : "Start the demo"}
            </Button>

            <ul className="flex flex-col gap-3 border-t border-hairline pt-6">
              {DEMO_INCLUDES.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="text-acid font-mono" aria-hidden="true">
                    »
                  </span>
                  <Micro>{item}</Micro>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
