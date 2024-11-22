import { create } from "zustand";
import type { GamepadState } from "@/types/gamepad";

interface GamepadStore {
  gamepadState: GamepadState | null;
  isConnected: boolean;
  setGamepadState: (state: GamepadState | null) => void;
  setIsConnected: (connected: boolean) => void;
}

export const useGamepadStore = create<GamepadStore>((set) => ({
  gamepadState: null,
  isConnected: false,
  setGamepadState: (state) => set({ gamepadState: state }),
  setIsConnected: (connected) => set({ isConnected: connected }),
}));
