import React from "react";
import { NodeProps, NodeToolbar, Position } from "reactflow";
import { getFullHtml } from "@/utils/htmlUtils";
import { BREAKPOINT_WIDTHS, BREAKPOINT_HEIGHTS } from "@/constants/appConstants";
import { triggerDownload } from "@/utils/download";
import type { ScreenNodeData } from "@/types";
import { Panel, Button, IconButton, CloseIcon, Micro, Textarea } from "@/components/primitives";
import { cn } from "@/utils/cn";

const FRAME_CLASS = {
  mobile: "screen-frame-mobile",
  tablet: "screen-frame-tablet",
  desktop: "screen-frame-desktop",
} as const;

export const ScreenNode = ({ data, selected }: NodeProps<ScreenNodeData>) => {
  const width = BREAKPOINT_WIDTHS[data.currentBreakpoint];
  const height = BREAKPOINT_HEIGHTS[data.currentBreakpoint];

  const handleExportSingle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const htmlContent = getFullHtml(data.markup, data.designSystem);
    const url = URL.createObjectURL(new Blob([htmlContent], { type: "text/html" }));
    triggerDownload(url, `${data.name.toLowerCase().replace(/\s+/g, "_")}.html`);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-6 transition-transform duration-300",
        selected ? "scale-[1.02] z-overlay" : "z-canvas",
        data.justCreated && "animate-pulse"
      )}
    >
      <NodeToolbar isVisible={selected} position={Position.Top} offset={15} className="z-panel">
        <Panel
          variant="flush"
          className="flex flex-col gap-3 p-4 w-[320px] animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-acid" aria-hidden="true" />
              <Micro>Refine screen</Micro>
            </div>
            <IconButton
              label="Close refinement panel"
              onClick={(e) => {
                e.stopPropagation();
                data.onDeselect();
              }}
            >
              <CloseIcon size={12} />
            </IconButton>
          </div>

          <div className="flex gap-2 items-stretch">
            <Textarea
              value={data.modifyInput}
              onChange={(e) => data.onModifyInputChange(e.target.value)}
              placeholder="e.g. add a line chart for heart rate"
              className="h-16"
              aria-label={`Describe a change to ${data.name}`}
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                data.onHandleModify();
              }}
              disabled={data.isModifying || !data.modifyInput.trim() || data.isAiBusy}
              className="px-4 shrink-0 self-stretch text-micro"
            >
              {data.isModifying ? "…" : "Apply"}
            </Button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-hairline">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                active={data.isLive}
                onClick={(e) => {
                  e.stopPropagation();
                  data.onToggleLive(data.id);
                }}
                aria-pressed={data.isLive}
                className="flex items-center gap-1.5"
              >
                <span
                  className={cn("w-1.5 h-1.5", data.isLive ? "bg-acid" : "bg-subtle")}
                  aria-hidden="true"
                />
                {data.isLive ? "Live" : "Static"}
              </Button>
              <Button
                variant="ghost"
                onClick={handleExportSingle}
                className="flex items-center gap-1.5"
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="square" strokeWidth={2} d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4" />
                </svg>
                Export
              </Button>
            </div>
            <IconButton
              label={`Delete ${data.name}`}
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete(data.id);
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="square" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
              </svg>
            </IconButton>
          </div>
        </Panel>
      </NodeToolbar>

      <div
        className={cn(
          "flex items-start justify-between gap-4 px-5 py-4 mb-3 border bg-sunken",
          selected ? "border-acid" : "border-hairline",
          data.locked && "opacity-70"
        )}
      >
        <div className="flex flex-col gap-1 pointer-events-none min-w-0">
          <span className="font-display font-extrabold text-lead leading-none tracking-tight text-ink truncate">
            {data.name}
          </span>
          <Micro className="truncate max-w-[280px]">{data.purpose}</Micro>
        </div>
        <span
          className={cn(
            "mt-0.5 shrink-0 transition-colors duration-fast",
            selected ? "text-acid" : "text-subtle"
          )}
          aria-hidden="true"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </span>
      </div>

      <div
        className={cn(
          "relative overflow-hidden transition-all duration-500 ease-in-out bg-canvas",
          FRAME_CLASS[data.currentBreakpoint],
          // .brutal-node-selected was defined in the stylesheet but never
          // applied; selection previously used a colour token that no longer
          // resolved, so selecting a screen had no visible effect at all.
          selected && "brutal-node-selected"
        )}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          minHeight: `${height}px`,
        }}
      >
        <iframe
          srcDoc={getFullHtml(data.markup, data.designSystem)}
          className={cn("w-full border-none", data.isLive ? "pointer-events-auto" : "pointer-events-none")}
          style={{ width: `${width}px`, height: `${height}px`, display: "block" }}
          title={data.name}
          sandbox="allow-scripts allow-same-origin"
        />
        {!data.isLive && <div className="absolute inset-0 bg-transparent z-20 cursor-default" />}
      </div>
    </div>
  );
};

export const nodeTypes = { screen: ScreenNode };
