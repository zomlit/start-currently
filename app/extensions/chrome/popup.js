// Get UI elements
const toggleInput = document.getElementById("toggleExtension");
const connectionStatus = document.getElementById("connectionStatus");
const currentInput = document.getElementById("currentInput");
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
  chrome.storage.sync.set({ enabled }, () => {
    updateStatus(enabled);
    chrome.runtime.sendMessage({ type: "TOGGLE_MONITORING", enabled });
  });
});

function updateStatus(enabled) {
  connectionStatus.className = enabled
    ? "inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-xs font-semibold bg-yellow-500/20 text-yellow-500"
    : "inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-xs font-semibold bg-red-500/20 text-red-500";
  connectionStatus.textContent = enabled ? "Waiting..." : "Disabled";
  currentInput.className = enabled
    ? "text-sm text-white/80 font-medium text-center py-1 rounded bg-white/5 min-h-[28px]"
    : "text-sm text-white/40 font-medium text-center py-1 rounded bg-white/5 min-h-[28px]";
  currentInput.textContent = enabled
    ? "Waiting for input..."
    : "Monitoring paused";
}

// Function to update gamepad display
function updateGamepadDisplay(state) {
  if (!state) {
    connectionStatus.className =
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-xs font-semibold bg-red-500/20 text-red-500";
    connectionStatus.textContent = "Disconnected";
    currentInput.textContent = "No controller detected";
    return;
  }

  // Update connection status
  connectionStatus.className =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-xs font-semibold bg-green-500/20 text-green-500";
  connectionStatus.textContent = "Connected";

  // Get active buttons
  const activeButtons = state.buttons
    .map((button, index) => (button.pressed ? BUTTON_LABELS[index] : null))
    .filter(Boolean);

  // Get active axes
  const activeAxes = state.axes
    .map((axis, index) =>
      Math.abs(axis) > 0.1
        ? `${["LX", "LY", "RX", "RY"][index]}: ${axis.toFixed(2)}`
        : null
    )
    .filter(Boolean);

  // Update current input display
  if (activeButtons.length > 0 || activeAxes.length > 0) {
    currentInput.textContent =
      [...activeButtons, ...activeAxes].join(" + ") || "Waiting for input...";
  } else {
    currentInput.textContent = "Waiting for input...";
  }
}

// Listen for gamepad state updates
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "GAMEPAD_STATE") {
    updateGamepadDisplay(message.state);
  }
});

// Request initial state
chrome.runtime.sendMessage({ type: "GET_GAMEPAD_STATE" });

// Button labels (keep for input display)
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
