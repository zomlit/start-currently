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
