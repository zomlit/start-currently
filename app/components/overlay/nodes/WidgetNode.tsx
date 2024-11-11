import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useOverlayStore } from "@/store/overlayStore";
import { cn } from "@/lib/utils";
import { NodeResizer } from "@reactflow/node-resizer";
import "@reactflow/node-resizer/dist/style.css";
import { WidgetContent } from "./WidgetContent";

export const WidgetNode = memo(({ id, data, selected }: NodeProps) => {
  const updateNode = useOverlayStore((state) => state.updateNode);

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={100}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 2,
        }}
      />
      <div
        className={cn(
          "shadow-md rounded-md bg-background border-2 min-w-[200px] min-h-[100px] overflow-hidden",
          selected ? "border-primary" : "border-border"
        )}
      >
        <WidgetContent type={data.type} selected={selected} />
        <Handle
          type="target"
          position={Position.Top}
          className="w-16 !bg-primary"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-16 !bg-primary"
        />
      </div>
    </>
  );
});

WidgetNode.displayName = "WidgetNode";
