import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Node,
  Edge,
  Connection,
  addEdge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import { OverlaySettings, OverlayStore } from "@/types/overlay";
import { getAuthenticatedClient } from "@/utils/supabase/client";
import { useUser } from "@clerk/tanstack-start";

const defaultSettings: OverlaySettings = {
  resolution: { width: 1920, height: 1080 },
  background: "#000000",
  gridSize: 20,
  snapToGrid: true,
  showGrid: true,
  theme: "dark",
};

export const useOverlayStore = create<OverlayStore>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      settings: defaultSettings,

      addNode: (node: Node) => {
        set((state) => ({ nodes: [...state.nodes, node] }));
      },

      updateNode: (id: string, data: any) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id ? { ...node, data: { ...node.data, ...data } } : node
          ),
        }));
      },

      removeNode: (id: string) => {
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== id),
          edges: state.edges.filter(
            (edge) => edge.source !== id && edge.target !== id
          ),
        }));
      },

      onNodesChange: (changes: NodeChange[]) => {
        set((state) => ({
          nodes: applyNodeChanges(changes, state.nodes),
        }));
      },

      onEdgesChange: (changes: EdgeChange[]) => {
        set((state) => ({
          edges: applyEdgeChanges(changes, state.edges),
        }));
      },

      onConnect: (connection: Connection) => {
        set((state) => ({
          edges: addEdge(connection, state.edges),
        }));
      },

      updateSettings: (settings: Partial<OverlaySettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      saveToSupabase: async (userId: string, token: string) => {
        try {
          if (!userId || !token) {
            console.error("No user ID or token provided");
            return false;
          }

          const supabase = getAuthenticatedClient(token);
          const state = get();

          const { error } = await supabase.from("overlays").upsert(
            {
              user_id: userId,
              nodes: state.nodes,
              edges: state.edges,
              settings: state.settings,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id",
              ignoreDuplicates: false,
            }
          );

          if (error) {
            console.error("Failed to save overlay:", error);
            return false;
          }

          return true;
        } catch (err) {
          console.error("Error saving overlay:", err);
          return false;
        }
      },

      loadFromSupabase: async (userId: string, token: string) => {
        try {
          if (!userId || !token) {
            console.error("No user ID or token provided");
            return false;
          }

          console.log("Loading with token:", token);
          const supabase = getAuthenticatedClient(token);
          const { data, error } = await supabase
            .from("overlays")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          if (error && error.code !== "PGRST116") {
            console.error("Failed to load overlay:", error);
            return false;
          }

          if (data) {
            set({
              nodes: (data.nodes as any) || [],
              edges: (data.edges as any) || [],
              settings: (data.settings as any) || defaultSettings,
            });
          } else {
            const state = get();
            const { error: createError } = await supabase
              .from("overlays")
              .upsert({
                user_id: userId,
                nodes: state.nodes,
                edges: state.edges,
                settings: state.settings,
                updated_at: new Date().toISOString(),
              });

            if (createError) {
              console.error("Failed to create default overlay:", createError);
              return false;
            }
          }

          return true;
        } catch (err) {
          console.error("Error loading overlay:", err);
          return false;
        }
      },
    }),
    {
      name: "overlay-storage",
    }
  )
);
