import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useUser } from "@clerk/tanstack-start";
import type {
  RealtimeChannel,
  RealtimeChannelSendResponse,
} from "@supabase/supabase-js";
import { RealtimeClient } from "@supabase/supabase-js";
import {
  GamepadState,
  hasSignificantChange,
  DEFAULT_DEADZONE,
} from "@/utils/gamepad";
import { toast } from "@/utils/toast";
import type { chrome } from "@/types/chrome";

// Add extension types
interface ExtensionMessage {
  type: string;
  username?: string;
}

interface ExtensionResponse {
  success: boolean;
  channelId?: string;
  id?: string;
}

// Update the context type
interface GamepadContextType {
  gamepadState: GamepadState | null;
  isConnected: boolean;
  isExtensionEnabled: boolean;
  extensionId: string | null;
  setEnabled: (enabled: boolean) => void;
  toggleExtension: () => void;
}

const GamepadContext = createContext<GamepadContextType>({
  gamepadState: null,
  isConnected: false,
  isExtensionEnabled: false,
  extensionId: null,
  setEnabled: () => {},
  toggleExtension: () => {},
});

// Create a new RealtimeClient with worker and heartbeat config
const realtime = new RealtimeClient(
  `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/realtime/v1/websocket`,
  {
    params: {
      apikey: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
      vsn: "1.0.0",
    },
    worker: true,
    heartbeatIntervalMs: 25000,
    timeout: 30000,
  }
);

// Add worker type
declare const Worker: {
  new (
    stringUrl: string,
    options?: { type?: "classic" | "module" | "shared" }
  ): Worker;
};

// Add zero timeout implementation
const setupZeroTimeout = () => {
  const timeouts: Function[] = [];
  const messageName = "zero-timeout-message";

  window.addEventListener(
    "message",
    (event) => {
      if (event.source === window && event.data === messageName) {
        event.stopPropagation();
        if (timeouts.length > 0) {
          const fn = timeouts.shift();
          fn?.();
        }
      }
    },
    true
  );

  return (fn: Function) => {
    timeouts.push(fn);
    window.postMessage(messageName, "*");
  };
};

// Add Chrome extension types
declare global {
  // Extend Window interface without conflicting with existing chrome definition
  interface Window {
    // Only declare the specific parts of chrome API we use
    __CHROME_EXTENSION__?: {
      runtime?: {
        sendMessage: (
          extensionId: string,
          message: unknown,
          callback?: (response: unknown) => void
        ) => void;
        onMessage: {
          addListener: (
            callback: (
              message: unknown,
              sender: { id?: string },
              sendResponse: (response?: unknown) => void
            ) => void
          ) => void;
          removeListener: (callback: unknown) => void;
        };
      };
    };
  }
}

