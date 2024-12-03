import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  Panel,
  MiniMap,
  NodeTypes,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import { createFileRoute } from "@tanstack/react-router";
import { useOverlayStore } from "@/store/overlayStore";
import { WidgetNode } from "@/components/overlay/nodes/WidgetNode";
import { OverlayToolbar } from "@/components/overlay/OverlayToolbar";
import { OverlaySettings } from "@/components/overlay/OverlaySettings";
import { Button } from "@/components/ui/button";
import "reactflow/dist/style.css";
import { useAuth, useUser } from "@clerk/tanstack-start";
import { WidgetAuthGuard } from "@/components/auth/WidgetAuthGuard";

const nodeTypes: NodeTypes = {
  widget: WidgetNode,
};

export const Route = createFileRoute("/_app/widgets/overlay")({
  component: () => (
    <WidgetAuthGuard>
      <OverlayEditor />
    </WidgetAuthGuard>
  ),
});

const hideAttribution = `
  .react-flow__attribution {
    display: none !important;
  }
`;

function Flow() {
  const { nodes, edges, settings, onNodesChange, onEdgesChange, onConnect } =
    useOverlayStore();
  const { getToken } = useAuth();
  const { user } = useUser();

  const { project } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = project({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type: "widget",
        position,
        data: { type, label: `${type} widget` },
      };

      useOverlayStore.getState().addNode(newNode);
    },
    [project]
  );

  useEffect(() => {
    console.log("user", user);
    if (!user?.id) return;

    const saveOverlay = async () => {
      const token = await getToken({ template: "lstio" });
      console.log("token", token);
      if (!token) return;

      useOverlayStore.getState().saveToSupabase(user.id, token);
    };

    const saveTimeout = setTimeout(saveOverlay, 1000);

    return () => clearTimeout(saveTimeout);
  }, [nodes, edges, settings, user?.id, getToken]);

  useEffect(() => {
    if (!user?.id) return;

    const loadOverlay = async () => {
      const token = await getToken({ template: "lstio" });
      if (!token) return;

      useOverlayStore.getState().loadFromSupabase(user.id, token);
    };

    loadOverlay();
  }, [user?.id, getToken]);

  return (
    <div className="h-screen w-full bg-background p-4">
      <div
        className="relative mx-auto border border-dashed border-muted-foreground rounded-lg overflow-hidden"
        style={{
          width: `${settings.resolution.width}px`,
          height: `${settings.resolution.height}px`,
          transform: "scale(0.5)",
          transformOrigin: "top left",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          snapToGrid={settings.snapToGrid}
          snapGrid={[settings.gridSize, settings.gridSize]}
          fitView={false}
          className="bg-background"
          minZoom={0.1}
          maxZoom={2}
        >
          <Background
            gap={settings.gridSize}
            size={settings.gridSize}
            color={settings.theme === "dark" ? "#2a2a2a" : "#e5e5e5"}
            variant={settings.showGrid ? "dots" : "none"}
          />
          <Controls />
          <MiniMap />
          <Panel position="top-left">
            <OverlayToolbar />
          </Panel>
          <Panel position="top-right">
            <OverlaySettings />
          </Panel>
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {settings.resolution.width} x {settings.resolution.height}
          </div>
        </ReactFlow>
      </div>
    </div>
  );
}

function OverlayEditor() {
  return (
    <ReactFlowProvider>
      <style>{hideAttribution}</style>
      <Flow />
    </ReactFlowProvider>
  );
}
