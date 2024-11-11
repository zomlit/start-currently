import { Node, Edge, Connection, NodeChange, EdgeChange } from "reactflow";

export type OverlayResolution = {
  width: number;
  height: number;
};

export type WidgetNode = Node & {
  data: {
    type: "lyrics" | "visualizer" | "nowPlaying" | "chat" | "alerts";
    settings: any; // Will be specific to each widget type
    label: string;
  };
};

export type OverlaySettings = {
  resolution: OverlayResolution;
  background: string;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  theme: "light" | "dark";
};

export type OverlayStore = {
  nodes: WidgetNode[];
  edges: Edge[];
  settings: OverlaySettings;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: any) => void;
  removeNode: (id: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  updateSettings: (settings: Partial<OverlaySettings>) => void;
  saveToSupabase: (userId: string, token: string) => Promise<boolean>;
  loadFromSupabase: (userId: string, token: string) => Promise<boolean>;
};
