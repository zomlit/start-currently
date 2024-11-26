// Add reload handling
let registrationInterval;

const registerContentScript = () => {
  console.log("[Content] Registering content script");
  try {
    chrome.runtime.sendMessage(
      {
        type: "CONTENT_SCRIPT_READY",
        url: window.location.href,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "[Content] Registration failed:",
            chrome.runtime.lastError
          );
          // If extension is reloading, retry after a delay
          setTimeout(registerContentScript, 1000);
        } else {
          console.log("[Content] Registration successful:", response);
        }
      }
    );
  } catch (error) {
    console.error("[Content] Registration error:", error);
    // If extension is reloading, retry after a delay
    setTimeout(registerContentScript, 1000);
  }
};

// Start registration process
const startRegistration = () => {
  // Clear existing interval if any
  if (registrationInterval) {
    clearInterval(registrationInterval);
  }

  // Register immediately
  registerContentScript();

  // Set up periodic registration
  registrationInterval = setInterval(registerContentScript, 5000);
};

// Start initial registration
startRegistration();

// Handle extension reload
const handleExtensionReload = () => {
  console.log("[Content] Extension reload detected");
  // Clear existing interval
  if (registrationInterval) {
    clearInterval(registrationInterval);
  }
  // Restart registration process
  setTimeout(startRegistration, 1000);
};

// Add error handler for extension invalidation
try {
  chrome.runtime.onMessage.addListener(() => {
    if (chrome.runtime.lastError) {
      handleExtensionReload();
    }
  });
} catch (error) {
  handleExtensionReload();
}

// Update message listener to handle CHANNEL_READY
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Content] Received message:", message, "from:", sender);

  if (message.type === "CHANNEL_READY") {
    console.log("[Content] Forwarding channel ready to webpage");
    window.postMessage(
      {
        source: "GAMEPAD_EXTENSION",
        type: "CHANNEL_READY",
        channelId: message.channelId,
        username: message.username,
      },
      window.location.origin
    );
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "PING") {
    console.log("[Content] Responding to ping");
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "GAMEPAD_STATE") {
    console.log("[Content] Processing gamepad state:", message.state);

    const forwardedMessage = {
      source: "GAMEPAD_EXTENSION",
      type: "GAMEPAD_STATE",
      state: {
        buttons: message.state.buttons,
        axes: message.state.axes,
        timestamp: message.timestamp || Date.now(),
      },
    };

    console.log("[Content] Forwarding to webpage:", forwardedMessage);

    // Try multiple times to ensure delivery
    const attempts = [
      () => window.postMessage(forwardedMessage, window.location.origin),
      () => window.postMessage(forwardedMessage, "*"),
      () => window.top?.postMessage(forwardedMessage, "*"),
      () => window.parent?.postMessage(forwardedMessage, "*"),
    ];

    for (const attempt of attempts) {
      try {
        attempt();
      } catch (error) {
        console.error("[Content] Forward attempt failed:", error);
      }
    }

    sendResponse({ success: true });
    return true;
  }

  return true; // Keep the message channel open
});

// Announce content script is ready immediately
console.log("[Content] Script loaded and ready");
window.postMessage(
  {
    source: "GAMEPAD_EXTENSION",
    type: "CONTENT_SCRIPT_READY",
    extensionId: chrome.runtime.id,
  },
  "*"
);

// Keep connection alive
setInterval(() => {
  chrome.runtime.sendMessage({ type: "PING" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("[Content] Connection lost:", chrome.runtime.lastError);
      const errorMessage = {
        source: "GAMEPAD_EXTENSION",
        type: "EXTENSION_ERROR",
        error: chrome.runtime.lastError,
      };
      try {
        window.postMessage(errorMessage, window.location.origin);
        window.postMessage(errorMessage, "*");
      } catch (error) {
        console.error("[Content] Failed to send error message:", error);
      }
    }
  });
}, 5000);
