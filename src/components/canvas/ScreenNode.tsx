import React from "react";
import { NodeProps, NodeToolbar, Position } from "reactflow";
import { getFullHtml } from "@/utils/htmlUtils";
import { BREAKPOINT_WIDTHS, BREAKPOINT_HEIGHTS } from "@/constants/appConstants";
import { triggerDownload } from "@/utils/download";
import type { ScreenNodeData } from "@/types";

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
      className={`flex flex-col gap-6 transition-all duration-300 ${
        selected ? "scale-[1.02] z-[1000]" : "opacity-100 z-10"
      } ${data.justCreated ? "ring-8 ring-indigo-500/30 animate-pulse" : ""}
  ${selected ? "scale-[1.02]" : ""}`}
    >
      <NodeToolbar isVisible={selected} position={Position.Top} offset={15} className="z-[2000]">
        <div className="uix-node-toolbar flex flex-col gap-3 p-4 w-[320px] animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div style={{width:6,height:6,borderRadius:'50%',background:'var(--brand)'}} />
              <span className="uix-label">Contextual Refinement</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); data.onDeselect(); }} className="uix-icon-btn">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2 items-stretch">
            <textarea
              value={data.modifyInput}
              onChange={(e) => data.onModifyInputChange(e.target.value)}
              placeholder="e.g. 'Add a line chart for heart rate'"
              className="uix-textarea flex-1 p-3 text-xs h-16 resize-none"
            />
            <button
              onClick={(e) => { e.stopPropagation(); data.onHandleModify(); }}
              disabled={data.isModifying || !data.modifyInput.trim() || data.isAiBusy}
              className="uix-btn-send flex items-center justify-center px-4 shrink-0" style={{borderRadius:'var(--r-sm)'}}
            >
              <span className="font-display font-700 text-[10px] uppercase">{data.isModifying ? "..." : "Apply"}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2" style={{borderTop:'1px solid var(--panel-border)'}}>
            <div className="flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); data.onToggleLive(data.id); }}
                className={`px-2.5 py-1 text-[8px] font-display font-700 uppercase tracking-widest rounded flex items-center gap-1.5 transition-all border ${
                  data.isLive ? "bg-brand-600 border-transparent text-white" : "border-transparent text-slate-500"
                }`}
                style={data.isLive ? {background:'var(--brand)',borderColor:'var(--brand)'} : {background:'rgba(255,255,255,0.04)',borderColor:'var(--panel-border)'}}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${data.isLive ? "bg-green-400 animate-pulse" : "bg-slate-500"}`} />
                {data.isLive ? "Live" : "Static"}
              </button>
              <button onClick={handleExportSingle} className="px-2.5 py-1 text-[8px] font-display font-700 uppercase tracking-widest rounded flex items-center gap-1.5 uix-btn-ghost">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export
              </button>
            </div>
            <button onClick={(e) => { e.stopPropagation(); data.onDelete(data.id); }} className="uix-icon-btn" style={{color:'var(--text-muted)'}} title="Delete Screen">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </NodeToolbar>

      <div className={`uix-node-header flex items-start justify-between px-5 py-4 mb-3 group/header shadow-lg ${data.locked ? "opacity-70" : ""}`}>
        <div className="flex flex-col gap-1 pointer-events-none">
          <span className="font-display font-800 text-[18px] leading-none tracking-tight" style={{color:'var(--text-primary)'}}>{data.name}</span>
          <span className="uix-micro truncate max-w-[280px]" style={{opacity:0.6}}>{data.purpose}</span>
        </div>
        <div className={`uix-icon-btn transition-all mt-0.5 ${selected ? "" : "opacity-0 group-hover/header:opacity-100"}`} style={selected ? {background:'var(--brand)',color:'#fff',borderColor:'transparent'} : {}}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </div>
      </div>

      <div
        className={`relative transition-all duration-500 ease-in-out ${
          data.currentBreakpoint === "mobile" ? "screen-frame-mobile" :
          data.currentBreakpoint === "tablet" ? "screen-frame-tablet" : "screen-frame-desktop"
        } ${
          selected
            ? data.currentBreakpoint === "mobile" ? "screen-frame-selected-mobile" :
              data.currentBreakpoint === "tablet" ? "screen-frame-selected-tablet" : "screen-frame-selected-desktop"
            : ""
        }`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          minHeight: `${height}px`,
          borderStyle: 'solid',
          borderColor: selected ? 'var(--brand)' : 'rgba(255,255,255,0.08)',
          background: '#0c101a',
          overflow: 'hidden',
        }}
      >
        <iframe
          srcDoc={getFullHtml(data.markup, data.designSystem)}
          className={`w-full border-none pointer-events-none ${data.isLive ? "pointer-events-auto" : ""}`}
          style={{ width: `${width}px`, height: `${height}px`, display: 'block' }}
          title={data.name}
          sandbox="allow-scripts allow-same-origin"
        />
        {!data.isLive && <div className="absolute inset-0 bg-transparent z-20 cursor-default" />}
      </div>
    </div>
  );
};

export const nodeTypes = { screen: ScreenNode };
