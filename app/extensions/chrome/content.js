// Add destruction event handling
const DESTRUCTION_EVENT = "destroy_gamepad_extension_" + chrome.runtime.id;
let registrationInterval;
let isReconnecting = false;
let currentRetryCount = 0;
const MAX_RETRIES = 5;
const BASE_DELAY = 1000;
let reloadCheckInterval;
let pingInterval;

// Helper to check if extension context is valid
function isContextValid() {
  try {
    chrome.runtime.getURL("");
    return true;
  } catch (error) {
    return false;
  }
}

// Function to reload the extension content script
function reloadContentScript() {
  console.log("[Content] Reloading content script");

  // Reset state
  isReconnecting = false;
  currentRetryCount = 0;

  // Run cleanup with safe guards
  try {
    // Clear intervals safely
    [registrationInterval, reloadCheckInterval, pingInterval].forEach(
      (interval) => {
        if (interval) {
          try {
            clearInterval(interval);
          } catch (error) {
            console.log("[Content] Error clearing interval:", error);
          }
        }
      }
    );

    // Remove listeners safely
    safeRemoveMessageListener(messageHandler);
    try {
      document.removeEventListener(DESTRUCTION_EVENT, destructor);
    } catch (error) {
      console.log("[Content] Error removing destruction listener:", error);
    }
  } catch (error) {
    console.log("[Content] Cleanup error (expected):", error);
  }

  // Reinject the content script using external file
  try {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("reload-script.js");
    script.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  } catch (error) {
    console.error("[Content] Failed to inject reload script:", error);
  }
}

// Define registration functions first
const registerContentScript = async () => {
  if (!isContextValid()) {
    throw new Error("Extension context invalid during registration");
  }

  console.log("[Content] Registering content script");

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Registration timeout"));
    }, 5000);

    try {
      chrome.runtime.sendMessage(
        {
          type: "CONTENT_SCRIPT_READY",
          url: window.location.href,
        },
        (response) => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) {
            console.error(
              "[Content] Registration failed:",
              chrome.runtime.lastError
            );
            reject(chrome.runtime.lastError);
          } else {
            console.log("[Content] Registration successful:", response);
            resolve(response);
          }
        }
      );
    } catch (error) {
      clearTimeout(timeout);
      console.error("[Content] Registration error:", error);
      reject(error);
    }
  });
};

const startRegistration = async () => {
  // Clear existing interval if any
  if (registrationInterval) {
    clearInterval(registrationInterval);
  }

  try {
    // Register immediately
    await registerContentScript();

    // Reset retry count on successful registration
    currentRetryCount = 0;
    isReconnecting = false;

    // Set up periodic registration with context validation
    registrationInterval = setInterval(async () => {
      if (!isContextValid()) {
        clearInterval(registrationInterval);
        reloadContentScript();
        return;
      }
      try {
        await registerContentScript();
      } catch (error) {
        console.error("[Content] Periodic registration failed:", error);
        if (error.message.includes("Extension context invalidated")) {
          reloadContentScript();
        } else {
          handleExtensionReload();
        }
      }
    }, 5000);
  } catch (error) {
    console.error("[Content] Initial registration failed:", error);
    if (error.message.includes("Extension context invalidated")) {
      reloadContentScript();
    } else {
      handleExtensionReload();
    }
  }
};

// Add helper to safely remove message listener
function safeRemoveMessageListener(listener) {
  try {
    if (chrome?.runtime?.onMessage && isContextValid()) {
      chrome.runtime.onMessage.removeListener(listener);
    }
  } catch (error) {
    console.log("[Content] Safe remove listener error (expected):", error);
  }
}

// Update destructor function
function destructor() {
  console.log("[Content] Running destructor");

  // Remove destruction event listener
  try {
    document.removeEventListener(DESTRUCTION_EVENT, destructor);
  } catch (error) {
    console.log("[Content] Error removing destruction listener:", error);
  }

  // Clear intervals safely
  [registrationInterval, reloadCheckInterval, pingInterval].forEach(
    (interval) => {
      if (interval) {
        try {
          clearInterval(interval);
        } catch (error) {
          console.log("[Content] Error clearing interval:", error);
        }
      }
    }
  );

  // Clean up message listeners safely
  safeRemoveMessageListener(messageHandler);

  // Notify webpage about cleanup
  try {
    window.postMessage(
      {
        source: "GAMEPAD_EXTENSION",
        type: "EXTENSION_CLEANUP",
        error: { message: "Extension content script unloading" },
      },
      window.location.origin
    );
  } catch (error) {
    console.error("[Content] Failed to send cleanup message:", error);
  }
}

