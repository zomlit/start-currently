console.log("[Offscreen] Ready script starting");

// Add context validation helper
function isContextValid() {
  try {
    chrome.runtime.getURL("");
    return true;
  } catch (error) {
    console.error("[Offscreen] Context validation failed:", error);
    return false;
  }
}

// Helper to format error objects
function formatError(error) {
  return {
    message: error.message,
    name: error.name,
    stack: error.stack,
    toString: error.toString(),
  };
}

// Function to send ready message with retries
async function sendReadyMessage(maxRetries = 3) {
  let attempt = 0;

  const attemptSend = () =>
    new Promise((resolve, reject) => {
      if (!isContextValid()) {
        reject(new Error("Extension context invalid"));
        return;
      }

      const message = {
        type: "OFFSCREEN_READY",
        timestamp: Date.now(),
      };

      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });

  while (attempt < maxRetries) {
    try {
      await attemptSend();
      console.log("[Offscreen] Ready message sent successfully");
      return;
    } catch (error) {
      attempt++;
      console.log(
        `[Offscreen] Attempt ${attempt}/${maxRetries} failed:`,
        error.message
      );
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
}

// Initialize offscreen document
(async function initializeOffscreen() {
  try {
    await sendReadyMessage();
    console.log("[Offscreen] Initialization successful");
  } catch (error) {
    console.error("[Offscreen] Initialization failed:", error);
  }
})();

// Message handler for all offscreen document messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Offscreen] Received message:", message.type);

  // Handle synchronous responses
  if (message.type === "PING") {
    sendResponse({ success: true, timestamp: Date.now() });
    return false; // Synchronous response
  }

  if (message.type === "INIT_CHANNEL") {
    try {
      window.channelId = message.channelId;
      sendResponse({ success: true, channelId: message.channelId });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
    return false; // Synchronous response
  }

  // For any other message types that don't need async handling
  sendResponse({ success: false, error: "Unknown message type" });
  return false; // Synchronous response
});

// Add unload handler
window.addEventListener("unload", () => {
  console.log("[Offscreen] Document unloading");
});

console.log("[Offscreen] Message handlers initialized");
