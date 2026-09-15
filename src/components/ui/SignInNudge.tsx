import { useState } from "react";
import { SignIn } from "@clerk/clerk-react";
import { Modal, Button, Micro, clerkAppearance } from "@/components/primitives";

interface SignInNudgeProps {
  onDismiss: () => void;
}

export function SignInNudge({ onDismiss }: SignInNudgeProps) {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <Modal title="Demo complete" onClose={onDismiss} className="max-w-md">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="brutal-display">You've used both previews</h2>
          <p className="text-subtle max-w-[46ch] leading-relaxed">
            Sign in to get five designs and keep your workspace between visits.
          </p>
        </div>

        {!showSignIn ? (
          <div className="flex flex-col gap-3">
            <Button className="w-full" onClick={() => setShowSignIn(true)}>
              Sign in or register
            </Button>
            <Button
              variant="ghost"
              className="w-full border border-hairline py-2"
              onClick={onDismiss}
            >
              Not now
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            {/* Previously rendered with no appearance prop, so a default
                light-mode Clerk card appeared inside this dark dialog. */}
            <SignIn
              routing="hash"
              afterSignInUrl={window.location.href}
              afterSignUpUrl={window.location.href}
              appearance={clerkAppearance}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
