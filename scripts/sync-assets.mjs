import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readSheet } from "read-excel-file/node";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultWorkbookPath = path.resolve(
  projectRoot,
  "..",
  "spk-CesiumJS",
  "SPK_Cesium_Asset_List.xlsx"
);
const workbookPath = process.env.SPK_CESIUM_ASSET_XLSX
  ? path.resolve(process.env.SPK_CESIUM_ASSET_XLSX)
  : defaultWorkbookPath;
const outputPath = path.join(projectRoot, "public", "cesium", "data", "assets.json");

async function workbookExists() {
  try {
    await fs.access(workbookPath);
    return true;
  } catch {
    return false;
  }
}

if (!(await workbookExists())) {
  throw new Error(`The model inventory workbook was not found: ${workbookPath}`);
}

const rows = await readSheet(workbookPath);

if (rows.length < 2) {
  throw new Error("The model inventory does not contain any data rows.");
}

const headers = rows[0].map((value) => String(value ?? "").trim().toLowerCase());
const assetIdColumn = headers.indexOf("asset_id");
const assetNameColumn = headers.indexOf("asset_name");

if (assetIdColumn === -1 || assetNameColumn === -1) {
  throw new Error("The workbook must contain asset_id and asset_name columns (case-insensitive)." );
}

const seenAssetIds = new Set();
const assets = [];

for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
  const row = rows[rowIndex];
  const rawAssetId = row[assetIdColumn];
  const assetName = String(row[assetNameColumn] ?? "").trim();

  if ((rawAssetId === null || rawAssetId === "") && !assetName) {
    continue;
  }

  const assetId = Number(rawAssetId);
  const excelRow = rowIndex + 1;

  if (!Number.isSafeInteger(assetId) || assetId <= 0) {
    throw new Error(`The asset_id in Excel row ${excelRow} is not a valid positive integer.`);
  }

  if (!assetName) {
    throw new Error(`The asset_name in Excel row ${excelRow} is empty.`);
  }

  if (seenAssetIds.has(assetId)) {
    throw new Error(`Excel row ${excelRow} contains a duplicate asset_id: ${assetId}`);
  }

  seenAssetIds.add(assetId);
  assets.push({ assetId, assetName });
}

if (!assets.length) {
  throw new Error("The model inventory does not contain any usable asset records.");
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(assets, null, 2)}\n`, "utf8");

console.log(`Generated ${assets.length} model records from Excel: ${outputPath}`);
