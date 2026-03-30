import React from "react";
import type { AIProvider } from "@/types";

const MODEL_OPTIONS = [
  { id: "gemini-3-flash-preview", label: "Gemini 3 Flash" },
  { id: "gemini-3-pro-preview", label: "Gemini 3 Pro" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "x-ai/grok-2-vision", label: "Grok 2 Vision" },
  { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { id: "openai/gpt-4o", label: "GPT-4o" },
  { id: "deepseek/deepseek-r1", label: "DeepSeek R1" },
  { id: "glm-4-5-air", label: "GLM 4.5 Air (Free)" },
  { id: "custom", label: "Custom..." },
];

interface SettingsModalProps {
  selectedProvider: AIProvider;
  setSelectedProvider: (v: AIProvider) => void;
  selectedModelId: string;
  setSelectedModelId: (v: string) => void;
  customApiKey: string;
  setCustomApiKey: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function SettingsModal({
  selectedProvider,
  setSelectedProvider,
  selectedModelId,
  setSelectedModelId,
  customApiKey,
  setCustomApiKey,
  onClose,
  onSave,
}: SettingsModalProps) {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 modal-backdrop animate-in fade-in">
      <div className="uix-modal w-full max-w-[420px] flex flex-col overflow-hidden animate-in zoom-in-95">
        <header className="px-6 py-5 border-b flex items-center justify-between" style={{borderColor:'var(--panel-border)'}}>
          <div className="flex items-center gap-2.5">
            <div style={{width:8,height:8,borderRadius:'50%',background:'var(--brand)'}} />
            <h3 className="font-display font-700 text-sm" style={{color:'var(--text-primary)'}}>Model Settings</h3>
          </div>
          <button onClick={onClose} className="uix-icon-btn">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="uix-label">AI Provider</label>
            <div className="uix-segment">
              <button onClick={() => setSelectedProvider("gemini")} className={`uix-segment-btn ${selectedProvider === "gemini" ? "active" : ""}`}>Gemini</button>
              <button onClick={() => setSelectedProvider("openrouter")} className={`uix-segment-btn ${selectedProvider === "openrouter" ? "active" : ""}`}>OpenRouter</button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="uix-label">API Key</label>
            <input type="password" value={customApiKey} onChange={(e) => setCustomApiKey(e.target.value)} placeholder="sk-..." className="settings-input" />
            <p className="uix-micro" style={{marginTop:4}}>Stored locally. Leave blank to use built-in Gemini.</p>
          </div>
          <div className="space-y-2">
            <label className="uix-label">Model</label>
            <select value={selectedModelId} onChange={(e) => setSelectedModelId(e.target.value)} className="settings-select">
              {MODEL_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button onClick={onSave} className="uix-btn-brand w-full py-3 text-sm" style={{borderRadius:'var(--r-sm)'}}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}
