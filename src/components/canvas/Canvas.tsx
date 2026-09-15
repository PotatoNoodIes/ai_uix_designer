import React, { useEffect, useRef } from "react";
import ReactFlow from "reactflow";
import { UserButton } from "@clerk/clerk-react";
import { useAppState } from "@/context/AppStateContext";
import { SignInNudge } from "@/components/ui/SignInNudge";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { Toast } from "@/components/ui/Toast";
import { Logo } from "@/components/primitives";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { Toolbar } from "@/components/layout/Toolbar";
import { ChatPanel } from "@/components/panels/ChatPanel";
import { CanvasNav } from "@/components/canvas/CanvasNav";
import { GridLayer } from "@/components/canvas/layers/GridLayer";
import { OverlayLayer } from "@/components/canvas/layers/OverlayLayer";
import { HistoryModal } from "@/components/modals/HistoryModal";
import { nodeTypes } from "@/components/canvas/ScreenNode";
import type { Project } from "@/types";

export function Canvas() {
  const { ui, settings, canvas, usage, saveSettings } = useAppState();

  const {
    isHistoryOpen, setIsHistoryOpen,
    isSettingsOpen, setIsSettingsOpen,
    notification,
    mobilePanel, setMobilePanel,
    showNudge, setShowNudge,
    showUpgrade, setShowUpgrade,
  } = ui;

  const {
    selectedProvider, setSelectedProvider,
    selectedModelId, setSelectedModelId,
    customModelId,
    customApiKey, setCustomApiKey,
    architecture, setArchitecture,
    appTheme,
  } = settings;

  const {
    nodes, edges, onNodesChange, onEdgesChange,
    zoomIn, zoomOut, fitView,
    projects,
    currentProject, setCurrentProject,
    messages, setMessages,
    past, future,
    isGenerating, isAiBusy,
    input, setInput,
    isAddingScreen, setIsAddingScreen,
    newScreenPrompt, setNewScreenPrompt,
    isGeneratingNewScreen,
    currentBreakpoint, setCurrentBreakpoint,
    undo, redo,
    handleSaveSnapshot,
    handleGenerate,
    handleGenerateNewScreen,
    handleFileReferenceChange,
    handleImportHistory,
    handleExportHistory,
    handleExportZip,
    onNodeDragStop,
  } = canvas;

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewWorkspace = () => {
    setCurrentProject(null);
    setMessages([]);
  };

  const handleSelectProject = (p: Project) => {
    setCurrentProject(p);
    setMessages(p.chatHistory || []);
    setIsHistoryOpen(false);
    setTimeout(() => fitView({ padding: 0.3 }), 100);
    setMobilePanel("canvas");
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-canvas text-ink">
      {notification && <Toast notification={notification} />}

      {isSettingsOpen && (
        <SettingsModal
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
          selectedModelId={selectedModelId}
          setSelectedModelId={setSelectedModelId}
          customApiKey={customApiKey}
          setCustomApiKey={setCustomApiKey}
          onClose={() => setIsSettingsOpen(false)}
          onSave={saveSettings}
        />
      )}

      {showNudge && <SignInNudge onDismiss={() => setShowNudge(false)} />}
      {showUpgrade && <UpgradePrompt onDismiss={() => setShowUpgrade(false)} />}

      <MobileTabBar
        mobilePanel={mobilePanel}
        setMobilePanel={setMobilePanel}
        currentProject={currentProject}
        usage={usage}
      />

      <div className={`
        md:w-[500px] md:h-full md:flex md:flex-col md:border-r md:border-hairline md:bg-sunken md:z-sidebar md:shrink-0
        ${mobilePanel === "chat" ? "flex flex-col flex-1 min-h-0 bg-sunken z-sidebar" : "hidden md:flex md:flex-col"}
      `}>
        <div className="hidden md:flex p-8 flex-col gap-6 w-full shrink-0">
          <Logo />
          <Toolbar
            currentProject={currentProject}
            usage={usage}
            onNew={handleNewWorkspace}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onImportHistory={handleImportHistory}
            onExportHistory={handleExportHistory}
            onShowUpgrade={() => setShowUpgrade(true)}
            onShowNudge={() => setShowNudge(true)}
          />
          {usage.isSignedIn && (
            <div className="pl-1">
              <UserButton afterSignOutUrl={window.location.href} />
            </div>
          )}
        </div>

        <div className="md:hidden px-4 pt-4 shrink-0">
          <Toolbar
            compact
            currentProject={currentProject}
            usage={usage}
            onNew={handleNewWorkspace}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onImportHistory={handleImportHistory}
            onExportHistory={handleExportHistory}
            onShowUpgrade={() => setShowUpgrade(true)}
            onShowNudge={() => setShowNudge(true)}
          />
        </div>

        <ChatPanel
          messages={messages}
          chatEndRef={chatEndRef}
          input={input}
          setInput={setInput}
          isGenerating={isGenerating}
          isAiBusy={isAiBusy}
          selectedModelId={selectedModelId}
          customModelId={customModelId}
          architecture={architecture}
          setArchitecture={setArchitecture}
          handleGenerate={handleGenerate}
          handleFileReferenceChange={handleFileReferenceChange}
        />
      </div>

      <main className={`
        flex-1 relative z-0
        ${mobilePanel === "canvas" ? "flex flex-col" : "hidden md:block"}
      `}>
        {/* Intentionally transparent: the body's graph-paper backdrop shows
            through here. The old background token was undefined, which
            happened to produce the same result by accident. */}

        <CanvasNav
          currentProject={currentProject}
          currentBreakpoint={currentBreakpoint}
          setCurrentBreakpoint={setCurrentBreakpoint}
          setIsAddingScreen={setIsAddingScreen}
          setMobilePanel={setMobilePanel}
          handleSaveSnapshot={handleSaveSnapshot}
          handleExportZip={handleExportZip}
          isAiBusy={isAiBusy}
        />

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
            panOnDrag
            zoomOnPinch
            zoomOnScroll={false}
            preventScrolling={false}
          >
            <GridLayer theme={appTheme} />

            <OverlayLayer
              isAddingScreen={isAddingScreen}
              isGenerating={isGenerating}
              newScreenPrompt={newScreenPrompt}
              setNewScreenPrompt={setNewScreenPrompt}
              isGeneratingNewScreen={isGeneratingNewScreen}
              onCloseAddScreen={() => setIsAddingScreen(false)}
              onGenerateNewScreen={handleGenerateNewScreen}
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              fitView={fitView}
              undo={undo}
              redo={redo}
              canUndo={past.length > 0}
              canRedo={future.length > 0}
            />
          </ReactFlow>
        </div>
      </main>

      {isHistoryOpen && (
        <HistoryModal
          projects={projects}
          currentProject={currentProject}
          onClose={() => setIsHistoryOpen(false)}
          onSelectProject={handleSelectProject}
        />
      )}
    </div>
  );
}
