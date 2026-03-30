import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNodesState, useEdgesState, useReactFlow } from "reactflow";
import JSZip from "jszip";
import {
  generateProductArtifacts,
  modifyScreen,
  generateNewScreen,
  type ReferenceAsset,
  type ChatMessage,
} from "@/services/geminiService";
import type { Project, Breakpoint, AIProvider } from "@/types";
import type { UsageLimitResult } from "@/hooks/useUsageLimit";
import { getFullHtml } from "@/utils/htmlUtils";
import { BREAKPOINT_WIDTHS, BREAKPOINT_HEIGHTS } from "@/constants/appConstants";
import { generateId } from "@/utils/id";
import { deepClone } from "@/utils/clone";
import { triggerDownload } from "@/utils/download";

interface UseCanvasStateParams {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  setMobilePanel: (v: "chat" | "canvas") => void;
  setShowNudge: (v: boolean) => void;
  setShowUpgrade: (v: boolean) => void;
  selectedProvider: AIProvider;
  selectedModelId: string;
  customModelId: string;
  customApiKey: string;
  architecture: "web" | "app";
  productTheme: "light" | "dark";
  usage: UsageLimitResult;
}

export function useCanvasState({
  showSuccess,
  showError,
  setMobilePanel,
  setShowNudge,
  setShowUpgrade,
  selectedProvider,
  selectedModelId,
  customModelId,
  customApiKey,
  architecture,
  productTheme,
  usage,
}: UseCanvasStateParams) {
  const { fitView, getNodes, setNodes: rfSetNodes, zoomIn, zoomOut } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const aiLockRef = useRef(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [past, setPast] = useState<Project[]>([]);
  const [future, setFuture] = useState<Project[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [input, setInput] = useState("");
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>("desktop");
  const [referenceAssets, setReferenceAssets] = useState<ReferenceAsset[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [activeLiveScreens, setActiveLiveScreens] = useState<Set<string>>(new Set());
  const [modifyInput, setModifyInput] = useState("");
  const [isModifying, setIsModifying] = useState(false);
  const [isAddingScreen, setIsAddingScreen] = useState(false);
  const [newScreenPrompt, setNewScreenPrompt] = useState("");
  const [isGeneratingNewScreen, setIsGeneratingNewScreen] = useState(false);

  const didInitialLayout = useRef(false);
  const isAiBusy = isGenerating || isGeneratingNewScreen || isModifying;


  useEffect(() => {
    const savedProjects = localStorage.getItem("stitch_v3_projects");
    if (savedProjects) setProjects(JSON.parse(savedProjects));
  }, []);


  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("stitch_v3_projects", JSON.stringify(projects));
    }
  }, [projects]);

  const pushToHistory = useCallback((current: Project | null) => {
    if (current) {
      setPast((prev) => [...prev, deepClone(current)].slice(-30));
      setFuture([]);
    }
  }, []);

  const undo = useCallback(() => {
    if (past.length === 0 || !currentProject) return;
    const previous = past[past.length - 1];
    setFuture((prev) => [deepClone(currentProject), ...prev]);
    setPast(past.slice(0, -1));
    setCurrentProject(previous);
    setMessages(previous.chatHistory || []);
  }, [past, currentProject]);

  const redo = useCallback(() => {
    if (future.length === 0 || !currentProject) return;
    const next = future[0];
    setPast((prev) => [...prev, deepClone(currentProject)]);
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
        updatedProjects[existingIndex] = { ...currentProject, timestamp: Date.now() };
        return updatedProjects;
      } else {
        return [{ ...currentProject, timestamp: Date.now() }, ...prev];
      }
    });
    showSuccess("Workspace saved successfully");
  }, [currentProject, showSuccess]);

  const triggerAutoLayout = useCallback(() => {
    if (!currentProject) return;
    const nodeWidth = BREAKPOINT_WIDTHS[currentBreakpoint];
    const nodeHeight = BREAKPOINT_HEIGHTS[currentBreakpoint];
    const horizontalSpacing = nodeWidth + 80;
    const verticalSpacing = nodeHeight + 100;
    const columns = 2;
    const numScreens = currentProject.data.screens.length;

    const updatedScreens = currentProject.data.screens.map((s: any, idx: number) => {
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
    });

    const updatedProject = {
      ...currentProject,
      data: { ...currentProject.data, screens: updatedScreens },
    };
    setCurrentProject(updatedProject);
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
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
    const createdScreen = currentProject.data?.screens?.find((s: any) => s.justCreated);
    if (!createdScreen) return;
    requestAnimationFrame(() =>
      fitView({ nodes: [{ id: createdScreen.id }], padding: 0.4, duration: 700 })
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
  const releaseAiLock = () => { aiLockRef.current = false; };

  const onNodeDragStop = useCallback((_: any, node: any) => {
    setCurrentProject((curr) => {
      if (!curr) return null;
      const updatedScreens = curr.data.screens.map((s: any) =>
        s.id === node.id ? { ...s, position: node.position } : s
      );
      const updated = { ...curr, data: { ...curr.data, screens: updatedScreens } };
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
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
        const updatedScreens = curr.data.screens.filter((s: any) => s.id !== id);
        const updated = { ...curr, data: { ...curr.data, screens: updatedScreens } };
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
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
      const modelToUse = selectedModelId === "custom" ? customModelId : selectedModelId;
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
        content: result.assistantMessage || "Architecture synthesized. Workspace updated.",
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
        setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
      } else {
        const newProject: Project = {
          id: generateId(),
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

      setMobilePanel("canvas");
      await usage.incrementUsage();
    } catch (err: any) {
      showError(err.message || "UIX failed. Please check your API key or connection.");
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
      const screen = currentProject.data.screens.find((s: any) => s.id === selectedId);
      const modelToUse = selectedModelId === "custom" ? customModelId : selectedModelId;
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
        s.id === selectedId ? { ...s, markup: result.markup, name: result.name } : s
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
  }, [getNodes, modifyInput, currentProject, pushToHistory, messages, selectedModelId, customModelId, customApiKey, selectedProvider, showSuccess, showError]);

  const handleGenerateNewScreen = async () => {
    if (!newScreenPrompt.trim() || isGeneratingNewScreen || !currentProject) return;
    if (!acquireAiLock()) return;
    setIsGeneratingNewScreen(true);

    const newUserMsg: ChatMessage = { role: "user", content: `Add screen: ${newScreenPrompt}` };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);

    try {
      const modelToUse = selectedModelId === "custom" ? customModelId : selectedModelId;
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
        id: generateId(),
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
        data: { ...currentProject.data, screens: [...currentProject.data.screens, newScreen] },
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

  const handleHandleModify = useCallback(() => handleModify(), [handleModify]);

  useEffect(() => {
    if (currentProject?.data?.screens) {
      const newNodes = currentProject.data.screens.map((screen: any) => {
        const selectedNodeIds = new Set(
          getNodes().filter((n) => n.selected).map((n) => n.id)
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
  }, [currentProject, currentBreakpoint, activeLiveScreens, modifyInput, isModifying, deselectNodes, toggleLive, deleteScreen, handleModify, rfSetNodes]);

  const handleFileReferenceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            importedProjects.forEach((p: any) => { if (!idSet.has(p.id)) merged.push(p); });
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
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `uix_agent_history_${new Date().toISOString().split("T")[0]}.json`);
  };

  const handleExportZip = async () => {
    if (!currentProject) return;
    const zip = new JSZip();
    currentProject.data.screens.forEach((s: any) =>
      zip.file(`${s.name.replace(/\s+/g, "_")}.html`, getFullHtml(s.markup, currentProject.data.designSystem))
    );
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, "project_screens.zip");
  };

  return {
    // ReactFlow
    nodes, edges, onNodesChange, onEdgesChange,
    zoomIn, zoomOut, fitView,
    // Project state
    projects, setProjects,
    currentProject, setCurrentProject,
    messages, setMessages,
    referenceAssets,
    past, future,
    // AI / generate state
    isGenerating, isAiBusy,
    input, setInput,
    modifyInput, setModifyInput,
    isModifying,
    isAddingScreen, setIsAddingScreen,
    newScreenPrompt, setNewScreenPrompt,
    isGeneratingNewScreen,
    // Canvas state
    currentBreakpoint, setCurrentBreakpoint,
    activeLiveScreens,
    // Handlers
    undo, redo,
    handleSaveSnapshot,
    handleGenerate,
    handleModify,
    handleGenerateNewScreen,
    handleFileReferenceChange,
    removeReference,
    handleImportHistory,
    handleExportHistory,
    handleExportZip,
    onNodeDragStop,
    deselectNodes,
    toggleLive,
    deleteScreen,
    toggleLock,
  };
}
