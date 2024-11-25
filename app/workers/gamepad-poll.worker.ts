/// <reference lib="webworker" />

import type { GamepadState } from "@/types/gamepad";

let lastState: GamepadState | null = null;
let isPolling = false;
const DEADZONE = 0.05;

// Add helper to detect meaningful changes
const hasSignificantChange = (
  oldState: GamepadState | null,
  newState: GamepadState
) => {
  if (!oldState) return true;

  // Check buttons
  const hasButtonChange = newState.buttons.some(
    (button, index) => button.pressed !== oldState.buttons[index].pressed
  );
  if (hasButtonChange) return true;

  // Check axes - only report if above deadzone
  const hasAxisChange = newState.axes.some((axis, index) => {
    const oldAxis = oldState.axes[index];
    const isAboveDeadzone =
      Math.abs(axis) > DEADZONE || Math.abs(oldAxis) > DEADZONE;
    const hasDifferentValue = Math.abs(axis - oldAxis) > 0.01;
    return isAboveDeadzone && hasDifferentValue;
  });

  return hasAxisChange;
};

// Handle messages from main thread
self.onmessage = (event) => {
  const { type, state } = event.data;

  switch (type) {
    case "GAMEPAD_EVENT":
      if (state && isPolling) {
        // Only send if there's a meaningful change
        if (!lastState || hasSignificantChange(lastState, state)) {
          lastState = state;
          self.postMessage({
            type: "GAMEPAD_STATE",
            state,
            timestamp: Date.now(),
          });
        }
      }
      break;

    case "START_POLLING":
      isPolling = true;
      break;

    case "STOP_POLLING":
      isPolling = false;
      lastState = null;
      break;
  }
};
