import { useState, useEffect } from "react";
import type { AIProvider } from "@/types";

export function useAISettings() {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("gemini");
  const [selectedModelId, setSelectedModelId] = useState("gemini-3-flash-preview");
  const [customModelId, setCustomModelId] = useState("custom-model-id");
  const [customApiKey, setCustomApiKey] = useState("");
  const [architecture, setArchitecture] = useState<"web" | "app">("web");
  const [appTheme, setAppTheme] = useState<"light" | "dark">("dark");
  const [productTheme, setProductTheme] = useState<"light" | "dark">("light");


  useEffect(() => {
    const savedTheme = localStorage.getItem("stitch_app_theme");
    const savedProvider = localStorage.getItem("uix_provider");
    const savedModelId = localStorage.getItem("uix_model_id");
    const savedApiKey = localStorage.getItem("uix_api_key");
    if (savedTheme) setAppTheme(savedTheme as "light" | "dark");
    if (savedProvider) setSelectedProvider(savedProvider as AIProvider);
    if (savedModelId) setSelectedModelId(savedModelId);
    if (savedApiKey) setCustomApiKey(savedApiKey);
  }, []);


  useEffect(() => {
    localStorage.setItem("stitch_app_theme", appTheme);
  }, [appTheme]);


  const persistSettings = () => {
    localStorage.setItem("uix_provider", selectedProvider);
    localStorage.setItem("uix_model_id", selectedModelId);
    localStorage.setItem("uix_api_key", customApiKey);
  };

  return {
    selectedProvider, setSelectedProvider,
    selectedModelId, setSelectedModelId,
    customModelId, setCustomModelId,
    customApiKey, setCustomApiKey,
    architecture, setArchitecture,
    appTheme, setAppTheme,
    productTheme, setProductTheme,
    persistSettings,
  };
}
