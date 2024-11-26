import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";

async function buildExtension() {
  console.log("🔨 Building extension...");

  try {
    const extensionDir = path.join(process.cwd(), "app/extensions/chrome");
    const distDir = path.join(extensionDir, "dist");

    // Ensure dist directory exists
    await fs.mkdir(distDir, { recursive: true });

    // Copy necessary files
    const filesToCopy = [
      "manifest.json",
      "background.js",
      "content.js",
      "popup.html",
      "popup.js",
      "offscreen.html",
      "offscreen.js",
      "offscreen-ready.js",
      "offscreen-init.js",
      "reload-script.js",
      "icon-generator.js",
    ];

    // Copy each file
    for (const file of filesToCopy) {
      await fs
        .copyFile(path.join(extensionDir, file), path.join(distDir, file))
        .catch((err) => {
          console.warn(`⚠️ Warning: Could not copy ${file}:`, err.message);
        });
    }

    // Copy directories
    const directoriesToCopy = ["icons", "images", "fonts"];
    for (const dir of directoriesToCopy) {
      await fs
        .cp(path.join(extensionDir, dir), path.join(distDir, dir), {
          recursive: true,
        })
        .catch((err) => {
          console.warn(`⚠️ Warning: Could not copy ${dir}:`, err.message);
        });
    }

    console.log("✅ Extension built successfully!");
  } catch (error) {
    console.error("❌ Failed to build extension:", error);
    process.exit(1);
  }
}

buildExtension();
