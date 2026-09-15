import { Panel as FlowPanel } from "reactflow";
import { Panel, Button, IconButton, CloseIcon, Micro, Textarea } from "@/components/primitives";

interface AddScreenPanelProps {
  newScreenPrompt: string;
  setNewScreenPrompt: (v: string) => void;
  isGeneratingNewScreen: boolean;
  onClose: () => void;
  onGenerate: () => void;
}

export function AddScreenPanel({
  newScreenPrompt,
  setNewScreenPrompt,
  isGeneratingNewScreen,
  onClose,
  onGenerate,
}: AddScreenPanelProps) {
  return (
    <FlowPanel position="top-center" className="mt-4 md:mt-6 w-full px-4 md:px-0">
      <Panel
        variant="flush"
        className="p-4 md:p-6 w-full md:w-[400px] flex flex-col gap-4 animate-in slide-in-from-top-4"
      >
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-acid" aria-hidden="true" />
            <Micro>New screen</Micro>
          </div>
          <IconButton label="Cancel" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </header>

        <Textarea
          autoFocus
          value={newScreenPrompt}
          onChange={(e) => setNewScreenPrompt(e.target.value)}
          placeholder="e.g. a statistics page with line charts"
          className="h-24"
          aria-label="Describe the new screen"
        />

        <Button
          onClick={onGenerate}
          disabled={isGeneratingNewScreen || !newScreenPrompt.trim()}
          className="w-full py-3"
        >
          {isGeneratingNewScreen ? "Synthesizing…" : "Generate screen"}
        </Button>
      </Panel>
    </FlowPanel>
  );
}
