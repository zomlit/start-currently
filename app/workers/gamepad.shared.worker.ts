/// <reference lib="webworker" />

import type { GamepadState } from "@/types/gamepad";

declare const self: SharedWorkerGlobalScope;

const connections = new Set<MessagePort>();
const publicConnections = new Set<MessagePort>();
let lastState: GamepadState | null = null;
let isProcessing = false;
const PROCESS_INTERVAL = 1000 / 60; // 60fps
const DEADZONE = 0.05;
const DEBOUNCE_TIME = 50; // 50ms debounce for button events
const lastButtonEvents = new Map<number, number>(); // Track last event time for each button

// Add helper to check for button state changes with debouncing
const getButtonChanges = (
  oldState: GamepadState | null,
  newState: GamepadState
) => {
  if (!oldState) return { pressed: [], released: [] };

  const now = Date.now();
  const pressed: number[] = [];
  const released: number[] = [];

  newState.buttons.forEach((button, index) => {
    const oldButton = oldState.buttons[index];
    const lastEventTime = lastButtonEvents.get(index) || 0;
    const timeSinceLastEvent = now - lastEventTime;

    // Only process if enough time has passed since last event
    if (timeSinceLastEvent > DEBOUNCE_TIME) {
      if (button.pressed && !oldButton.pressed) {
        pressed.push(index);
        lastButtonEvents.set(index, now);
      } else if (!button.pressed && oldButton.pressed) {
        released.push(index);
        lastButtonEvents.set(index, now);
      }
    }
  });

  return { pressed, released };
};

// Add helper to check for significant changes
const hasSignificantChange = (
  oldState: GamepadState | null,
  newState: GamepadState
): boolean => {
  if (!oldState) return true;

  const { pressed, released } = getButtonChanges(oldState, newState);
  if (pressed.length > 0 || released.length > 0) return true;

  // Check for significant axis changes
  const hasAxisChanges = newState.axes.some((axis, index) => {
    const oldAxis = oldState.axes[index];
    return Math.abs(axis) > DEADZONE || Math.abs(oldAxis) > DEADZONE;
  });

  return hasAxisChanges;
};

// Add helper to check if state has any activity
const hasActivity = (state: GamepadState): boolean => {
  const hasButtonActivity = state.buttons.some((button) => button.pressed);
  const hasAxisActivity = state.axes.some((axis) => Math.abs(axis) > DEADZONE);
  return hasButtonActivity || hasAxisActivity;
};

const broadcast = (message: any, isPublic = false) => {
  const targetConnections = isPublic ? publicConnections : connections;
  if (targetConnections.size === 0) return;

  targetConnections.forEach((port) => {
    try {
      port.postMessage(message);
    } catch (error) {
      console.error("[Worker] Failed to broadcast:", error);
    }
  });
};

// Handle new connections
self.onconnect = (event) => {
  const port = event.ports[0];
  port.start();

  port.onmessage = (event) => {
    const { type, state, userId, username, isPublic } = event.data;

    switch (type) {
      case "INIT":
        if (isPublic) {
          publicConnections.add(port);
          broadcast(
            {
              type: "DEBUG_LOG",
              message: `Public view initialized for user: ${username}`,
              timestamp: Date.now(),
            },
            true
          );
        } else {
          connections.add(port);
          broadcast({
            type: "DEBUG_LOG",
            message: `Worker initialized for user: ${username}`,
            timestamp: Date.now(),
          });
        }
        break;

      case "UPDATE_STATE":
        if (state && !isProcessing) {
          isProcessing = true;

          // Only process if there's actual activity
          if (hasActivity(state)) {
            const { pressed, released } = getButtonChanges(lastState, state);

            // Only broadcast if we have button changes or significant axis movement
            if (
              pressed.length > 0 ||
              released.length > 0 ||
              hasSignificantChange(lastState, state)
            ) {
              lastState = state;

              // Broadcast to both regular and public connections
              const message = {
                type: "BROADCAST_STATE",
                state,
                buttonChanges: { pressed, released },
                timestamp: Date.now(),
              };

              broadcast(message);
              broadcast(message, true);

              // Log button changes
              if (pressed.length > 0) {
                broadcast(
                  {
                    type: "DEBUG_LOG",
                    message: `Buttons pressed: ${pressed.join(", ")}`,
                    timestamp: Date.now(),
                  },
                  true
                );
              }
              if (released.length > 0) {
                broadcast(
                  {
                    type: "DEBUG_LOG",
                    message: `Buttons released: ${released.join(", ")}`,
                    timestamp: Date.now(),
                  },
                  true
                );
              }
            }
          }

          isProcessing = false;
        }
        break;

      case "CLEANUP":
        connections.delete(port);
        publicConnections.delete(port);
        break;
    }
  };
};
