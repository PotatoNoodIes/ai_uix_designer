import React, { useState } from "react";
import { ReactFlowProvider } from "reactflow";
import { useAuth } from "@clerk/clerk-react";
import { AppStateProvider } from "@/context/AppStateContext";
import { Canvas } from "@/components/canvas/Canvas";
import { GateScreen } from "@/components/ui/GateScreen";

export default function App() {
  const { isSignedIn, isLoaded } = useAuth();
  const [demoGranted, setDemoGranted] = useState<boolean>(false);

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center" style={{ background: "var(--canvas-bg)" }}>
        <div className="uix-spinner" />
      </div>
    );
  }

  if (!isSignedIn && !demoGranted) {
    return <GateScreen onDemoGranted={() => setDemoGranted(true)} />;
  }

  return (
    <ReactFlowProvider>
      <AppStateProvider>
        <Canvas />
      </AppStateProvider>
    </ReactFlowProvider>
  );
}