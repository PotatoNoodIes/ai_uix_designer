import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  NodeProps,
  NodeToolbar,
  Position,
  BackgroundVariant,
} from "reactflow";
import JSZip from "jszip";
import { marked } from "marked";
import {
  generateProductArtifacts,
  refinePrompt,
  modifyScreen,
  generateNewScreen,
  ReferenceAsset,
  ChatMessage,
} from "./services/geminiService";
import { UserButton } from "@clerk/clerk-react";
import { useAuth } from "@clerk/clerk-react";
import { useUsageLimit } from "./useUsageLimit";
import { SignInNudge } from "./SignInNudge";
import { UpgradePrompt } from "./UpgradePrompt";
import { GateScreen } from "./GateScreen";

interface Project {
  id: string;
  name: string;
  timestamp: number;
  data: any;
  themePreference: "light" | "dark";
  chatHistory: ChatMessage[];
}

type Breakpoint = "mobile" | "tablet" | "desktop";
type AIProvider = "gemini" | "openrouter";

interface Notification {
  message: string;
  type: "success" | "error";
}

const BREAKPOINT_WIDTHS: Record<Breakpoint, number> = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
};

const BREAKPOINT_HEIGHTS: Record<Breakpoint, number> = {
  mobile: 812,
  tablet: 1024,
  desktop: 800,
};

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

const getFullHtml = (markup: string, design: any) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=${
    design.font.replace(/\s+/g, "+") || "Inter"
  }:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${design.colors.primary};
      --secondary: ${design.colors.secondary};
      --accent: ${design.colors.accent};
      --background: ${design.colors.background};
      --foreground: ${design.colors.text};
      --card: ${design.colors.surface};
      --muted: ${design.colors.muted || "#64748b"};
      --muted-foreground: ${design.colors.muted || "#94a3b8"};
      --border: ${design.colors.border || design.colors.surface};
      --radius: ${design.radius || "1rem"};
    }
    body { 
      background: var(--background); 
      color: var(--foreground); 
      font-family: '${design.font}', sans-serif; 
      margin: 0; 
      padding: 0; 
      min-height: 100vh; 
      width: 100%;
    }
    #root { width: 100%; min-height: 100vh; }
    ::-webkit-scrollbar { display: none; }
    .scrollbar-none::-webkit-scrollbar { display: none; }
    iconify-icon { vertical-align: middle; }
  </style>
</head>
<body class="scrollbar-none overflow-x-hidden">
  <div id="root">${markup || ""}</div>