// Main message handler function
function messageHandler(message, sender, sendResponse) {
  if (chrome.runtime.lastError) {
    handleExtensionReload();
    return;
  }

  console.log("[Content] Received message:", message, "from:", sender);

  try {
    switch (message.type) {
      case "CHANNEL_READY":
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
        break;

      case "PING":
        console.log("[Content] Responding to ping");
        sendResponse({ success: true });
        break;

      case "GAMEPAD_STATE":
        handleGamepadState(message, sendResponse);
        break;

      default:
        console.log("[Content] Unknown message type:", message.type);
        sendResponse({ success: false, error: "Unknown message type" });
    }
  } catch (error) {
    console.error("[Content] Message handler error:", error);
    sendResponse({ success: false, error: error.message });
  }

  return true;
}

// Add helper function for gamepad state handling
function handleGamepadState(message, sendResponse) {
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

  // Use a more reliable message posting mechanism
  queueMicrotask(() => {
    window.postMessage(forwardedMessage, window.location.origin);
  });

  sendResponse({ success: true });
}

// Update main function to handle initialization errors better
function main() {
  console.log("[Content] Initializing content script");

  try {
    // Unload previous content script if needed
    document.dispatchEvent(new CustomEvent(DESTRUCTION_EVENT));

    // Set up destruction listener
    document.addEventListener(DESTRUCTION_EVENT, destructor);

    // Add message listener with context check
    if (isContextValid()) {
      chrome.runtime.onMessage.addListener(messageHandler);
    }

    // Start registration process
    startRegistration();

    // Set up intervals with context validation
    reloadCheckInterval = setInterval(() => {
      if (!isContextValid()) {
        reloadContentScript();
      }
    }, 1000);

    pingInterval = setInterval(() => {
      if (!isContextValid()) {
        reloadContentScript();
        return;
      }
      try {
        chrome.runtime.sendMessage({ type: "PING" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              "[Content] Connection lost:",
              chrome.runtime.lastError
            );
            reloadContentScript();
          }
        });
      } catch (error) {
        console.error("[Content] Ping failed:", error);
        reloadContentScript();
      }
    }, 2000);

    // Announce content script is ready
    window.postMessage(
      {
        source: "GAMEPAD_EXTENSION",
        type: "CONTENT_SCRIPT_READY",
        extensionId: chrome.runtime.id,
      },
      window.location.origin
    );
  } catch (error) {
    console.error("[Content] Initialization error:", error);
    // Attempt recovery
    setTimeout(reloadContentScript, 2000);
  }
}

// Initialize content script
main();

// Update handleExtensionReload to use better retry logic
const handleExtensionReload = async () => {
  if (isReconnecting) {
    console.log("[Content] Already attempting to reconnect, skipping...");
    return;
  }

  console.log("[Content] Extension reload detected");
  isReconnecting = true;

  // Run destructor first
  destructor();

  // Notify webpage about extension error
  try {
    window.postMessage(
      {
        source: "GAMEPAD_EXTENSION",
        type: "EXTENSION_ERROR",
        error: {
          message: "Extension connection lost. Attempting to reconnect...",
          retryCount: currentRetryCount + 1,
          maxRetries: MAX_RETRIES,
        },
      },
      window.location.origin
    );
  } catch (error) {
    console.error("[Content] Failed to send error message:", error);
  }

  // Implement exponential backoff for reconnection
  if (currentRetryCount < MAX_RETRIES) {
    const delay = BASE_DELAY * Math.pow(2, currentRetryCount);
    console.log(
      `[Content] Retry attempt ${currentRetryCount + 1}/${MAX_RETRIES} in ${delay}ms`
    );

    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      if (isContextValid()) {
        await main();
        currentRetryCount++;
      } else {
        throw new Error("Context still invalid after delay");
      }
    } catch (error) {
      console.error("[Content] Reconnection attempt failed:", error);
      handleExtensionReload(); // Recursive retry with increased count
    }
  } else {
    console.log(
      "[Content] Max retries reached, falling back to periodic checks"
    );
    isReconnecting = false;
    currentRetryCount = 0;

    // Set up a longer interval to keep trying
    setInterval(async () => {
      if (isContextValid() && !isReconnecting) {
        try {
          await main();
        } catch (error) {
          console.error(
            "[Content] Periodic reconnection attempt failed:",
            error
          );
        }
      }
    }, 10000);
  }
};

// Add retry mechanism for tab message sending
async function sendMessageToTabWithRetry(tabId, message, maxRetries = 3) {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await chrome.tabs.sendMessage(tabId, message);
      return true;
    } catch (error) {
      attempt++;
      console.log(
        `[Content] Send attempt ${attempt}/${maxRetries} failed:`,
        error
      );

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  throw new Error(`Failed to send message to tab after ${maxRetries} attempts`);
}
