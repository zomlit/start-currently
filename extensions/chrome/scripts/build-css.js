import fs from "fs/promises";
import path from "path";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

async function buildCSS() {
  try {
    const extensionDir = path.join(process.cwd(), "extensions/chrome");
    const distDir = path.join(extensionDir, "dist");
    const srcCssPath = path.join(extensionDir, "popup.css");
    const distCssPath = path.join(distDir, "popup.css");

    // Ensure dist directory exists
    await fs.mkdir(distDir, { recursive: true });

    // Read source CSS
    const css = await fs.readFile(srcCssPath, "utf8");

    // Process with PostCSS and Tailwind
    const result = await postcss([
      tailwindcss({
        config: {
          content: [
            path.join(extensionDir, "popup.html"),
            path.join(extensionDir, "popup.js"),
            // Include any other files that use Tailwind classes
          ],
          darkMode: "media",
          theme: {
            extend: {
              fontFamily: {
                sofia: [
                  "Sofia Sans Condensed",
                  "system-ui",
                  "-apple-system",
                  "sans-serif",
                ],
              },
            },
          },
        },
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
      from: srcCssPath,
      to: distCssPath,
    });

    // Write processed CSS to dist
    await fs.writeFile(distCssPath, result.css);
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
      // Ignore font copy errors
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
