import React from "react";
import type { ChatMessage } from "@/services/geminiService";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { Panel, Button, Micro } from "@/components/primitives";
import { cn } from "@/utils/cn";

const STARTERS = [
  "Fintech dashboard with analytics",
  "Mobile food delivery onboarding flow",
  "SaaS admin panel with dark mode",
];

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
          <div
            className="flex flex-col flex-1 overflow-y-auto chat-scroll p-4 gap-4 border border-hairline bg-surface"
            role="log"
            aria-label="Conversation"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col gap-1",
                  msg.role === "user" ? "items-start" : "items-end"
                )}
              >
                <Micro className="px-2">{msg.role === "user" ? "You" : "UIX"}</Micro>
                <div
                  className={cn(
                    "max-w-[90%] leading-relaxed",
                    msg.role === "user" ? "brutal-bubble-user" : "brutal-bubble-ai"
                  )}
                >
                  <MarkdownContent content={msg.content} />
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}

        <Panel
          variant="flush"
          className="p-3 md:p-4 flex flex-col gap-3 md:gap-4 shrink-0"
        >
          <div className="flex items-center justify-between gap-2 border-b border-hairline pb-3">
            <Micro className="truncate max-w-[160px]">
              {selectedModelId === "custom" ? customModelId : selectedModelId}
            </Micro>
            <div role="group" aria-label="Target platform" className="flex gap-2">
              <Button
                variant="ghost"
                active={architecture === "web"}
                aria-pressed={architecture === "web"}
                onClick={() => setArchitecture("web")}
              >
                Web
              </Button>
              <Button
                variant="ghost"
                active={architecture === "app"}
                aria-pressed={architecture === "app"}
                onClick={() => setArchitecture("app")}
              >
                App
              </Button>
            </div>
          </div>

          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {STARTERS.map((p) => (
                <Button
                  key={p}
                  variant="ghost"
                  className="border border-hairline px-2 py-1.5 text-left"
                  onClick={() => setInput(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <label
              className="brutal-btn flex items-center justify-center p-2.5 md:p-3 shrink-0 cursor-pointer"
              title="Attach a reference image or HTML file"
            >
              +
              <input
                type="file"
                className="sr-only"
                accept="image/*,.html"
                multiple
                onChange={handleFileReferenceChange}
              />
              <span className="sr-only">Attach a reference file</span>
            </label>

            <div className="flex-1 relative">
              <textarea
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="Describe the product you want to design"
                aria-label="Describe the product you want to design"
                className="brutal-input min-h-[48px] md:min-h-[56px] pr-[70px] md:pr-[100px]"
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !input.trim() || isAiBusy}
                className="absolute right-2 bottom-2 top-2 w-[56px] md:w-[80px] !p-0"
              >
                {isGenerating ? "…" : "Run"}
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
