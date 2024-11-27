// State management - declare once at the top
const STATE = {
  isMonitoringEnabled: true,
  lastGamepadState: null,
  isReloading: false,
  isRegistered: false,
  registrationTimeout: null,
};

// Load initial state
chrome.storage.sync.get(["enabled"], (result) => {
  STATE.isMonitoringEnabled = result.enabled !== false;
  console.log("[Content] Loaded initial state:", STATE.isMonitoringEnabled);
});

function handleGamepadState(message, sendResponse) {
  if (!STATE.isMonitoringEnabled) {
    sendResponse({ success: true });
    return;
  }

  // Create normalized state
  const normalizedState = {
    buttons: message.state.buttons.map((b) => ({
      pressed: !!b.pressed,
      value: Number(b.value || 0),
      touched: !!b.touched,
    })),
    axes: message.state.axes.map((axis) => {
      const value = Number(axis || 0);
      return Math.abs(value) < 0.1 ? 0 : value; // Apply deadzone
    }),
    timestamp: message.timestamp || Date.now(),
    connected: true,
  };

  // Forward state to webpage immediately
  window.postMessage(
    {
      source: "GAMEPAD_EXTENSION",
      type: "GAMEPAD_STATE",
      state: normalizedState,
    },
    window.location.origin
  );

  // Also send connection state
  window.postMessage(
    {
      source: "GAMEPAD_EXTENSION",
      type: "GAMEPAD_CONNECTION_STATE",
      connected: true,
    },
    window.location.origin
  );

  // Log state for debugging
  console.log("[Content] Forwarding gamepad state:", {
    buttons: normalizedState.buttons.filter((b) => b.pressed).length,
    axes: normalizedState.axes.filter((a) => Math.abs(a) > 0.1),
  });

  // Update last state
  STATE.lastGamepadState = normalizedState;

  sendResponse({ success: true });
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Content] Received message:", message.type);

  switch (message.type) {
    case "GAMEPAD_STATE":
      handleGamepadState(message, sendResponse);
      break;

    case "MONITORING_STATE_CHANGED":
      STATE.isMonitoringEnabled = message.enabled;
      console.log(
        "[Content] Monitoring state changed:",
        STATE.isMonitoringEnabled
      );

      // Send state to webpage
      window.postMessage(
        {
          source: "GAMEPAD_EXTENSION",
          type: "MONITORING_STATE_CHANGED",
          enabled: STATE.isMonitoringEnabled,
        },
        window.location.origin
      );

      // If disabled, send final state
      if (!STATE.isMonitoringEnabled) {
        window.postMessage(
          {
            source: "GAMEPAD_EXTENSION",
            type: "GAMEPAD_STATE",
            state: {
              buttons: Array(16).fill({
                pressed: false,
                value: 0,
                touched: false,
              }),
              axes: Array(4).fill(0),
              timestamp: Date.now(),
              final: true,
              connected: false,
            },
          },
          window.location.origin
        );
      }

      sendResponse({ success: true });
      break;

    case "CONTENT_SCRIPT_READY":
      if (!STATE.isRegistered) {
        STATE.isRegistered = true;
        console.log("[Content] Content script registered");
        sendResponse({ success: true });
      } else {
        console.log("[Content] Already registered");
        sendResponse({ success: false, error: "Already registered" });
      }
      break;

    default:
      console.log("[Content] Unknown message type:", message.type);
      sendResponse({ success: false, error: "Unknown message type" });
  }

  return true;
});

// Add initialization message
console.log(
  "[Content] Content script initialized with monitoring:",
  STATE.isMonitoringEnabled
);

// Send ready message
chrome.runtime.sendMessage(
  { type: "CONTENT_SCRIPT_READY", url: window.location.href },
  (response) => {
    if (chrome.runtime.lastError) {
      console.error("[Content] Registration failed:", chrome.runtime.lastError);
    } else {
      console.log("[Content] Registration successful:", response);
    }
  }
);
