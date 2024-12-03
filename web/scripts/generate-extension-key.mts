import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

async function generateExtensionKey() {
  // Use a fixed seed for consistent key generation
  const seed = "currently-creator-tools-v1";
  const hash = crypto.createHash("sha256").update(seed).digest();

  // Generate deterministic private key using the hash as seed
  const { privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    // @ts-ignore - prng is valid but not in types
    prng: () => hash,
  } as crypto.RSAKeyPairOptions<"pem", "pem">);

  // Convert to the format Chrome expects
  const buffer = Buffer.from(privateKey);
  const key = buffer.toString("base64");

  // Write to both locations
  const extensionDir = path.join(process.cwd(), "extensions/chrome");
  const distDir = path.join(extensionDir, "dist");

  // Read from template instead of existing manifest
  const manifestTemplate = JSON.parse(
    await fs.readFile(
      path.join(extensionDir, "manifest.template.json"),
      "utf-8"
    )
  );

  // Add the key
  manifestTemplate.key = key;

  // Write updated manifest to both locations
  await fs.writeFile(
    path.join(extensionDir, "manifest.json"),
    JSON.stringify(manifestTemplate, null, 2)
  );
  await fs.writeFile(
    path.join(distDir, "manifest.json"),
    JSON.stringify(manifestTemplate, null, 2)
  );

  console.log("✅ Extension key generated and manifests updated");
}

generateExtensionKey();
