import { useState } from "react";
import type { Notification } from "@/types";

export function useUIState() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [mobilePanel, setMobilePanel] = useState<"chat" | "canvas">("chat");
  const [showNudge, setShowNudge] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const showSuccess = (message: string) => {
    setNotification({ message, type: "success" });
    setTimeout(() => setNotification(null), 4000);
  };

  const showError = (message: string) => {
    setNotification({ message, type: "error" });
    setTimeout(() => setNotification(null), 5000);
  };

  return {
    isHistoryOpen, setIsHistoryOpen,
    isSettingsOpen, setIsSettingsOpen,
    notification,
    mobilePanel, setMobilePanel,
    showNudge, setShowNudge,
    showUpgrade, setShowUpgrade,
    showSuccess,
    showError,
  };
}
