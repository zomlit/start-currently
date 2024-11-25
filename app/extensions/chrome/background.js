console.log("🎮 Service worker loaded");

// Function to generate a secure channel ID
function generateChannelId(username) {
  // Generate a random UUID for security
  const uuid = crypto.randomUUID();
  // Hash the username and UUID together
  const channelId = `gamepad:${username}:${uuid}`;
  console.log("Generated channel ID:", channelId);
  return channelId;
}

// Function to setup channel for a user
async function setupChannel(username) {
  const channelId = generateChannelId(username);
  await chrome.storage.sync.set({ channelId });
  console.log("🎮 Channel setup for user:", username, "with ID:", channelId);

  // Create offscreen document if it doesn't exist
  await createOffscreen();

  // Wait for offscreen document to be ready
  setTimeout(() => {
    // Send new channel ID to offscreen document
    chrome.runtime
      .sendMessage({
        type: "INIT_CHANNEL",
        channelId,
      })
      .catch((error) => {
        console.error("Failed to send INIT_CHANNEL:", error);
      });
  }, 1000);

  return channelId;
}

async function createOffscreen() {
  try {
    if (await chrome.offscreen.hasDocument()) {
      console.log("✅ Offscreen document already exists");

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
      return;
    }

    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["DOM_SCRAPING"],
      justification: "Monitor gamepad inputs in background",
    });
    console.log("✅ Created new offscreen document");

    // Get current channel ID if exists
    const { channelId } = await chrome.storage.sync.get("channelId");
    if (channelId) {
      console.log("🔄 Initializing channel:", channelId);
      // Wait for offscreen document to be ready
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: "INIT_CHANNEL",
          channelId,
        });
      }, 1000);
    }
  } catch (error) {
    console.error("❌ Creation error:", error);
  }
}

// Start monitoring on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log("🎮 Extension installed/updated");
  await createOffscreen();
});

// Listen for messages
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("📨 Received message:", message, "from:", sender);

  if (message.type === "GAMEPAD_STATE") {
    // Forward gamepad state to all extension contexts and web page
    try {
      // Forward to extension contexts
      chrome.runtime.sendMessage(message);

      // Forward to web page
      const tabs = await chrome.tabs.query({ active: true });
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs
            .sendMessage(tab.id, {
              type: "GAMEPAD_STATE",
              state: message.state,
              timestamp: Date.now(),
            })
            .catch((error) => {
              console.error("Failed to send to tab:", error);
            });
        }
      });
    } catch (error) {
      console.error("Failed to forward gamepad state:", error);
    }
    sendResponse({ success: true });
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

            // Send initial state to web page
            const tabs = await chrome.tabs.query({ active: true });
            tabs.forEach((tab) => {
              if (tab.id) {
                chrome.tabs
                  .sendMessage(tab.id, {
                    type: "CHANNEL_READY",
                    channelId,
                    username: message.username,
                  })
                  .catch((error) => {
                    console.error("Failed to send channel ready:", error);
                  });
              }
            });

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

    return true; // Keep the message channel open for async response
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
