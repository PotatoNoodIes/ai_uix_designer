import type { AIProvider } from "@/types";
import { Modal, Button, Micro, Input, Segmented } from "@/components/primitives";

const GEMINI_MODELS = [
  { id: "gemini-3-flash-preview", label: "Gemini 3 Flash" },
  { id: "gemini-3-pro-preview", label: "Gemini 3 Pro" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
];

const OPENROUTER_MODELS = [
  { id: "x-ai/grok-2-vision", label: "Grok 2 Vision" },
  { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { id: "openai/gpt-4o", label: "GPT-4o" },
  { id: "deepseek/deepseek-r1", label: "DeepSeek R1" },
  { id: "glm-4-5-air", label: "GLM 4.5 Air (Free)" },
  { id: "custom", label: "Custom…" },
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
  const usingOwnKey = customApiKey.trim().length > 0;
  const models = selectedProvider === "openrouter" ? OPENROUTER_MODELS : GEMINI_MODELS;

  return (
    <Modal title="Model settings" onClose={onClose} className="max-w-[420px]">
      <div className="flex flex-col gap-6">
        <Segmented<AIProvider>
          label="Provider"
          value={selectedProvider}
          onChange={setSelectedProvider}
          options={[
            { value: "gemini", label: "Gemini" },
            { value: "openrouter", label: "OpenRouter" },
          ]}
        />

        <div className="flex flex-col gap-2">
          <Input
            label="Your API key"
            type="password"
            autoComplete="off"
            value={customApiKey}
            onChange={(e) => setCustomApiKey(e.target.value)}
            placeholder="Leave blank to use the built-in model"
          />
          <Micro as="p" className="normal-case tracking-normal font-sans leading-relaxed">
            {usingOwnKey
              ? "Requests go straight from this browser to the provider. The key is stored in this browser only."
              : "Generation runs on the built-in Gemini model, subject to your usage limit. Add a key to use your own quota and the OpenRouter models."}
          </Micro>
        </div>

        <div className="flex flex-col gap-2">
          <Micro as="label" {...({ htmlFor: "model-select" } as object)}>
            Model
          </Micro>
          <select
            id="model-select"
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="brutal-input"
          >
            {models.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          {selectedProvider === "openrouter" && !usingOwnKey && (
            <Micro as="p" className="normal-case tracking-normal font-sans text-ink">
              OpenRouter models need your own key.
            </Micro>
          )}
        </div>

        <Button onClick={onSave} className="w-full py-3">
          Save settings
        </Button>
      </div>
    </Modal>
  );
}
