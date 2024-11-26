console.log("🎮 Offscreen script starting");

// Import config
const { config } = await import("./dist/config.js");

let supabaseClient = null;
let gamepadChannel = null;
let isInitialized = false;
let lastState = null;
let pollInterval = null;
const DEADZONE = 0.15;
const FRAME_TIME = 1000 / 120;
let lastFrameTime = 0;
let frameId = null;
let lastStateUpdate = 0;
let lastButtonStates = new Map();

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
        config.SUPABASE_URL,
        config.SUPABASE_ANON_KEY
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
    const now = performance.now();
    const timeSinceLastFrame = now - lastFrameTime;

    // Maintain consistent frame rate
    if (timeSinceLastFrame < FRAME_TIME) {
      frameId = requestAnimationFrame(pollGamepads);
      return;
    }

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0];

    if (gamepad) {
      const state = {
        buttons: gamepad.buttons.map((btn, index) => {
          const lastButtonState = lastButtonStates.get(index);
          const isPressed = btn.pressed;

          // Handle button press
          if (isPressed) {
            lastButtonStates.set(index, {
              pressed: true,
              timestamp: now,
              value: btn.value || 1,
            });
            return { pressed: true, value: btn.value || 1 };
          }

          // Handle button release - IMPORTANT: Always send release state
          if (!isPressed) {
            // If it was previously pressed, we need to send the release
            if (lastButtonState?.pressed) {
              lastButtonStates.delete(index);
              // Force an update on release
              lastState = null;
            }
            return { pressed: false, value: 0 };
          }

          return { pressed: false, value: 0 };
        }),
        axes: gamepad.axes.map((axis) => {
          const absAxis = Math.abs(axis);
          if (absAxis < DEADZONE) return 0;
          const normalizedAxis =
            Math.sign(axis) * ((absAxis - DEADZONE) / (1 - DEADZONE));
          return Number(normalizedAxis.toFixed(3));
        }),
        timestamp: now,
      };

      // Send if there's activity OR if any button was just released
      const hasActivity =
        state.buttons.some((btn) => btn.pressed) ||
        state.axes.some((axis) => Math.abs(axis) > 0);

      const hasButtonRelease = lastState?.buttons.some(
        (btn, i) => btn.pressed && !state.buttons[i].pressed
      );

      if (hasActivity || hasButtonRelease || !lastState) {
        // Send to extension
        chrome.runtime.sendMessage({
          type: "GAMEPAD_STATE",
          state,
          timestamp: now,
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

      lastFrameTime = now;
    }

    frameId = requestAnimationFrame(pollGamepads);
  } catch (error) {
    console.error("Poll error:", error);
    frameId = requestAnimationFrame(pollGamepads);
  }
}

// Helper to detect significant axis changes
function hasSignificantAxisChange(oldState, newState) {
  if (!oldState) return true;

  return newState.axes.some((axis, index) => {
    const oldAxis = oldState.axes[index];
    const diff = Math.abs(axis - oldAxis);
    return diff > 0.01; // Small threshold for axis changes
  });
}

// Start polling with requestAnimationFrame
function startPolling() {
  if (!frameId) {
    lastFrameTime = performance.now();
    pollGamepads();
  }
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