// Update the getExtensionId function to use the environment variable directly
const getExtensionId = async (): Promise<string | null> => {
  if (typeof window === "undefined" || !window?.chrome?.runtime) {
    console.log("Chrome extension API not available");
    return null;
  }

  try {
    const extensionId = import.meta.env.VITE_CHROME_EXTENSION_ID;

    if (!extensionId) {
      console.error("Extension ID not configured in environment variables");
      return null;
    }

    // Verify connection with extension
    return new Promise((resolve) => {
      let hasResponded = false;

      const timeout = setTimeout(() => {
        if (!hasResponded) {
          console.error("Extension connection timed out");
          resolve(null);
        }
      }, 5000);

      window.chrome?.runtime?.sendMessage(
        extensionId,
        { type: "GET_EXTENSION_ID" },
        (response) => {
          hasResponded = true;
          clearTimeout(timeout);

          if (window.chrome?.runtime?.lastError) {
            console.error(
              "Extension connection error:",
              window.chrome.runtime.lastError
            );
            resolve(null);
            return;
          }

          if (response?.success && response?.id === extensionId) {
            console.log("Extension connected with ID:", response.id);
            resolve(response.id);
          } else {
            console.error("Invalid extension response:", response);
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    console.error("Error checking extension:", error);
    return null;
  }
};

// Update extension message handling
const setupExtensionListeners = (
  extensionId: string,
  callback: (state: GamepadState) => void
) => {
  if (!window.chrome?.runtime?.onMessage) return () => {};

  const handleMessage = (
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    if (sender.id !== extensionId) return;

    if (message.type === "GAMEPAD_STATE" && message.state) {
      callback(message.state);
    }
    sendResponse({ received: true });
  };

  window.chrome?.runtime?.onMessage.addListener(handleMessage);
  return () => window.chrome?.runtime?.onMessage.removeListener(handleMessage);
};

export function GamepadProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const workerRef = useRef<SharedWorker | null>(null);
  const [gamepadState, setGamepadState] = useState<GamepadState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [extensionId, setExtensionId] = useState<string | null>(null);
  const [isExtensionEnabled, setIsExtensionEnabled] = useState(false);
  const lastStateRef = useRef<GamepadState | null>(null);
  const [isEnabled, setEnabled] = useState(true);
  const chromeApiRef = useRef<Window["__CHROME_EXTENSION__"]>(undefined);

  // Initialize chromeApi after mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      chromeApiRef.current = window.__CHROME_EXTENSION__;
    }
  }, []);

  // Move hasStateChanged before other hooks that use it
  const hasStateChanged = useCallback(
    (oldState: GamepadState | null, newState: GamepadState) => {
      if (!oldState) return true;

      // Check for significant changes
      const hasButtonChanges = newState.buttons.some(
        (button, index) => button.pressed !== oldState.buttons[index]?.pressed
      );

      const hasAxisChanges = newState.axes.some((axis, index) => {
        const oldAxis = oldState.axes[index] || 0;
        return Math.abs(axis - oldAxis) > DEFAULT_DEADZONE;
      });

      return hasButtonChanges || hasAxisChanges;
    },
    []
  );

  // Move broadcastState after hasStateChanged
  const broadcastState = useCallback(
    (state: GamepadState) => {
      if (channelRef.current && user?.username) {
        console.log("[GamepadProvider] Broadcasting state:", {
          buttons: state.buttons.map((b) => b.pressed),
          axes: state.axes.map((a) =>
            Math.abs(a) > DEFAULT_DEADZONE ? a.toFixed(2) : "0"
          ),
          timestamp: state.timestamp,
        });

        channelRef.current
          .send({
            type: "broadcast",
            event: "gamepadState",
            payload: { gamepadState: state },
          })
          .catch((error: any) => {
            if (!error?.message?.includes("429")) {
              console.error("[GamepadProvider] Broadcast error:", error);
            }
          });
      }
    },
    [user?.username]
  );

  // Check for extension on mount
  useEffect(() => {
    getExtensionId().then((id) => {
      setExtensionId(id);
      setIsExtensionEnabled(!!id);
    });
  }, []);

  // Update the extension setup effect
  useEffect(() => {
    if (!user?.username || !isExtensionEnabled) return;

    console.log("Checking extension availability...");

    // Function to attempt connection with an extension ID
    const attemptConnection = async (id: string, isBackup = false) => {
      if (id) {
        console.log("Extension found, setting up channel...");
        setExtensionId(id);

        // Setup channel with extension
        return new Promise((resolve) => {
          window.chrome?.runtime?.sendMessage(
            id,
            {
              type: "SETUP_GAMEPAD_CHANNEL",
              username: user.username,
            } as ExtensionMessage,
            (response: ExtensionResponse) => {
              if (window.chrome?.runtime?.lastError) {
                console.error(
                  "Failed to setup extension channel:",
                  window.chrome.runtime.lastError
                );
                resolve(false);
                return;
              }

              if (response?.success) {
                console.log(
                  "Extension channel setup successful:",
                  response.channelId
                );

                // Setup message listener
                const messageListener = (
                  message: any,
                  sender: chrome.runtime.MessageSender,
                  sendResponse: (response?: any) => void
                ) => {
                  // Only process messages from our extension
                  if (sender.id !== id) return;

                  if (message.type === "GAMEPAD_STATE" && message.state) {
                    const state: GamepadState = {
                      buttons: message.state.buttons.map((button: any) => ({
                        pressed: button.pressed,
                        value: button.value || (button.pressed ? 1 : 0),
                      })),
                      axes: message.state.axes,
                      timestamp: Date.now(),
                    };

                    console.log(
                      "[GamepadProvider] Received gamepad state:",
                      state
                    );
                    setGamepadState(state);
                    setIsConnected(true);
                    lastStateRef.current = state;
                    broadcastState(state);
                  }

                  // Always send a response
                  sendResponse({ received: true });
                };

                // Add the listener
                if (window.chrome?.runtime?.onMessage) {
                  window.chrome.runtime.onMessage.addListener(messageListener);
                  console.log("[GamepadProvider] Added message listener");
                }
                resolve(true);
              } else {
                console.error("Extension setup failed:", response);
                resolve(false);
              }
            }
          );
        });
      } else {
        console.log(
          `Extension ${isBackup ? "backup " : ""}not found, disabling...`
        );
        return false;
      }
    };

    const connectWithFallback = async () => {
      // getExtensionId will now automatically try backup if primary fails
      const extensionId = await getExtensionId();
      if (!extensionId) {
        console.log("No extension available (tried both primary and backup)");
        setIsExtensionEnabled(false);
        return false;
      }

      const success = await attemptConnection(extensionId);
      if (!success) {
        console.log("Failed to connect to extension");
        setIsExtensionEnabled(false);
        return false;
      }

      return true;
    };

    connectWithFallback().catch((error) => {
      console.error("Error during extension connection:", error);
      setIsExtensionEnabled(false);
    });
  }, [user?.username, isExtensionEnabled, broadcastState]);

  // Update the polling effect to ensure it broadcasts to Supabase
  useEffect(() => {
    if (!isEnabled || !user?.username) return;

    // If extension is not available, use web API
    if (!isExtensionEnabled) {
      const setZeroTimeout = setupZeroTimeout();
      let isPolling = true;

      const pollGamepad = () => {
        if (!isPolling) return;

        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[0];

        if (gamepad) {
          const state: GamepadState = {
            buttons: gamepad.buttons.map((button, index) => ({
              pressed: button.pressed,
              value:
                index === 6 || index === 7
                  ? button.value
                  : button.pressed
                    ? 1
                    : 0,
            })),
            axes: gamepad.axes.map((axis) =>
              Math.abs(axis) < DEFAULT_DEADZONE ? 0 : axis
            ),
            timestamp: Date.now(),
          };

          // Only update if state has changed significantly
          if (hasStateChanged(lastStateRef.current, state)) {
            console.log("[GamepadProvider] Web API state update:", state);
            setGamepadState(state);
            lastStateRef.current = state;
            broadcastState(state);
          }
        }

        // Schedule next poll immediately
        setZeroTimeout(pollGamepad);
      };

      // Start polling
      setZeroTimeout(pollGamepad);

      // Handle gamepad connect/disconnect
      const handleGamepadConnected = () => {
        console.log("[GamepadProvider] Gamepad connected via Web API");
        setIsConnected(true);
        isPolling = true;
        setZeroTimeout(pollGamepad);
      };

      const handleGamepadDisconnected = () => {
        console.log("[GamepadProvider] Gamepad disconnected via Web API");
        setIsConnected(false);
        isPolling = false;
      };

      window.addEventListener("gamepadconnected", handleGamepadConnected);
      window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

      // Check if gamepad is already connected
      const gamepads = navigator.getGamepads();
      if (gamepads[0]) {
        handleGamepadConnected();
      }

      return () => {
        isPolling = false;
        window.removeEventListener("gamepadconnected", handleGamepadConnected);
        window.removeEventListener(
          "gamepaddisconnected",
          handleGamepadDisconnected
        );
      };
    }
  }, [
    isEnabled,
    isExtensionEnabled,
    user?.username,
    hasStateChanged,
    broadcastState,
  ]);

  // Update the shared worker message handler
  useEffect(() => {
    if (!user?.id || !isEnabled) return;

    try {
      // Initialize SharedWorker
      const worker = new SharedWorker(
        new URL("../workers/gamepad.shared.worker.ts", import.meta.url),
        { type: "module" }
      );

      worker.port.start();
      workerRef.current = worker;

      // Initialize worker with user info
      worker.port.postMessage({
        type: "INIT",
        userId: user.id,
        username: user.username,
        isPublic: false,
      });

      // Handle messages from worker
      worker.port.onmessage = (event) => {
        const { type, state } = event.data;

        switch (type) {
          case "BROADCAST_STATE":
            if (state) {
              console.log(
                "[GamepadProvider] Broadcasting state from worker:",
                state
              );
              setGamepadState(state);
              broadcastState(state);
            }
            break;

          case "DEBUG_LOG":
            console.log("[Worker]", event.data.message);
            break;
        }
      };

      // Error handling
      worker.onerror = (error) => {
        console.error("[Worker Error]", error);
      };

      return () => {
        if (workerRef.current) {
          workerRef.current.port.postMessage({ type: "CLEANUP" });
          workerRef.current = null;
        }
      };
    } catch (error) {
      console.error("Failed to initialize SharedWorker:", error);
    }
  }, [user?.id, user?.username, isEnabled, broadcastState]);

  // Update the Supabase channel setup
  useEffect(() => {
    if (!user?.id || !user?.username) return;

    // Use consistent channel naming
    const channelName = `gamepad:${user.username}`;
    console.log("[GamepadProvider] Setting up channel:", channelName);

    const channel = realtime.channel(channelName, {
      config: {
        broadcast: { self: false },
        presence: {
          key: user.id,
        },
      },
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channelRef.current = channel;
        console.log("[Channel] Connected successfully to:", channelName);
      } else {
        console.log("[Channel] Status for", channelName, ":", status);
      }
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
      if (channelRef.current) {
        channelRef.current
          .send({
            type: "broadcast",
            event: "gamepadState",
            payload: { timestamp: Date.now() },
          })
          .catch((error) => {
            if (!error?.message?.includes("429")) {
              console.error(
                "[Channel] Keep-alive error for",
                channelName,
                ":",
                error
              );
            }
          });
      }
    }, 15000);

    return () => {
      clearInterval(keepAlive);
      if (channelRef.current) {
        console.log("[Channel] Cleaning up channel:", channelName);
        channel.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [user?.id, user?.username]);

  // Only log state changes when they happen
  useEffect(() => {
    if (gamepadState) {
      const hasActivity =
        gamepadState.buttons.some((b) => b.pressed) ||
        gamepadState.axes.some((a) => Math.abs(a) > DEFAULT_DEADZONE);
      if (hasActivity) {
        console.log("[GamepadProvider] State update:", {
          buttons: gamepadState.buttons.map((b) => b.pressed),
          axes: gamepadState.axes.map((a) => a.toFixed(2)),
        });
      }
    }
  }, [gamepadState]);

  // Update the toggleExtension callback to handle errors better
  const toggleExtension = useCallback(() => {
    if (!isExtensionEnabled && user?.username) {
      // When enabling, check if extension exists first
      getExtensionId().then((id) => {
        if (id) {
          console.log("Extension found, enabling...");
          setExtensionId(id);
          setIsExtensionEnabled(true);
        } else {
          console.log("Extension not found, cannot enable");
          toast.error(
            "Chrome extension not found. Please make sure the extension is installed and enabled."
          );
        }
      });
    } else {
      // When disabling, just turn it off
      console.log("Disabling extension...");
      setIsExtensionEnabled(false);
      setExtensionId(null);
    }
  }, [isExtensionEnabled, user?.username]);

  // Add message listener for extension events
  useEffect(() => {
    if (!isExtensionEnabled) return;

    const handleExtensionMessage = (event: MessageEvent) => {
      // Only accept messages from our extension
      if (event.data.source !== "GAMEPAD_EXTENSION") return;

      console.log("[GamepadProvider] Received extension message:", event.data);

      switch (event.data.type) {
        case "GAMEPAD_STATE":
          const state: GamepadState = {
            buttons: event.data.state.buttons.map((button: any) => ({
              pressed: button.pressed,
              value: button.value || (button.pressed ? 1 : 0),
            })),
            axes: event.data.state.axes,
            timestamp: event.data.timestamp,
          };

          console.log("[GamepadProvider] Processing gamepad state:", state);
          setGamepadState(state);
          setIsConnected(true);
          lastStateRef.current = state;
          broadcastState(state);
          break;

        case "CONTENT_SCRIPT_READY":
          console.log("[GamepadProvider] Content script ready");
          break;
      }
    };

    window.addEventListener("message", handleExtensionMessage);

    return () => {
      window.removeEventListener("message", handleExtensionMessage);
    };
  }, [isExtensionEnabled, broadcastState]);

  // Update the message handling effect
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Accept messages from any origin during development
      if (event.data.source !== "GAMEPAD_EXTENSION") return;

      console.log("[GamepadProvider] Received message:", event.data);

      switch (event.data.type) {
        case "GAMEPAD_STATE":
          try {
            const state: GamepadState = {
              buttons: event.data.state.buttons.map((button: any) => ({
                pressed: button.pressed,
                value: button.value || (button.pressed ? 1 : 0),
              })),
              axes: event.data.state.axes,
              timestamp: event.data.timestamp,
            };

            console.log("[GamepadProvider] Processing gamepad state:", state);
            setGamepadState(state);
            setIsConnected(true);
            lastStateRef.current = state;
            broadcastState(state);
          } catch (error) {
            console.error("[GamepadProvider] Failed to process state:", error);
          }
          break;

        case "CONTENT_SCRIPT_READY":
          console.log("[GamepadProvider] Content script ready");
          break;

        case "EXTENSION_ERROR":
          console.error("[GamepadProvider] Extension error:", event.data.error);
          setIsConnected(false);
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [broadcastState]);

  // Update context value
  const value = useMemo(
    () => ({
      gamepadState,
      isConnected: !!gamepadState,
      isExtensionEnabled,
      extensionId,
      setEnabled,
      toggleExtension,
    }),
    [gamepadState, isExtensionEnabled, toggleExtension, extensionId]
  );

  console.log("[GamepadProvider] Current state:", {
    gamepadState,
    isConnected,
  });

  useEffect(() => {
    console.log(
      "Current extension ID:",
      import.meta.env.VITE_CHROME_EXTENSION_ID
    );
  }, []);

  return (
    <GamepadContext.Provider value={value}>{children}</GamepadContext.Provider>
  );
}

export const useGamepadContext = () => useContext(GamepadContext);

export function useGamepadProvider() {
  const context = useContext(GamepadContext);
  if (!context) {
    throw new Error("useGamepadProvider must be used within GamepadProvider");
  }
  return {
    gamepadState: context.gamepadState,
    isConnected: context.isConnected,
    isExtensionEnabled: context.isExtensionEnabled,
    extensionId: context.extensionId,
    setEnabled: context.setEnabled,
    toggleExtension: context.toggleExtension,
  };
}