</body>
</html>`.trim();
};

const MarkdownContent = ({ content }: { content: string }) => {
  const html = marked.parse(content);
  return (
    <div
      className="markdown-content text-[13px] leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const ScreenNode = ({ data, selected }: NodeProps) => {
  const width = BREAKPOINT_WIDTHS[data.currentBreakpoint as Breakpoint];
  const height = BREAKPOINT_HEIGHTS[data.currentBreakpoint as Breakpoint];

  const handleExportSingle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const htmlContent = getFullHtml(data.markup, data.designSystem);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.name.toLowerCase().replace(/\s+/g, "_")}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`flex flex-col gap-6 transition-all duration-300 ${
        selected ? "scale-[1.02] z-[1000]" : "opacity-100 z-10"
      } ${data.justCreated ? "ring-8 ring-indigo-500/30 animate-pulse" : ""}
  ${selected ? "scale-[1.02]" : ""}`}
    >
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        offset={15}
        className="z-[2000]"
      >
        <div className="uix-node-toolbar flex flex-col gap-3 p-4 w-[320px] animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div style={{width:6,height:6,borderRadius:'50%',background:'var(--brand)'}} />
              <span className="uix-label">Contextual Refinement</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); data.onDeselect(); }}
              className="uix-icon-btn"
            >
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
                  data.isLive
                    ? "bg-brand-600 border-transparent text-white" 
                    : "border-transparent text-slate-500"
                }`}
                style={data.isLive ? {background:'var(--brand)',borderColor:'var(--brand)'} : {background:'rgba(255,255,255,0.04)',borderColor:'var(--panel-border)'}}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${data.isLive ? "bg-green-400 animate-pulse" : "bg-slate-500"}`} />
                {data.isLive ? "Live" : "Static"}
              </button>
              <button
                onClick={handleExportSingle}
                className="px-2.5 py-1 text-[8px] font-display font-700 uppercase tracking-widest rounded flex items-center gap-1.5 uix-btn-ghost"
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export
              </button>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); data.onDelete(data.id); }}
              className="uix-icon-btn" style={{color:'var(--text-muted)'}} title="Delete Screen"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </NodeToolbar>

      <div className={`uix-node-header flex items-start justify-between px-5 py-4 mb-3 group/header shadow-lg ${
        data.locked ? "opacity-70" : ""
      }`}>
        <div className="flex flex-col gap-1 pointer-events-none">
          <span className="font-display font-800 text-[18px] leading-none tracking-tight" style={{color:'var(--text-primary)'}}>
            {data.name}
          </span>
          <span className="uix-micro truncate max-w-[280px]" style={{opacity:0.6}}>
            {data.purpose}
          </span>
        </div>
        <div className={`uix-icon-btn transition-all mt-0.5 ${
          selected ? "" : "opacity-0 group-hover/header:opacity-100"
        }`} style={selected ? {background:'var(--brand)',color:'#fff',borderColor:'transparent'} : {}}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </div>
      </div>

      <div
        className={`relative transition-all duration-500 ease-in-out ${
          data.currentBreakpoint === "mobile" ? "screen-frame-mobile" : 
          data.currentBreakpoint === "tablet" ? "screen-frame-tablet" : 
          "screen-frame-desktop"
        } ${
          selected
            ? data.currentBreakpoint === "mobile" ? "screen-frame-selected-mobile" :
              data.currentBreakpoint === "tablet" ? "screen-frame-selected-tablet" :
              "screen-frame-selected-desktop"
            : ""
        }`}
        style={{
          width: `${width}px`,
          minHeight: '100vh',
          height: 'auto',
          borderStyle: 'solid',
          borderColor: selected ? 'var(--brand)' : 'rgba(255,255,255,0.08)',
          background: '#0c101a',
          overflow: 'visible'
        }}
      >
        <iframe
          srcDoc={getFullHtml(data.markup, data.designSystem)}
          className={`w-full border-none pointer-events-none ${
            data.isLive ? "pointer-events-auto" : ""
          }`}
          style={{ minHeight: '100vh', height: 'auto', display: 'block' }}
          title={data.name}
          sandbox="allow-scripts allow-same-origin"
        />
        {!data.isLive && (
          <div className="absolute inset-0 bg-transparent z-20 cursor-default" />
        )}
      </div>
    </div>
  );
};

const nodeTypes = { screen: ScreenNode };

function Canvas() {
  const {
    fitView,
    getNodes,
    setNodes: rfSetNodes,
    zoomIn,
    zoomOut,
  } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const aiLockRef = useRef(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [past, setPast] = useState<Project[]>([]);
  const [future, setFuture] = useState<Project[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [input, setInput] = useState("");
  const [architecture, setArchitecture] = useState<"web" | "app">("web");
  const [appTheme, setAppTheme] = useState<"light" | "dark">("dark");
  const [productTheme, setProductTheme] = useState<"light" | "dark">("light");

  const [currentBreakpoint, setCurrentBreakpoint] =
    useState<Breakpoint>("desktop");
  const [referenceAssets, setReferenceAssets] = useState<ReferenceAsset[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [activeLiveScreens, setActiveLiveScreens] = useState<Set<string>>(
    new Set()
  );
  const [modifyInput, setModifyInput] = useState("");
  const [isModifying, setIsModifying] = useState(false);
  const [isAddingScreen, setIsAddingScreen] = useState(false);
  const [newScreenPrompt, setNewScreenPrompt] = useState("");
  const [isGeneratingNewScreen, setIsGeneratingNewScreen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const [selectedProvider, setSelectedProvider] =
    useState<AIProvider>("gemini");
  const [selectedModelId, setSelectedModelId] = useState(
    "gemini-3-flash-preview"
  );
  const [customModelId, setCustomModelId] = useState("custom-model-id");
  const [customApiKey, setCustomApiKey] = useState("");

  const didInitialLayout = useRef(false);
  const isAiBusy = isGenerating || isGeneratingNewScreen || isModifying;

  const [showNudge, setShowNudge] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const usage = useUsageLimit();

  useEffect(() => {
    const savedProjects = localStorage.getItem("stitch_v3_projects");
    const savedTheme = localStorage.getItem("stitch_app_theme");
    const savedProvider = localStorage.getItem("uix_provider");
    const savedModelId = localStorage.getItem("uix_model_id");
    const savedApiKey = localStorage.getItem("uix_api_key");

    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedTheme) setAppTheme(savedTheme as "light" | "dark");
    if (savedProvider) setSelectedProvider(savedProvider as AIProvider);
    if (savedModelId) setSelectedModelId(savedModelId);
    if (savedApiKey) setCustomApiKey(savedApiKey);
  }, []);

  const saveSettings = () => {
    localStorage.setItem("uix_provider", selectedProvider);
    localStorage.setItem("uix_model_id", selectedModelId);
    localStorage.setItem("uix_api_key", customApiKey);
    setIsSettingsOpen(false);
  };

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("stitch_v3_projects", JSON.stringify(projects));
    }
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("stitch_app_theme", appTheme);
  }, [appTheme]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const showSuccess = (message: string) => {
    setNotification({ message, type: "success" });
    setTimeout(() => setNotification(null), 4000);
  };

  const showError = (message: string) => {
    setNotification({ message, type: "error" });
    setTimeout(() => setNotification(null), 5000);
  };

  const pushToHistory = useCallback((current: Project | null) => {
    if (current) {
      setPast((prev) =>
        [...prev, JSON.parse(JSON.stringify(current))].slice(-30)
      );
      setFuture([]);
    }
  }, []);

  const undo = useCallback(() => {
    if (past.length === 0 || !currentProject) return;
    const previous = past[past.length - 1];
    setFuture((prev) => [JSON.parse(JSON.stringify(currentProject)), ...prev]);
    setPast(past.slice(0, -1));
    setCurrentProject(previous);
    setMessages(previous.chatHistory || []);
  }, [past, currentProject]);

  const redo = useCallback(() => {
    if (future.length === 0 || !currentProject) return;
    const next = future[0];
    setPast((prev) => [...prev, JSON.parse(JSON.stringify(currentProject))]);
    setFuture(future.slice(1));
    setCurrentProject(next);
    setMessages(next.chatHistory || []);
  }, [future, currentProject]);

  const handleSaveSnapshot = useCallback(() => {
    if (!currentProject) return;
    setProjects((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === currentProject.id);
      if (existingIndex >= 0) {
        const updatedProjects = [...prev];
        updatedProjects[existingIndex] = {
          ...currentProject,
          timestamp: Date.now(),
        };
        return updatedProjects;
      } else {
        return [{ ...currentProject, timestamp: Date.now() }, ...prev];
      }
    });
    showSuccess("Workspace saved successfully");
  }, [currentProject]);

  const triggerAutoLayout = useCallback(() => {
    if (!currentProject) return;
    const nodeWidth = BREAKPOINT_WIDTHS[currentBreakpoint];
    const nodeHeight = BREAKPOINT_HEIGHTS[currentBreakpoint];
    
    const horizontalSpacing = nodeWidth + 80;
    const verticalSpacing = nodeHeight + 100;
    
    const columns = 2;
    const numScreens = currentProject.data.screens.length;

    const updatedScreens = currentProject.data.screens.map(
      (s: any, idx: number) => {
        const row = Math.floor(idx / columns);
        const col = idx % columns;
        const itemsInThisRow = Math.min(columns, numScreens - row * columns);
        
        let x = 0;
        let y = row * verticalSpacing;
        
        if (itemsInThisRow === 1 && numScreens > 1) {
          x = horizontalSpacing / 2;
        } else {
          x = col * horizontalSpacing;
        }
        
        return { ...s, position: { x, y } };
      }
    );
    const updatedProject = {
      ...currentProject,
      data: { ...currentProject.data, screens: updatedScreens },
    };
    setCurrentProject(updatedProject);
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
    requestAnimationFrame(() => fitView({ padding: 0.2, duration: 800 }));
  }, [currentProject, currentBreakpoint, fitView]);

  useEffect(() => {
    if (currentProject) triggerAutoLayout();
  }, [currentBreakpoint]);

  useEffect(() => {
    if (!didInitialLayout.current && nodes.length > 0 && currentProject) {
      didInitialLayout.current = true;
      requestAnimationFrame(() => triggerAutoLayout());
    }
  }, [nodes.length, currentProject, triggerAutoLayout]);

  useEffect(() => {
    if (!currentProject) return;
    const createdScreen = currentProject.data?.screens?.find(
      (s: any) => s.justCreated
    );
    if (!createdScreen) return;
    requestAnimationFrame(() =>
      fitView({
        nodes: [{ id: createdScreen.id }],
        padding: 0.4,
        duration: 700,
      })
    );
    setTimeout(() => {
      setCurrentProject((curr) => {
        if (!curr) return curr;
        return {
          ...curr,
          data: {
            ...curr.data,
            screens: curr.data.screens.map((s: any) =>
              s.id === createdScreen.id ? { ...s, justCreated: false } : s
            ),
          },
        };
      });
    }, 900);
  }, [currentProject, fitView]);

  const toggleLock = useCallback((id: string) => {
    setCurrentProject((curr) => {
      if (!curr) return curr;
      return {
        ...curr,
        data: {
          ...curr.data,
          screens: curr.data.screens.map((s: any) =>
            s.id === id ? { ...s, locked: !s.locked } : s
          ),
        },
      };
    });
  }, []);

  const acquireAiLock = () => {
    if (aiLockRef.current) return false;
    aiLockRef.current = true;
    return true;
  };
  const releaseAiLock = () => {
    aiLockRef.current = false;
  };

  const onNodeDragStop = useCallback((_: any, node: any) => {
    setCurrentProject((curr) => {
      if (!curr) return null;
      const updatedScreens = curr.data.screens.map((s: any) =>
        s.id === node.id ? { ...s, position: node.position } : s
      );
      const updated = {
        ...curr,
        data: { ...curr.data, screens: updatedScreens },
      };
      setProjects((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      return updated;
    });
  }, []);

  const deselectNodes = useCallback(
    () => rfSetNodes((nds) => nds.map((n) => ({ ...n, selected: false }))),
    [rfSetNodes]
  );
  const toggleLive = useCallback(
    (id: string) =>
      setActiveLiveScreens((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    []
  );
  const deleteScreen = useCallback(
    (id: string) => {
      setCurrentProject((curr) => {
        if (!curr) return null;
        pushToHistory(curr);
        const updatedScreens = curr.data.screens.filter(
          (s: any) => s.id !== id
        );
        const updated = {
          ...curr,
          data: { ...curr.data, screens: updatedScreens },
        };
        setProjects((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        return updated;
      });
    },
    [pushToHistory]
  );

  const handleGenerate = async () => {
    if (!usage.canGenerate) {
      if (usage.isSignedIn) setShowUpgrade(true);
      else setShowNudge(true);
      return;
    }
    if (!input.trim() || isGenerating) return;
    if (!acquireAiLock()) return;
    setIsGenerating(true);
    const newUserMsg: ChatMessage = { role: "user", content: input };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);

    try {
      const existingScreens = currentProject?.data?.screens || [];
      const modelToUse =
        selectedModelId === "custom" ? customModelId : selectedModelId;
      const result = await generateProductArtifacts(input, productTheme, {
        architecture,
        referenceAssets,
        chatHistory: updatedMessages,
        existingScreens: existingScreens.map((s: any) => ({
          id: s.id,
          name: s.name,
          purpose: s.purpose,
          markup: s.markup,
        })),
        model: modelToUse,
        apiKey: customApiKey || undefined,
        provider: selectedProvider,
      });

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content:
          result.assistantMessage ||
          "Architecture synthesized. Workspace updated.",
      };
      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);

      if (currentProject) {
        pushToHistory(currentProject);
        const updatedProject: Project = {
          ...currentProject,
          data: result,
          themePreference: productTheme,
          chatHistory: finalMessages,
          timestamp: Date.now(),
        };
        setCurrentProject(updatedProject);
        setProjects((prev) =>
          prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
        );
      } else {
        const newProject: Project = {
          id: Math.random().toString(36).substring(7),
          name: result.overview.name || "New Product",
          timestamp: Date.now(),
          data: result,
          themePreference: productTheme,
          chatHistory: finalMessages,
        };
        setProjects((prev) => [newProject, ...prev]);
        setCurrentProject(newProject);
      }

      setInput("");
      didInitialLayout.current = false;
      showSuccess("Architecture synthesized successfully");
      await usage.incrementUsage();
    } catch (err: any) {
      console.error(err);
      showError(
        err.message || "UIX failed. Please check your API key or connection."
      );
    } finally {
      setIsGenerating(false);
      releaseAiLock();
    }
  };

  const handleModify = useCallback(async () => {
    const selectedId = getNodes().find((n) => n.selected)?.id;
    if (!selectedId || !modifyInput.trim() || !currentProject) return;
    if (!acquireAiLock()) return;
    setIsModifying(true);

    const newUserMsg: ChatMessage = {
      role: "user",
      content: `Refine screen "${selectedId}": ${modifyInput}`,
    };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);

    try {
      const screen = currentProject.data.screens.find(
        (s: any) => s.id === selectedId
      );
      const modelToUse =
        selectedModelId === "custom" ? customModelId : selectedModelId;
      const result = await modifyScreen(
        screen.name,
        screen.markup,
        modifyInput,
        currentProject.data.designSystem,
        updatedMessages,
        modelToUse,
        customApiKey || undefined,
        selectedProvider
      );

      pushToHistory(currentProject);
      const updatedScreens = currentProject.data.screens.map((s: any) =>
        s.id === selectedId
          ? { ...s, markup: result.markup, name: result.name }
          : s
      );
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: result.summary || "Refined the screen based on your feedback.",
      };
      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);

      const updatedProject = {
        ...currentProject,
        data: { ...currentProject.data, screens: updatedScreens },
        chatHistory: finalMessages,
      };
      setCurrentProject(updatedProject);
      setModifyInput("");
      showSuccess("Screen refined successfully");
    } catch (err: any) {
      showError(err.message || "Refinement failed.");
    } finally {
      setIsModifying(false);
      releaseAiLock();
    }
  }, [
    getNodes,
    modifyInput,
    currentProject,
    pushToHistory,
    messages,
    selectedModelId,
    customModelId,
    customApiKey,
    selectedProvider,
  ]);

  const handleGenerateNewScreen = async () => {
    if (!newScreenPrompt.trim() || isGeneratingNewScreen || !currentProject)
      return;
    if (!acquireAiLock()) return;
    setIsGeneratingNewScreen(true);

    const newUserMsg: ChatMessage = {
      role: "user",
      content: `Add screen: ${newScreenPrompt}`,
    };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);

    try {
      const modelToUse =
        selectedModelId === "custom" ? customModelId : selectedModelId;
      const result = await generateNewScreen(
        newScreenPrompt,
        currentProject.data.designSystem,
        architecture,
        {
          overview: currentProject.data.overview,
          existingScreens: currentProject.data.screens,
          chatHistory: updatedMessages,
        },
        modelToUse,
        customApiKey || undefined,
        selectedProvider
      );

      const newScreen = {
        id: Math.random().toString(36).substring(7),
        name: result.name,
        purpose: newScreenPrompt,
        markup: result.markup,
        position: { x: 0, y: 0 },
        justCreated: true,
      };

      pushToHistory(currentProject);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: result.summary || "Added the new screen.",
      };
      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);

      const updatedProject = {
        ...currentProject,
        data: {
          ...currentProject.data,
          screens: [...currentProject.data.screens, newScreen],
        },
        chatHistory: finalMessages,
      };
      setCurrentProject(updatedProject);
      setNewScreenPrompt("");
      setIsAddingScreen(false);
      didInitialLayout.current = false;
      fitView({ nodes: [{ id: newScreen.id }], padding: 0.4, duration: 700 });
      showSuccess("New screen synthesized");
    } catch (err: any) {
      showError(err.message || "Generation failed.");
    } finally {
      setIsGeneratingNewScreen(false);
      releaseAiLock();
    }
  };

  useEffect(() => {
    if (currentProject?.data?.screens) {
      const newNodes = currentProject.data.screens.map((screen: any) => {
        const selectedNodeIds = new Set(
          getNodes()
            .filter((n) => n.selected)
            .map((n) => n.id)
        );
        const isSelected = selectedNodeIds.has(screen.id);
        return {
          id: screen.id,
          type: "screen",
          position: screen.position || { x: 0, y: 0 },
          data: {
            ...screen,
            designSystem: currentProject.data.designSystem,
            currentBreakpoint,
            isLive: activeLiveScreens.has(screen.id),
            modifyInput: isSelected ? modifyInput : "",
            isModifying,
            onModifyInputChange: setModifyInput,
            onHandleModify: handleHandleModify,
            onDeselect: deselectNodes,
            onToggleLive: toggleLive,
            onDelete: deleteScreen,
            onToggleLock: toggleLock,
            isAiBusy,
          },
          selected: isSelected,
          dragHandle: screen.locked ? undefined : ".custom-drag-handle",
          draggable: !screen.locked,
        };
      });
      rfSetNodes(newNodes);
    } else {
      rfSetNodes([]);
    }
  }, [
    currentProject,
    currentBreakpoint,
    activeLiveScreens,
    modifyInput,
    isModifying,
    deselectNodes,
    toggleLive,
    deleteScreen,
    handleModify,
    rfSetNodes,
  ]);

  const handleHandleModify = useCallback(() => handleModify(), [handleModify]);

  const handleFileReferenceChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files: any = Array.from(e.target.files || []);
    const newAssets: ReferenceAsset[] = [];
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const data = await new Promise<string>((r) => {
          const reader = new FileReader();
          reader.onloadend = () => r(reader.result as string);
          reader.readAsDataURL(file);
        });
        newAssets.push({ type: "image", data, name: file.name });
      }
    }
    setReferenceAssets((prev) => [...prev, ...newAssets].slice(-10));
    e.target.value = "";
  };

  const removeReference = (index: number) =>
    setReferenceAssets((prev) => prev.filter((_, i) => i !== index));

  const handleImportHistory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedProjects = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedProjects)) {
          setProjects((prev) => {
            const idSet = new Set(prev.map((p) => p.id));
            const merged = [...prev];
            importedProjects.forEach((p: any) => {
              if (!idSet.has(p.id)) merged.push(p);
            });
            return merged;
          });
          showSuccess("History imported successfully");
        }
      } catch (e) {
        showError("Failed to parse history bundle.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExportHistory = () => {
    const blob = new Blob([JSON.stringify(projects, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uix_agent_history_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportZip = async () => {
    if (!currentProject) return;
    const zip = new JSZip();
    currentProject.data.screens.forEach((s: any) =>
      zip.file(
        `${s.name.replace(/\s+/g, "_")}.html`,
        getFullHtml(s.markup, currentProject.data.designSystem)
      )
    );
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "project_screens.zip";
    link.click();
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`h-screen w-full flex overflow-hidden bg-black text-white`}>
      <style>{`
        .modal-backdrop { backdrop-filter: blur(10px); background: rgba(0,0,0,0.65); }
        .chat-scroll::-webkit-scrollbar { width: 0; }
      `}</style>

      {notification && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[3000] animate-in fade-in slide-in-from-top-4 uix-toast ${
            notification.type === "error"
              ? "uix-toast-error toast-error"
              : "uix-toast-success"
          }`}
        >
          {notification.type === "error" ? (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {notification.message}
        </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 modal-backdrop animate-in fade-in">
          <div className="uix-modal w-full max-w-[420px] flex flex-col overflow-hidden animate-in zoom-in-95">
            <header className="px-6 py-5 border-b flex items-center justify-between" style={{borderColor:'var(--panel-border)'}}>
              <div className="flex items-center gap-2.5">
                <div style={{width:8,height:8,borderRadius:'50%',background:'var(--brand)'}} />
                <h3 className="font-display font-700 text-sm" style={{color:'var(--text-primary)'}}>Model Settings</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="uix-icon-btn"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="uix-label">AI Provider</label>
                <div className="uix-segment">
                  <button
                    onClick={() => setSelectedProvider("gemini")}
                    className={`uix-segment-btn ${selectedProvider === "gemini" ? "active" : ""}`}
                  >
                    Gemini
                  </button>
                  <button
                    onClick={() => setSelectedProvider("openrouter")}
                    className={`uix-segment-btn ${selectedProvider === "openrouter" ? "active" : ""}`}
                  >
                    OpenRouter
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="uix-label">API Key</label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="settings-input"
                />
                <p className="uix-micro" style={{marginTop:4}}>Stored locally. Leave blank to use built-in Gemini.</p>
              </div>
              <div className="space-y-2">
                <label className="uix-label">Model</label>
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="settings-select"
                >
                  {MODEL_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={saveSettings}
                className="uix-btn-brand w-full py-3 text-sm"
                style={{borderRadius:'var(--r-sm)'}}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {showNudge && <SignInNudge onDismiss={() => setShowNudge(false)} />}
      {showUpgrade && <UpgradePrompt onDismiss={() => setShowUpgrade(false)} />}

      <div className="w-[500px] h-full flex flex-col border-r border-[var(--border)] bg-[#050505] z-[5000] shrink-0">
        <div className="p-8 flex flex-col gap-6 w-full shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-lime flex items-center justify-center p-0.5" style={{boxShadow: '2px 2px 0 var(--border)'}}>
              <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="brutal-display text-[24px]">UIX</div>
          </div>

          <div className="brutal-panel p-4 flex flex-col gap-3" style={{border: '1px solid var(--border)', background: 'var(--bg)'}}>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => { setCurrentProject(null); rfSetNodes([]); setMessages([]); }} className="brutal-ghost" title="New Workspace">[NEW]</button>
              <button onClick={() => setIsHistoryOpen(true)} className="brutal-ghost" title="History">[HST]</button>
              <button onClick={() => setIsSettingsOpen(true)} className="brutal-ghost" title="Settings">[CFG]</button>
              <label className="brutal-ghost cursor-pointer" title="Import History">
                [IMP]
                <input type="file" className="hidden" accept=".json" onChange={handleImportHistory} />
              </label>
              <button onClick={handleExportHistory} className="brutal-ghost" title="Export History">[EXP]</button>
            </div>

            <div className="mt-2 pt-3 border-t flex items-center justify-between" style={{borderColor: 'var(--border)'}}>
              <span className="brutal-micro">{usage.isSignedIn ? 'PRO' : 'DEMO'}</span>
              <button
                className="brutal-ghost"
                style={{color: 'var(--lime)', padding: 0}}
                onClick={() => {
                  if (usage.isAtLimit) {
                    if (usage.isSignedIn) setShowUpgrade(true);
                    else setShowNudge(true);
                  }
                }}
              >
                {usage.isAtLimit
                  ? usage.isSignedIn ? 'UPGRADE' : 'SIGN IN'
                  : usage.usageLabel}
              </button>
            </div>
          </div>
          
          {usage.isSignedIn && (
            <div className="pl-1">
              <UserButton afterSignOutUrl={window.location.href} />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-8 pb-8 justify-end">
          <div className="flex flex-col gap-4 w-full h-full justify-end">
            {messages.length > 0 && (
              <div className="brutal-panel flex flex-col flex-1 overflow-y-auto chat-scroll p-4 gap-4" style={{borderBottom:'none', boxShadow:'none'}}>
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
            
            <div className="brutal-panel p-4 flex flex-col gap-4 bg-black shrink-0">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <span className="brutal-micro">ENGINE: {(selectedModelId === "custom" ? customModelId : selectedModelId)}</span>
                <div className="flex gap-2">
                  <button onClick={() => setArchitecture("web")} className={`brutal-ghost ${architecture === "web" ? "text-lime" : ""}`}>WEB</button>
                  <button onClick={() => setArchitecture("app")} className={`brutal-ghost ${architecture === "app" ? "text-lime" : ""}`}>APP</button>
                </div>
              </div>

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {["Fintech dashboard with analytics","Mobile food delivery onboarding flow","SaaS admin panel with dark mode"].map(p => (
                     <button key={p} className="brutal-ghost border border-[var(--border)] px-3 py-2 text-left" onClick={() => setInput(p)}>{p}</button>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <label className="brutal-btn flex items-center justify-center p-3" style={{background: 'var(--surface)', color:'var(--fg)'}}>
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
                    className="brutal-input w-full min-h-[56px] pr-[100px]"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !input.trim() || isAiBusy}
                    className="absolute right-2 bottom-2 top-2 w-[80px] brutal-btn bg-lime text-black border-lime"
                  >
                    {isGenerating ? "..." : "RUN"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 relative z-0" style={{background:'var(--canvas-bg)'}}>
        
        <nav className="absolute top-8 right-8 z-[4000] flex flex-col items-end gap-3 w-[260px]">
          <div className="brutal-panel p-3 flex flex-col gap-3 w-full" style={{border: '1px solid var(--border)', background: 'var(--bg)'}}>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="brutal-micro">WORKSPACE</span>
              <span className="brutal-micro text-white text-right truncate pl-2">{currentProject?.name || "VOID"}</span>
            </div>
            {currentProject && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setIsAddingScreen(true)}
                  className="brutal-btn w-full flex items-center justify-center"
                  disabled={isAiBusy}
                >
                  [+] ADD SCREEN
                </button>
                <div className="flex gap-2">
                  <button onClick={handleSaveSnapshot} className="brutal-ghost flex-1 text-center" disabled={isAiBusy}>SAVE</button>
                  <button onClick={handleExportZip} className="brutal-ghost flex-1 text-center text-lime">EXPORT</button>
                </div>
              </div>
            )}
          </div>
          
          <div className="brutal-panel p-2 flex gap-2 w-full" style={{border: '1px solid var(--border)', background: 'var(--bg)'}}>
            <button onClick={() => setCurrentBreakpoint("desktop")} className={`brutal-ghost flex-1 text-center ${currentBreakpoint === "desktop" ? "text-lime bg-white !text-black" : ""}`}>DSK</button>
            <button onClick={() => setCurrentBreakpoint("tablet")} className={`brutal-ghost flex-1 text-center ${currentBreakpoint === "tablet" ? "text-lime bg-white !text-black" : ""}`}>TAB</button>
            <button onClick={() => setCurrentBreakpoint("mobile")} className={`brutal-ghost flex-1 text-center ${currentBreakpoint === "mobile" ? "text-lime bg-white !text-black" : ""}`}>MOB</button>
          </div>
        </nav>
        <div className="absolute inset-0 z-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            selectNodesOnDrag={true}
            minZoom={0.05}
            maxZoom={4}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color={appTheme === "dark" ? "#1a2033" : "#d1d5db"}
            />
            {isAddingScreen && (
              <Panel position="top-center" className="mt-6">
                <div className="uix-add-panel p-6 w-[400px] animate-in slide-in-from-top-4 duration-300" style={{boxShadow: 'var(--shadow-panel)'}}>
                  <header className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div style={{width:6,height:6,borderRadius:'50%',background:'var(--brand)'}} />
                      <span className="uix-label">New Screen</span>
                    </div>
                    <button onClick={() => setIsAddingScreen(false)} className="uix-icon-btn">✕</button>
                  </header>
                  <textarea
                    autoFocus
                    value={newScreenPrompt}
                    onChange={(e) => setNewScreenPrompt(e.target.value)}
                    placeholder="e.g. 'A premium statistics page with line charts'"
                    className="uix-textarea w-full h-24 p-3 mb-4 text-xs"
                  />
                  <button
                    onClick={handleGenerateNewScreen}
                    disabled={isGeneratingNewScreen || !newScreenPrompt.trim()}
                    className="uix-btn-send w-full py-3 text-xs font-display font-bold uppercase tracking-wide disabled:opacity-50"
                    style={{borderRadius:'var(--r-sm)'}}
                  >
                    {isGeneratingNewScreen ? "Synthesizing..." : "Generate New Screen"}
                  </button>
                </div>
              </Panel>
            )}
            <Panel position="bottom-right" className="mb-8 mr-8 z-[3000]">
              <div className="flex flex-col gap-2">
                <div className="brutal-panel flex flex-col bg-black overflow-hidden pt-2" style={{border: '1px solid var(--border)'}}>
                  <button onClick={() => zoomIn()} className="brutal-ghost border-b border-[var(--border)] p-3 hover:bg-white hover:text-black" title="Zoom In">+</button>
                  <button onClick={() => zoomOut()} className="brutal-ghost border-b border-[var(--border)] p-3 hover:bg-white hover:text-black" title="Zoom Out">-</button>
                  <button onClick={() => fitView({ padding: 0.2, duration: 800 })} className="brutal-ghost p-3 text-[10px] hover:bg-white hover:text-black" title="Fit">FIT</button>
                </div>
                <div className="brutal-panel flex flex-col bg-black mt-2 overflow-hidden" style={{border: '1px solid var(--border)'}}>
                  <button onClick={undo} disabled={past.length === 0} className="brutal-ghost border-b border-[var(--border)] p-3 disabled:opacity-30 hover:bg-white hover:text-black" title="Undo">{"<"}</button>
                  <button onClick={redo} disabled={future.length === 0} className="brutal-ghost p-3 disabled:opacity-30 hover:bg-white hover:text-black" title="Redo">{">"}</button>
                </div>
              </div>
            </Panel>
            {isGenerating && (
              <Panel position="top-center" className="!m-0 !top-1/2 !-translate-y-1/2">
                <div className="flex flex-col items-center gap-6">
                  <div className="uix-spinner" />
                  <p className="font-display font-700 text-base" style={{color:'var(--text-primary)',letterSpacing:'0.06em',textTransform:'uppercase'}}>Synthesizing…</p>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </main>

      {isHistoryOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-8 modal-backdrop animate-in fade-in">
          <div className="uix-modal w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <header className="px-7 py-5 border-b flex items-center justify-between" style={{borderColor:'var(--panel-border)'}}>
              <div>
                <h3 className="font-display font-800 text-base" style={{color:'var(--text-primary)'}}>Workspace History</h3>
                <p className="uix-label" style={{marginTop:2}}>Select a previous project</p>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="uix-icon-btn">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <p className="uix-label" style={{opacity:0.3}}>No UIX history found</p>
                </div>
              ) : (
                projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCurrentProject(p);
                      setMessages(p.chatHistory || []);
                      setIsHistoryOpen(false);
                      setTimeout(() => fitView({ padding: 0.3 }), 100);
                    }}
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
      )}
    </div>
  );
}

export default function App() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [demoGranted, setDemoGranted] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  if (!isLoaded) {
    return (
      <div
        className="h-screen w-full flex items-center justify-center"
        style={{ background: "var(--canvas-bg)" }}
      >
        <div className="uix-spinner" />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-10 text-center" style={{background:'var(--canvas-bg)'}}>
        <div className="uix-icon-badge mb-8" style={{width:64,height:64,borderRadius:'var(--r-lg)'}}>
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="font-display font-800 text-3xl mb-3" style={{color:'var(--text-primary)',letterSpacing:'-0.02em'}}>Desktop Required</h1>
        <p className="uix-micro max-w-xs mx-auto" style={{lineHeight:1.7}}>
          UIX Agent is optimized for larger screens.{" "}
          <span style={{color:'var(--brand)'}}>Please open on a tablet, laptop, or desktop for the full experience.</span>
        </p>
      </div>
    );
  }

  if (!isSignedIn && !demoGranted) {
    return (
      <GateScreen
        onDemoGranted={() => setDemoGranted(true)}
      />
    );
  }

  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  );
}
