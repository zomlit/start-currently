console.log("🎮 Service worker loaded");

// Add at the top of the file
let isInitialized = false;
const readyTabs = new Set();

// Add initialization function
async function initialize() {
  if (isInitialized) return;

  console.log("🎮 Service worker initializing");

  try {
    // Create offscreen document
    await createOffscreen();

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
  }
}

// Call initialize on install/update/startup
chrome.runtime.onInstalled.addListener(initialize);
chrome.runtime.onStartup.addListener(initialize);

// Initialize immediately
initialize();

// Add reload detection
chrome.runtime.onSuspend.addListener(() => {
  console.log("🔄 Extension being reloaded");
  isInitialized = false;
  readyTabs.clear();
});

// Function to generate a secure channel ID
function generateChannelId(username) {
  const channelId = `gamepad:${username}`;
  console.log("Generated channel ID:", channelId);
  return channelId;
}

// Function to setup channel for a user
async function setupChannel(username) {
  const channelId = generateChannelId(username);
  await chrome.storage.sync.set({ channelId });
  console.log("🎮 Channel setup for user:", username, "with ID:", channelId);

  // Create offscreen document if needed
  await createOffscreen();

  // Send channel ID to offscreen document
  try {
    // Use a Promise to handle the response
    await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "INIT_CHANNEL",
          channelId,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        }
      );
    });

    console.log("✅ Sent channel ID to offscreen document");
  } catch (error) {
    console.error("Failed to send INIT_CHANNEL:", error);
  }

  return channelId;
}

async function createOffscreen() {
  try {
    // Check if document exists
    const existing = await chrome.offscreen.hasDocument();

    if (existing) {
      console.log("✅ Offscreen document already exists");
      return;
    }

    // Create new document
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["DOM_SCRAPING"],
      justification: "Monitor gamepad inputs in background",
    });

    console.log("✅ Created new offscreen document");

    // Wait for document to be ready
    return new Promise((resolve) => {
      const checkReady = (message, sender) => {
        if (message.type === "OFFSCREEN_READY") {
          chrome.runtime.onMessage.removeListener(checkReady);
          resolve();
        }
      };

      chrome.runtime.onMessage.addListener(checkReady);

      // Timeout after 5 seconds
      setTimeout(() => {
        chrome.runtime.onMessage.removeListener(checkReady);
        resolve();
      }, 5000);
    });
  } catch (error) {
    console.error("❌ Creation error:", error);
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
      // Query for ALL tabs
      const tabs = await chrome.tabs.query({
        url: ["https://livestreaming.tools/*", "http://localhost:3000/*"],
      });

      console.log("📤 Found tabs to forward to:", tabs.length);

      // Send to each tab
      for (const tab of tabs) {
        if (!tab.id) continue;

        try {
          // Check if tab is ready
          if (!readyTabs.has(tab.id)) {
            console.log("⚠️ Tab not ready, attempting to send anyway:", tab.id);
          }

          await chrome.tabs.sendMessage(tab.id, {
            type: "GAMEPAD_STATE",
            state: message.state,
            timestamp: Date.now(),
          });
          console.log("✅ Sent to tab:", tab.id);
        } catch (error) {
          console.error("❌ Failed to send to tab:", tab.id, error);
          // Remove tab from ready set if there's an error
          readyTabs.delete(tab.id);
        }
      }
    } catch (error) {
      console.error("Failed to forward gamepad state:", error);
    }

    // Always send response
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
  console.log("🧹 Cleaned up tab:", tabId);
});
