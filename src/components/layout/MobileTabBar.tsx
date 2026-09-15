import { UserButton } from "@clerk/clerk-react";
import type { UsageLimitResult } from "@/hooks/useUsageLimit";
import type { Project } from "@/types";
import { Logo } from "@/components/primitives";
import { cn } from "@/utils/cn";

interface MobileTabBarProps {
  mobilePanel: "chat" | "canvas";
  setMobilePanel: (v: "chat" | "canvas") => void;
  currentProject: Project | null;
  usage: UsageLimitResult;
}

export function MobileTabBar({
  mobilePanel,
  setMobilePanel,
  currentProject,
  usage,
}: MobileTabBarProps) {
  const tab = (id: "chat" | "canvas", label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mobilePanel === id}
      onClick={() => setMobilePanel(id)}
      className={cn(
        "px-5 py-3 brutal-micro transition-colors duration-fast border-b-2",
        mobilePanel === id ? "border-acid text-ink" : "border-transparent"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="md:hidden flex items-center border-b border-hairline bg-sunken shrink-0 z-tabbar">
      <div className="flex items-center px-4 py-3 flex-1 min-w-0">
        <Logo size="sm" />
      </div>
      <div role="tablist" aria-label="Panel" className="flex">
        {tab("chat", "Chat")}
        {tab(
          "canvas",
          `Canvas${currentProject ? ` (${currentProject.data.screens?.length || 0})` : ""}`
        )}
      </div>
      {usage.isSignedIn && (
        <div className="px-4">
          <UserButton afterSignOutUrl={window.location.href} />
        </div>
      )}
    </div>
  );
}
