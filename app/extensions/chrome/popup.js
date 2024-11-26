// Get UI elements
const toggleInput = document.getElementById("toggleExtension");
const statusText = document.getElementById("status");
const root = document.getElementById("root");

// Ensure visibility when popup opens
if (root && root.classList.contains("loading")) {
  root.classList.remove("loading");
}

// Load initial state
chrome.storage.sync.get(["enabled"], (result) => {
  toggleInput.checked = result.enabled !== false; // Default to true if not set
  updateStatus(result.enabled !== false);
});

// Handle toggle changes
toggleInput.addEventListener("change", (e) => {
  const enabled = e.target.checked;

  // Save state
  chrome.storage.sync.set({ enabled }, () => {
    // Update status after state is saved
    updateStatus(enabled);

    // Notify background script without expecting response
    chrome.runtime.sendMessage({ type: "TOGGLE_MONITORING", enabled });
  });
});

function updateStatus(enabled) {
  statusText.textContent = enabled
    ? "Monitoring gamepad inputs"
    : "Monitoring paused";
  statusText.className = `status ${enabled ? "active" : ""}`;
  gamepadInfo.classList.toggle("opacity-50", !enabled);
  gamepadInfo.classList.toggle("pointer-events-none", !enabled);
}

// Listen for system theme changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    // The theme has changed, but we don't need to do anything
    // since CSS handles the changes automatically
    console.log("Theme changed to:", e.matches ? "dark" : "light");
  });

// Add gamepad state handling
const gamepadInfo = document.getElementById("gamepadInfo");
const connectionStatus = document.getElementById("connectionStatus");
const gamepadName = document.getElementById("gamepadName");
const buttonGrid = document.getElementById("buttonGrid");
const leftStick = document.getElementById("leftStick");
const rightStick = document.getElementById("rightStick");

// Button labels
const BUTTON_LABELS = [
  "A",
  "B",
  "X",
  "Y",
  "LB",
  "RB",
  "LT",
  "RT",
  "Back",
  "Start",
  "LS",
  "RS",
  "↑",
  "↓",
  "←",
  "→",
];

// Create button indicators
BUTTON_LABELS.forEach((label, index) => {
  const button = document.createElement("div");
  button.className =
    "aspect-square rounded bg-white/10 flex items-center justify-center text-xs font-semibold text-white/60 transition-all";
  button.id = `button-${index}`;
  button.textContent = label;
  buttonGrid.appendChild(button);
});

// Function to update gamepad display
function updateGamepadDisplay(state) {
  if (!state) {
    connectionStatus.className =
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-xs font-semibold bg-red-500/20 text-red-500";
    connectionStatus.textContent = "No Controller";
    gamepadName.textContent = "-";
    return;
  }

  connectionStatus.className =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-xs font-semibold bg-green-500/20 text-green-500";
  connectionStatus.textContent = "Connected";
  gamepadName.textContent = state.id || "Generic Gamepad";

  // Update buttons
  state.buttons.forEach((button, index) => {
    const buttonEl = document.getElementById(`button-${index}`);
    if (buttonEl) {
      buttonEl.className = `aspect-square rounded flex items-center justify-center text-xs font-semibold transition-all ${
        button.pressed
          ? "bg-purple-600 text-white scale-95"
          : "bg-white/10 text-white/60"
      }`;
    }
  });

  // Update sticks with more responsive movement
  if (state.axes.length >= 4) {
    const SCALE = 24;

    // Left stick (axes 0-1)
    const leftX = state.axes[0] * SCALE;
    const leftY = state.axes[1] * SCALE;
    leftStick.style.transform = `translate(calc(-50% + ${leftX}px), calc(-50% + ${leftY}px))`;

    // Right stick (axes 2-3)
    const rightX = state.axes[2] * SCALE;
    const rightY = state.axes[3] * SCALE;
    rightStick.style.transform = `translate(calc(-50% + ${rightX}px), calc(-50% + ${rightY}px))`;
  }
}

// Listen for gamepad state updates
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "GAMEPAD_STATE") {
    updateGamepadDisplay(message.state);
  }
  // Don't return true since we don't need to send a response
});

// Request initial state without expecting response
chrome.runtime.sendMessage({ type: "GET_GAMEPAD_STATE" });
