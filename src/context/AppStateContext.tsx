import React, { createContext, useContext } from "react";
import { useUIState } from "@/hooks/useUIState";
import { useAISettings } from "@/hooks/useAISettings";
import { useCanvasState } from "@/hooks/useCanvasState";
import { useUsageLimit } from "@/hooks/useUsageLimit";

export type AppState = {
  ui: ReturnType<typeof useUIState>;
  settings: ReturnType<typeof useAISettings>;
  canvas: ReturnType<typeof useCanvasState>;
  usage: ReturnType<typeof useUsageLimit>;

  saveSettings: () => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const ui = useUIState();
  const settings = useAISettings();
  const usage = useUsageLimit();

  const canvas = useCanvasState({
    showSuccess: ui.showSuccess,
    showError: ui.showError,
    setMobilePanel: ui.setMobilePanel,
    setShowNudge: ui.setShowNudge,
    setShowUpgrade: ui.setShowUpgrade,
    selectedProvider: settings.selectedProvider,
    selectedModelId: settings.selectedModelId,
    customModelId: settings.customModelId,
    customApiKey: settings.customApiKey,
    architecture: settings.architecture,
    productTheme: settings.productTheme,
    usage,
  });

  const saveSettings = () => {
    settings.persistSettings();
    ui.setIsSettingsOpen(false);
  };

  return (
    <AppStateContext.Provider value={{ ui, settings, canvas, usage, saveSettings }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
