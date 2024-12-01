openLivestreaming.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({
    url: [
      "https://livestreaming.tools/*",
      "http://localhost:3000/*",
      "http://localhost/*",
    ],
  });

  if (tab) {
    chrome.tabs.update(tab.id, { active: true });
  } else {
    // Use localhost in development, production otherwise
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://livestreaming.tools";

    chrome.tabs.create({
      url: baseUrl,
      active: true,
    });
  }
});

// Add developer tools toggle functionality
document
  .getElementById("toggleDevTools")
  .addEventListener("click", function () {
    const devTools = document.getElementById("devTools");
    const isHidden = devTools.classList.contains("hidden");

    if (isHidden) {
      devTools.classList.remove("hidden");
      this.textContent = "Hide";
    } else {
      devTools.classList.add("hidden");
      this.textContent = "Show";
    }
  });
