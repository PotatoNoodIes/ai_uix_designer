import React from "react";
import type { ChatMessage } from "@/services/geminiService";
import type { Breakpoint } from "@/types";
import { MarkdownContent } from "@/components/ui/MarkdownContent";

interface ChatPanelProps {
  messages: ChatMessage[];
  chatEndRef: React.RefObject<HTMLDivElement>;
  input: string;
  setInput: (v: string) => void;
  isGenerating: boolean;
  isAiBusy: boolean;
  selectedModelId: string;
  customModelId: string;
  architecture: "web" | "app";
  setArchitecture: (v: "web" | "app") => void;
  handleGenerate: () => void;
  handleFileReferenceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ChatPanel({
  messages,
  chatEndRef,
  input,
  setInput,
  isGenerating,
  isAiBusy,
  selectedModelId,
  customModelId,
  architecture,
  setArchitecture,
  handleGenerate,
  handleFileReferenceChange,
}: ChatPanelProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-4 md:px-8 pb-4 md:pb-8 pt-4 justify-end">
      <div className="flex flex-col gap-4 w-full h-full justify-end">
        {messages.length > 0 && (
          <div className="brutal-panel flex flex-col flex-1 overflow-y-auto chat-scroll p-4 gap-4" style={{borderBottom:'none',boxShadow:'none'}}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col gap-1 ${msg.role === "user" ? "items-start" : "items-end"}`}>
                <span className="brutal-micro px-2">{msg.role === "user" ? "USER" : "SYS"}</span>
                <div className={`max-w-[90%] text-sm leading-relaxed ${msg.role === "user" ? "brutal-bubble-user" : "brutal-bubble-ai"}`}>
                  <MarkdownContent content={msg.content} />
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}

        <div className="brutal-panel p-3 md:p-4 flex flex-col gap-3 md:gap-4 bg-black shrink-0">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <span className="brutal-micro truncate max-w-[160px] text-[9px] md:text-[10px]">
              ENGINE: {selectedModelId === "custom" ? customModelId : selectedModelId}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setArchitecture("web")} className={`brutal-ghost ${architecture === "web" ? "text-lime" : ""}`}>WEB</button>
              <button onClick={() => setArchitecture("app")} className={`brutal-ghost ${architecture === "app" ? "text-lime" : ""}`}>APP</button>
            </div>
          </div>

          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {["Fintech dashboard with analytics", "Mobile food delivery onboarding flow", "SaaS admin panel with dark mode"].map((p) => (
                <button key={p} className="brutal-ghost border border-[var(--border)] px-2 py-1.5 text-left text-[10px]" onClick={() => setInput(p)}>{p}</button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <label className="brutal-btn flex items-center justify-center p-2.5 md:p-3 shrink-0 text-xs" style={{background:'var(--surface)',color:'var(--fg)'}}>
              [+]
              <input type="file" className="hidden" accept="image/*,.html" multiple onChange={handleFileReferenceChange} />
            </label>
            <div className="flex-1 relative">
              <textarea
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); }
                }}
                placeholder="EXECUTE VISION..."
                className="brutal-input w-full min-h-[48px] md:min-h-[56px] pr-[70px] md:pr-[100px] text-sm"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !input.trim() || isAiBusy}
                className="absolute right-2 bottom-2 top-2 w-[56px] md:w-[80px] brutal-btn bg-lime text-black border-lime text-xs md:text-sm"
              >
                {isGenerating ? "..." : "RUN"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
