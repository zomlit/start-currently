console.log("🎮 Service worker loaded");

// Add at the top of the file
let isInitialized = false;
const readyTabs = new Set();
let reconnectingTabs = new Set();
let serviceWorkerStartTime = Date.now();

// Add a mutex for offscreen document creation
let isCreatingOffscreen = false;

// Add state tracking for offscreen document
let offscreenReady = false;

// Helper function to check if service worker is ready
function isServiceWorkerReady() {
  return new Promise((resolve) => {
    if (chrome.runtime.id) {
      resolve(true);
      return;
    }

    // Wait for up to 5 seconds for the service worker to be ready
    const checkInterval = setInterval(() => {
      if (chrome.runtime.id) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - serviceWorkerStartTime > 5000) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
}

// Add mutex lock helper
async function acquireLock(timeout = 5000) {
  const startTime = Date.now();
  while (isCreatingOffscreen) {
    if (Date.now() - startTime > timeout) {
      throw new Error("Lock acquisition timeout");
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  isCreatingOffscreen = true;
}

// Update createOffscreen function with better locking and cleanup
async function createOffscreen() {
  try {
    await acquireLock();

    // Check if service worker is ready
    const swReady = await isServiceWorkerReady();
    if (!swReady) {
      throw new Error("No SW");
    }

    // Double check no document exists
    try {
      const hasDoc = await chrome.offscreen.hasDocument();
      if (hasDoc) {
        console.log("🔍 Found existing document, attempting cleanup");
        try {
          await chrome.offscreen.closeDocument();
          // Wait for cleanup
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (closeError) {
          console.log(
            "Note: Close error during cleanup (expected):",
            closeError
          );
        }
      }
    } catch (checkError) {
      console.log("Note: Document check error (expected):", checkError);
    }

    // Create new document with loading check
    console.log("📝 Creating new offscreen document...");

    // Create a promise that resolves when the document is ready
    const documentReady = new Promise((resolve, reject) => {
      let readyListener;
      const timeout = setTimeout(() => {
        if (readyListener) {
          chrome.runtime.onMessage.removeListener(readyListener);
        }
        reject(new Error("Offscreen document ready timeout"));
      }, 10000);

      readyListener = (message, sender, sendResponse) => {
        if (message.type === "OFFSCREEN_READY") {
          clearTimeout(timeout);
          chrome.runtime.onMessage.removeListener(readyListener);
          sendResponse({ success: true });
          resolve();
          return true;
        }
        return false;
      };

      chrome.runtime.onMessage.addListener(readyListener);
    });

    // Create the document
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["DOM_SCRAPING"],
      justification: "Monitor gamepad inputs in background",
    });

    console.log("📄 Offscreen document created, waiting for ready message...");

    // Wait for the document to be ready
    try {
      await documentReady;
      console.log("✅ Offscreen document ready");
      offscreenReady = true;
    } catch (error) {
      console.error("❌ Document ready timeout:", error);
      // Try to close the document if it failed to load
      try {
        await chrome.offscreen.closeDocument();
      } catch (closeError) {
        console.log("Note: Close error during cleanup:", closeError);
      }
      offscreenReady = false;
      throw new Error("Offscreen document failed to initialize");
    }
  } catch (error) {
    console.error("❌ Error creating offscreen document:", error);
    offscreenReady = false;
    throw error;
  } finally {
    isCreatingOffscreen = false;
  }
}

// Update initialize function to handle document creation better
async function initialize() {
  if (isInitialized) return;

  console.log("🎮 Service worker initializing");

  try {
    // Wait for service worker to be ready
    const swReady = await isServiceWorkerReady();
    if (!swReady) {
      throw new Error("Service worker failed to initialize");
    }

    // Create offscreen document with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        // Wait between attempts
        if (retries < 3) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        await createOffscreen();
        break;
      } catch (error) {
        console.error(
          `❌ Initialization attempt ${4 - retries}/3 failed:`,
          error
        );
        retries--;

        // Clean up on failure
        try {
          await chrome.offscreen.closeDocument();
        } catch (closeError) {
          // Ignore cleanup errors
        }

        if (retries === 0) {
          throw error;
        }
      }
    }

    // Get current channel ID if exists
    const { channelId } = await chrome.storage.sync.get("channelId");
    if (channelId) {
      console.log("🔄 Reinitializing channel:", channelId);
      // Wait for offscreen document to be ready
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: "INIT_CHANNEL",
          channelId,
        });
      }, 1000);
    }

    isInitialized = true;
    console.log("✅ Service worker initialized");
  } catch (error) {
    console.error("❌ Initialization error:", error);
    isInitialized = false;
    // Try to reinitialize after a delay if service worker failed
    if (error.message.includes("Service worker")) {
      console.log("🔄 Scheduling reinitialization...");
      setTimeout(initialize, 2000);
    }
  }
}

