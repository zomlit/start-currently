export async function loadGoogleFont(fontFamily: string): Promise<void> {
  // Skip system fonts
  if (fontFamily === "system-ui") return;

  // Convert font family name to Google Fonts format
  const formattedName = fontFamily.replace(/\s+/g, "+");

  // Check if font is already loaded
  const existingLink = document.querySelector(`link[href*="${formattedName}"]`);
  if (existingLink) return;

  // Create and append link element
  const link = document.createElement("link");
  link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@400;700&display=swap`;
  link.rel = "stylesheet";

  // Wait for font to load
  await new Promise((resolve, reject) => {
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });

  // Optional: Wait a bit more to ensure font is ready
  await new Promise((resolve) => setTimeout(resolve, 100));
}
