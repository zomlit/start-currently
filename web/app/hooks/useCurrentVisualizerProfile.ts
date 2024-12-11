import { create } from "zustand";
import type { VisualizerProfile } from "@/schemas/visualizer";
import { defaultProfile } from "@/schemas/visualizer";

interface CurrentProfileState {
  profile: VisualizerProfile;
  setProfile: (profile: VisualizerProfile) => void;
}

export const useCurrentVisualizerProfile = create<CurrentProfileState>(
  (set) => ({
    profile: defaultProfile,
    setProfile: (profile) => set({ profile }),
  })
);