// Call initialize on install/update/startup with SW check
chrome.runtime.onInstalled.addListener(async () => {
  serviceWorkerStartTime = Date.now();
  await initialize();
});

chrome.runtime.onStartup.addListener(async () => {
  serviceWorkerStartTime = Date.now();
  await initialize();
});

// Initialize immediately with SW check
(async () => {
  serviceWorkerStartTime = Date.now();
  await initialize();
})();

// Add reload detection with SW tracking
chrome.runtime.onSuspend.addListener(() => {
  console.log("🔄 Extension being reloaded");
  isInitialized = false;
  readyTabs.clear();
  reconnectingTabs.clear();
  serviceWorkerStartTime = Date.now();
});

// Function to generate a secure channel ID
function generateChannelId(username) {
  const channelId = `gamepad:${username}`;
  console.log("Generated channel ID:", channelId);
  return channelId;
}

// Update setupChannel function to wait for offscreen document
async function setupChannel(username) {
  const channelId = generateChannelId(username);
  await chrome.storage.sync.set({ channelId });
  console.log("🎮 Channel setup for user:", username, "with ID:", channelId);

  // Create offscreen document if needed
  if (!offscreenReady) {
    console.log("⏳ Creating offscreen document...");
    await createOffscreen();
  }

  // Verify offscreen document is ready
  if (!offscreenReady) {
    throw new Error("Offscreen document not ready");
  }

  // Send channel ID to offscreen document
  try {
    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("INIT_CHANNEL timeout"));
      }, 5000);

      chrome.runtime.sendMessage(
        {
          type: "INIT_CHANNEL",
          channelId,
        },
        (response) => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        }
      );
    });

    console.log("✅ INIT_CHANNEL response:", response);

    // Notify all tabs about the channel with better error handling
    const tabs = await chrome.tabs.query({
      url: ["https://livestreaming.tools/*", "http://localhost:3000/*"],
    });

    const sendMessageToTab = async (tab) => {
      if (!tab.id) return;

      try {
        await sendMessageToTabWithRetry(tab.id, {
          type: "CHANNEL_READY",
          channelId,
          username: username,
        });
        console.log("✅ Sent channel ready to tab:", tab.id);
      } catch (error) {
        console.error("💔 Failed to send channel ready to tab:", tab.id, error);
        readyTabs.delete(tab.id);
        reconnectingTabs.add(tab.id);
      }
    };

    // Send to all tabs with retries
    await Promise.all(tabs.map(sendMessageToTab));

    return channelId;
  } catch (error) {
    console.error("❌ Failed to initialize channel:", error);

    // If offscreen document failed, mark it as not ready
    if (error.message.includes("Receiving end does not exist")) {
      offscreenReady = false;
      // Try to recreate the offscreen document
      try {
        await createOffscreen();
        // Retry the channel setup once
        return setupChannel(username);
      } catch (recreateError) {
        console.error("Failed to recreate offscreen document:", recreateError);
        throw error;
      }
    }
    throw error;
  }
}

