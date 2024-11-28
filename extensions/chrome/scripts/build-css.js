import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

async function buildCSS() {
  console.log("🎨 Building extension CSS...");

  try {
    const extensionDir = path.join(process.cwd(), "extensions/chrome");
    const distDir = path.join(extensionDir, "dist");

    // Ensure dist directory exists
    await fs.mkdir(distDir, { recursive: true });

    // Read input CSS
    const css = await fs.readFile(path.join(extensionDir, "popup.css"), "utf8");

    // Process with PostCSS
    const result = await postcss([
      tailwindcss({
        config: path.join(extensionDir, "tailwind.config.js"),
      }),
      autoprefixer(),
      cssnano({
        preset: [
          "default",
          {
            discardComments: {
              removeAll: true,
            },
          },
        ],
      }),
    ]).process(css, {
      from: path.join(extensionDir, "popup.css"),
      to: path.join(distDir, "popup.css"),
    });

    // Write output
    await fs.writeFile(path.join(distDir, "popup.css"), result.css);

    if (result.map) {
      await fs.writeFile(
        path.join(distDir, "popup.css.map"),
        result.map.toString()
      );
    }

    console.log("✅ CSS built successfully");

    // Copy font files if they exist
    const fontsDir = path.join(extensionDir, "fonts");
    const distFontsDir = path.join(distDir, "fonts");

    try {
      await fs.mkdir(distFontsDir, { recursive: true });
      const fontFiles = await fs.readdir(fontsDir);
      for (const file of fontFiles) {
        await fs.copyFile(
          path.join(fontsDir, file),
          path.join(distFontsDir, file)
        );
      }
      console.log("✅ Fonts copied successfully");
    } catch (error) {
      console.warn("⚠️ No fonts to copy:", error.message);
    }

    // Copy images if they exist
    const imagesDir = path.join(extensionDir, "images");
    const distImagesDir = path.join(distDir, "images");

    try {
      await fs.mkdir(distImagesDir, { recursive: true });
      const imageFiles = await fs.readdir(imagesDir);
      for (const file of imageFiles) {
        await fs.copyFile(
          path.join(imagesDir, file),
          path.join(distImagesDir, file)
        );
      }
      console.log("✅ Images copied successfully");
    } catch (error) {
      console.warn("⚠️ No images to copy:", error.message);
    }
  } catch (error) {
    console.error("❌ Failed to build CSS:", error);
    process.exit(1);
  }
}

buildCSS();
