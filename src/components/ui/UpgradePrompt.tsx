import { UserButton } from "@clerk/clerk-react";
import { Modal, Button, Micro } from "@/components/primitives";

interface UpgradePromptProps {
  onDismiss: () => void;
}

const PRO_FEATURES = [
  "Unlimited generated designs",
  "Priority generation queue",
  "Team workspaces and sharing",
  "Figma export (coming soon)",
];

export function UpgradePrompt({ onDismiss }: UpgradePromptProps) {
  return (
    <Modal title="Limit reached" onClose={onDismiss} className="max-w-md" emphasis>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="brutal-display">You've used all five designs</h2>
          <p className="text-subtle max-w-[46ch] leading-relaxed">
            Upgrade for unlimited designs, a priority queue, and shared team
            workspaces.
          </p>
        </div>

        <ul className="flex flex-col gap-2 p-4 border border-hairline bg-sunken">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3">
              <span className="text-acid font-mono" aria-hidden="true">
                »
              </span>
              <Micro>{f}</Micro>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3">
          <Button
            className="w-full"
            onClick={() => {
              // No billing flow exists yet; this previously fired a bare
              // window.alert().
              window.open("mailto:hello@example.com?subject=UIX Agent Pro", "_blank");
            }}
          >
            Upgrade to Pro
          </Button>
          <Button
            variant="ghost"
            className="w-full border border-hairline py-2"
            onClick={onDismiss}
          >
            Not now
          </Button>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-hairline">
          <UserButton afterSignOutUrl={window.location.href} />
          <Micro>Signed in</Micro>
        </div>
      </div>
    </Modal>
  );
}