// Add helper for sending messages to tabs
async function sendMessageToTabWithRetry(tabId, message, maxRetries = 3) {
  let attempt = 0;
  const retryDelay = 1000; // 1 second between retries

  while (attempt < maxRetries) {
    try {
      // Check if tab still exists
      const tab = await chrome.tabs.get(tabId).catch(() => null);
      if (!tab) {
        console.log("🚫 Tab no longer exists:", tabId);
        readyTabs.delete(tabId);
        reconnectingTabs.delete(tabId);
        throw new Error("Tab no longer exists");
      }

      // Inject content script if needed
      if (!readyTabs.has(tabId)) {
        console.log("📝 Injecting content script into tab:", tabId);
        try {
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ["content.js"],
          });
          // Wait for content script to initialize
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.log("⚠️ Script injection failed:", error);
        }
      }

      // Send message with timeout
      const response = await Promise.race([
        new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Send timeout")), 2000)
        ),
      ]);

      console.log("✅ Message sent successfully to tab:", tabId);
      return response;
    } catch (error) {
      attempt++;
      console.log(
        `❌ Attempt ${attempt}/${maxRetries} failed for tab ${tabId}:`,
        error
      );

      // Remove from ready set if there was an error
      readyTabs.delete(tabId);

      if (attempt < maxRetries) {
        console.log(`⏳ Waiting ${retryDelay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        throw error;
      }
    }
  }
}

// Listen for messages
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("📨 Received message:", message, "from:", sender);

  if (message.type === "PING") {
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "CONTENT_SCRIPT_READY") {
    console.log("📝 Content script ready in tab:", sender.tab?.id);
    if (sender.tab?.id) {
      readyTabs.add(sender.tab.id);
      reconnectingTabs.delete(sender.tab.id);
    }
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "GAMEPAD_STATE") {
    console.log("🎮 Received gamepad state:", {
      buttons: message.state.buttons.map((b) => b.pressed),
      axes: message.state.axes,
    });

    try {
      const tabs = await chrome.tabs.query({
        url: ["https://livestreaming.tools/*", "http://localhost:3000/*"],
      });

      console.log("📤 Found tabs to forward to:", tabs.length);

      // Send to each tab with retries
      await Promise.allSettled(
        tabs.map(async (tab) => {
          if (!tab.id) return;

          try {
            await sendMessageToTabWithRetry(tab.id, {
              type: "GAMEPAD_STATE",
              state: message.state,
              timestamp: Date.now(),
            });
          } catch (error) {
            console.error(
              `💔 Failed to send to tab ${tab.id} after retries:`,
              error
            );
            readyTabs.delete(tab.id);
          }
        })
      );
    } catch (error) {
      console.error("Failed to forward gamepad state:", error);
    }

    sendResponse({ success: true });
    return true;
  } else if (message.type === "CONSOLE") {
    const prefix = "📄 [Offscreen]";
    console[message.logType](prefix, ...message.args);
    sendResponse({ success: true });
  }

  return true; // Keep the message channel open for async response
});

// Listen for messages from livestreaming.tools
chrome.runtime.onMessageExternal.addListener(
  async (message, sender, sendResponse) => {
    console.log("📨 External message:", message, "from:", sender.origin);

    // Allow messages from both livestreaming.tools and localhost
    if (
      sender.origin === "https://livestreaming.tools" ||
      sender.origin === "http://localhost:3000"
    ) {
      switch (message.type) {
        case "SETUP_GAMEPAD_CHANNEL":
          try {
            console.log("🎮 Setting up channel for:", message.username);
            const channelId = await setupChannel(message.username);
            console.log("✅ Channel setup successful:", channelId);

            // Send initial state to web page - use Promise.all
            const tabs = await chrome.tabs.query({
              url: ["https://livestreaming.tools/*", "http://localhost:3000/*"],
            });

            await Promise.all(
              tabs.map(async (tab) => {
                if (tab.id) {
                  try {
                    await chrome.tabs.sendMessage(tab.id, {
                      type: "CHANNEL_READY",
                      channelId,
                      username: message.username,
                    });
                    console.log("✅ Sent channel ready to tab:", tab.id);
                  } catch (error) {
                    console.error(
                      "Failed to send channel ready to tab:",
                      tab.id,
                      error
                    );
                  }
                }
              })
            );

            sendResponse({ success: true, channelId });
          } catch (error) {
            console.error("❌ Channel setup failed:", error);
            sendResponse({ success: false, error: error.message });
          }
          break;

        case "GET_EXTENSION_ID":
          console.log("🆔 Sending extension ID");
          sendResponse({
            id: chrome.runtime.id,
            success: true,
          });
          break;

        default:
          console.log("❓ Unknown message type:", message.type);
          sendResponse({ success: false, error: "Unknown message type" });
      }
    } else {
      console.log("⚠️ Unauthorized sender:", sender.origin);
      sendResponse({ success: false, error: "Unauthorized sender" });
    }

    return true; // Keep the message channel open
  }
);

// Keep alive and check document
setInterval(async () => {
  chrome.runtime.getPlatformInfo(() => {});
  if (!(await chrome.offscreen.hasDocument())) {
    console.log("🔄 Recreating offscreen document");
    createOffscreen();
  }
}, 20000);

// Add cleanup for closed tabs
chrome.tabs.onRemoved.addListener((tabId) => {
  readyTabs.delete(tabId);
  reconnectingTabs.delete(tabId);
  console.log("🧹 Cleaned up tab:", tabId);
});

// Add tab update handling
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    reconnectingTabs.delete(tabId);
  }
});

// Add cleanup on extension update/reload
chrome.runtime.onUpdateAvailable.addListener(() => {
  console.log("🔄 Extension update available, cleaning up...");
  try {
    chrome.offscreen.closeDocument();
  } catch (error) {
    console.log("Note: Cleanup error (expected):", error);
  }
});
