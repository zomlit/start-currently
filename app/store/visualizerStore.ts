import { create } from "zustand";

interface VisualizerStore {
  selectedProfileId: string | null;
  setSelectedProfileId: (id: string | null) => void;
}

export const useVisualizerStore = create<VisualizerStore>((set) => ({
  selectedProfileId: null,
  setSelectedProfileId: (id) => set({ selectedProfileId: id }),
}));
