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

      try {
        // Add timeout for message sending
        const timeoutId = setTimeout(() => {
          reject(new Error("Message send timeout"));
        }, 5000);

        chrome.runtime.sendMessage(message, (response) => {
          clearTimeout(timeoutId);

          if (!isContextValid()) {
            reject(new Error("Extension context invalidated during response"));
            return;
          }

          if (chrome.runtime.lastError) {
            const error = chrome.runtime.lastError;
            console.error("[Offscreen] Send error:", formatError(error));
            reject(error);
            return;
          }

          if (!response) {
            reject(new Error("No response received"));
            return;
          }

          console.log("[Offscreen] Ready message acknowledged:", response);
          resolve(response);
        });
      } catch (error) {
        console.error("[Offscreen] Send attempt failed:", formatError(error));
        reject(error);
      }
    });

  while (attempt < maxRetries) {
    if (!isContextValid()) {
      console.error("[Offscreen] Context invalid before attempt");
      break;
    }

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

      // Only wait if we're going to retry
      if (attempt < maxRetries && isContextValid()) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    }
  }

  throw new Error("Failed to send ready message after max retries");
}

// Start sending ready message with better error handling
(async function initializeOffscreen() {
  let initAttempt = 0;
  const maxInitAttempts = 3;

  while (initAttempt < maxInitAttempts) {
    try {
      // Wait for a short time before first attempt
      if (initAttempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * initAttempt));
      }

      await sendReadyMessage();
      console.log("[Offscreen] Initialization successful");
      break;
    } catch (error) {
      initAttempt++;
      console.error(
        "[Offscreen] Initialization attempt failed:",
        formatError(error)
      );

      if (initAttempt >= maxInitAttempts) {
        // Try to notify parent about failure
        try {
          window.parent?.postMessage(
            {
              source: "OFFSCREEN_DOCUMENT",
              type: "ERROR",
              error: error.message,
              attempt: initAttempt,
              maxAttempts: maxInitAttempts,
            },
            "*"
          );
        } catch (postError) {
          console.error(
            "[Offscreen] Failed to post error message:",
            formatError(postError)
          );
        }
      }
    }
  }
})();

// Message handler for all offscreen document messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isContextValid()) {
    console.error(
      "[Offscreen] Context invalid while processing message:",
      message.type
    );
    sendResponse({ success: false, error: "Extension context invalid" });
    return false;
  }

  console.log("[Offscreen] Received message:", message.type);

  try {
    switch (message.type) {
      case "PING":
        sendResponse({
          success: true,
          source: "offscreen",
          timestamp: Date.now(),
        });
        return true;

      case "INIT_CHANNEL":
        try {
          console.log("[Offscreen] Initializing channel:", message.channelId);
          window.channelId = message.channelId;
          sendResponse({
            success: true,
            channelId: message.channelId,
            timestamp: Date.now(),
          });
          console.log("[Offscreen] Channel initialized successfully");
        } catch (error) {
          console.error(
            "[Offscreen] Channel initialization failed:",
            formatError(error)
          );
          sendResponse({
            success: false,
            error: error.message || "Channel initialization failed",
          });
        }
        return true;

      default:
        console.log("[Offscreen] Unknown message type:", message.type);
        sendResponse({ success: false, error: "Unknown message type" });
        return false;
    }
  } catch (error) {
    console.error("[Offscreen] Message handler error:", formatError(error));
    sendResponse({ success: false, error: error.message });
    return false;
  }
});

// Add unload handler
window.addEventListener("unload", () => {
  console.log("[Offscreen] Document unloading");
  try {
    window.parent?.postMessage(
      {
        source: "OFFSCREEN_DOCUMENT",
        type: "UNLOAD",
      },
      "*"
    );
  } catch (error) {
    console.error(
      "[Offscreen] Failed to send unload message:",
      formatError(error)
    );
  }
});

console.log("[Offscreen] Message handlers initialized");
