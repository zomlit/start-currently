console.log("🎮 Offscreen document loaded");

let supabaseClient = null;
let gamepadChannel = null;
let isInitialized = false;
let lastState = null;
let pollInterval = null;
const DEADZONE = 0.05;

// Initialize Supabase
async function initGamepadMonitoring(channelId) {
  if (isInitialized) {
    console.log("Already initialized, skipping...");
    return;
  }

  try {
    console.log("Using channel:", channelId);

    // Only create Supabase client once
    if (!supabaseClient) {
      supabaseClient = window.supabase.createClient(
        "https://aliddllzqrcpzhiouryw.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsaWRkbGx6cXJjcHpoaW91cnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ1MTE0ODMsImV4cCI6MjA0MDA4NzQ4M30.B20L4mu4OqD9tgdYChGZLpGuPswe7iT3MPCy4-PLGEw"
      );
    }

    // Clean up existing channel if any
    if (gamepadChannel) {
      await gamepadChannel.unsubscribe();
    }

    // Create new channel
    gamepadChannel = supabaseClient
      .channel(channelId)
      .subscribe((status) => console.log("Supabase status:", status));

    // Start gamepad polling
    if (pollInterval) {
      clearInterval(pollInterval);
    }

    pollInterval = setInterval(pollGamepads, 16); // ~60fps

    // Handle gamepad connections
    window.addEventListener("gamepadconnected", (e) => {
      console.log("🎮 Gamepad connected:", {
        id: e.gamepad.id,
        index: e.gamepad.index,
      });
    });

    window.addEventListener("gamepaddisconnected", (e) => {
      console.log("🎮 Gamepad disconnected:", {
        id: e.gamepad.id,
        index: e.gamepad.index,
      });
      lastState = null;
    });

    isInitialized = true;
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

function pollGamepads() {
  try {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0];

    if (gamepad) {
      const state = {
        buttons: gamepad.buttons.map((btn) => ({
          pressed: btn.pressed,
          value: btn.value || (btn.pressed ? 1 : 0),
        })),
        axes: gamepad.axes.map((axis) =>
          Math.abs(axis) < DEADZONE ? 0 : axis
        ),
        timestamp: Date.now(),
      };

      // Check for significant changes
      const hasChanged = !lastState || hasSignificantChange(lastState, state);
      const hasActivity =
        state.buttons.some((btn) => btn.pressed) ||
        state.axes.some((axis) => Math.abs(axis) > DEADZONE);

      if (hasActivity || hasChanged) {
        console.log("🎮 State update:", {
          buttons: state.buttons.map((b) => b.pressed),
          axes: state.axes.map((a) =>
            Math.abs(a) > DEADZONE ? a.toFixed(2) : "0"
          ),
        });

        // Send to extension
        chrome.runtime.sendMessage({
          type: "GAMEPAD_STATE",
          state,
          timestamp: Date.now(),
        });

        // Send to Supabase
        if (gamepadChannel) {
          gamepadChannel
            .send({
              type: "broadcast",
              event: "gamepadState",
              payload: { gamepadState: state },
            })
            .catch((error) => console.error("Supabase send error:", error));
        }

        lastState = state;
      }
    }
  } catch (error) {
    console.error("Poll error:", error);
  }
}

// Helper to check for significant changes
function hasSignificantChange(oldState, newState) {
  // Check buttons
  const hasButtonChanges = newState.buttons.some(
    (button, index) => button.pressed !== oldState.buttons[index].pressed
  );
  if (hasButtonChanges) return true;

  // Check axes
  return newState.axes.some((axis, index) => {
    const oldAxis = oldState.axes[index];
    const isAboveDeadzone =
      Math.abs(axis) > DEADZONE || Math.abs(oldAxis) > DEADZONE;
    const hasDifferentValue = Math.abs(axis - oldAxis) > 0.01;
    return isAboveDeadzone && hasDifferentValue;
  });
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "INIT_CHANNEL") {
    console.log("Received channel ID:", message.channelId);
    initGamepadMonitoring(message.channelId);
  }
});

// Request channel ID from background script
chrome.runtime.sendMessage({ type: "GET_CHANNEL_ID" });
