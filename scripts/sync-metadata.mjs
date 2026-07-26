import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(projectRoot, ".env.local");
const assetsPath = path.join(projectRoot, "public", "cesium", "data", "assets.json");
const metadataPath = path.join(projectRoot, "public", "cesium", "data", "metadata.json");

dotenv.config({ path: envPath, quiet: true });

const token = process.env.VITE_CESIUM_ION_TOKEN?.trim();

if (!token) {
  throw new Error("VITE_CESIUM_ION_TOKEN was not found. Add it to .env.local first.");
}

const assets = JSON.parse(await fs.readFile(assetsPath, "utf8"));
let existingMetadata = [];

try {
  existingMetadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));
} catch {
  existingMetadata = [];
}

const existingById = new Map(existingMetadata.map((item) => [item.assetId, item]));
const synchronized = [];
const failures = [];

for (const asset of assets) {
  try {
    const response = await fetch(`https://api.cesium.com/v1/assets/${asset.assetId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const metadata = await response.json();
    synchronized.push({
      assetId: asset.assetId,
      name: String(metadata.name || asset.assetName),
      description: String(metadata.description || "")
    });
    console.log(`Metadata synchronized: ${asset.assetId} / ${asset.assetName}`);
  } catch (error) {
    const previous = existingById.get(asset.assetId);
    if (previous) {
      synchronized.push(previous);
    }
    failures.push(asset);
    console.error(
      `Metadata synchronization failed: assetId=${asset.assetId}, assetName=${asset.assetName}, ${error.message}`
    );
  }
}

if (!synchronized.length) {
  throw new Error("Metadata synchronization failed for every model; metadata.json was not changed.");
}

await fs.mkdir(path.dirname(metadataPath), { recursive: true });
await fs.writeFile(metadataPath, `${JSON.stringify(synchronized, null, 2)}\n`, "utf8");

console.log(
  `Metadata synchronization finished: ${synchronized.length} synchronized or retained, ${failures.length} failed.`
);
