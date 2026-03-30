import React from "react";
import type { Project } from "@/types";

interface HistoryModalProps {
  projects: Project[];
  currentProject: Project | null;
  onClose: () => void;
  onSelectProject: (p: Project) => void;
}

export function HistoryModal({ projects, currentProject, onClose, onSelectProject }: HistoryModalProps) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-8 modal-backdrop animate-in fade-in">
      <div className="uix-modal w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        <header className="px-5 md:px-7 py-5 border-b flex items-center justify-between" style={{borderColor:'var(--panel-border)'}}>
          <div>
            <h3 className="font-display font-800 text-base" style={{color:'var(--text-primary)'}}>Workspace History</h3>
            <p className="uix-label" style={{marginTop:2}}>Select a previous project</p>
          </div>
          <button onClick={onClose} className="uix-icon-btn">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {projects.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <p className="uix-label" style={{opacity:0.3}}>No UIX history found</p>
            </div>
          ) : (
            projects.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectProject(p)}
                className={`uix-project-card p-5 flex flex-col gap-2.5 ${currentProject?.id === p.id ? "active" : ""}`}
              >
                <span className="uix-label" style={{color:'var(--brand)'}}>{p.data.architecture || "Web/App"}</span>
                <h4 className="font-display font-700 text-sm truncate" style={{color:'var(--text-primary)'}}>{p.name}</h4>
                <div className="flex items-center justify-between w-full">
                  <span className="uix-micro">{new Date(p.timestamp).toLocaleDateString()}</span>
                  <span className="uix-micro">{new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
