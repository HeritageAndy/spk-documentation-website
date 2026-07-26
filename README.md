# Sambor Prei Kuk Documentation Website

This repository builds the static Sambor Prei Kuk documentation website. It preserves the existing Home, Story, Project, Digital Archives, article, and monument-detail routes and adds an independent CesiumJS 3D archive at:

```text
/cesium/
```

The expected GitHub Pages address is:

```text
https://heritageandy.github.io/spk-documentation-website/cesium/
```

The viewer loads all photogrammetric models listed in the Excel inventory, uses Bing Maps Aerial as its base imagery, uses Cesium World Terrain, and provides three optional layers named **Terrain Data**, **UAV Aerial Point Cloud Data**, and **SLAM LiDAR Ground Point Cloud Data**. Visitors can click a photogrammetric model to highlight the complete model, read its live Cesium ion Name and Description, and open the linked monument record.

## 1. Basic terms

- **Cesium ion** is the online service that stores and publishes the project's spatial assets.
- **CesiumJS** is the npm package that displays those assets in a web browser. This project does not use a CDN.
- **Asset ID** is the numeric identifier assigned to an asset by Cesium ion.
- **Token** is the credential used by the public page to read selected ion assets. A Vite token becomes visible in the browser, so it must have the minimum possible permissions.

## 2. Main files and folders

```text
SPK Documentation/
|-- spk-CesiumJS/
|   |-- SPK_Cesium_Asset_List.xlsx       Source model inventory
|   `-- cesium-token-private.txt.txt      Private source token document; never commit
`-- spk-documentation-website/            Git repository
    |-- .github/workflows/deploy.yml      GitHub Pages workflow
    |-- .env.example                      Safe token placeholder
    |-- .env.local                        Local token; ignored by Git
    |-- scripts/
    |   |-- sync-assets.mjs               Converts Excel to JSON
    |   `-- sync-metadata.mjs             Refreshes the local metadata fallback
    |-- public/cesium/data/
    |   |-- assets.json                   Generated model inventory
    |   |-- layers.json                   Base map and optional layer configuration
    |   `-- metadata.json                 Generated Name and Description fallback
    |-- src/pages/cesium/index.astro      Cesium page structure
    |-- src/scripts/cesium-viewer.js      Cesium loading and interaction logic
    |-- src/styles/cesium.css             Cesium page design
    |-- DEVELOPMENT_LOG.md                Development and test record
    `-- README.md                         This guide
```

Do not edit generated folders such as `node_modules`, `dist`, or `.astro`.

## 3. First installation

Open PowerShell. The next command may be run from any location. It enters the real website repository.

```powershell
cd "C:\Users\Herit\Documents\SPK Documentation\spk-documentation-website"
```

Run the next command from `spk-documentation-website`. It installs Astro, CesiumJS, and the inventory conversion tools.

```powershell
npm.cmd install
```

`npm.cmd` is used because some Windows systems block the `npm.ps1` script.

## 4. Start and stop the local website

Run this command from `spk-documentation-website`. The terminal will remain busy while the local server is running.

```powershell
npm.cmd run dev
```

Open the Home page at:

```text
http://localhost:4321/
```

Open the Cesium page directly at:

```text
http://localhost:4321/cesium/
```

To stop the server, return to its PowerShell window and press `Ctrl + C`. If Windows asks whether to terminate the job, type `Y` and press Enter.

## 5. Edit the model inventory

The source inventory is:

```text
C:\Users\Herit\Documents\SPK Documentation\spk-CesiumJS\SPK_Cesium_Asset_List.xlsx
```

The first row must contain `asset_id` and `asset_name`. Capitalization does not matter. Each later row represents one complete photogrammetric 3D Tiles model.

- Put the numeric Cesium ion Asset ID in `asset_id`.
- Put a recognizable model name in `asset_name`.
- Do not copy Description text into Excel.
- Do not repeat an Asset ID.
- Save and close Excel before synchronizing.

Run this command from `spk-documentation-website`. It rebuilds `public/cesium/data/assets.json`; the browser never reads Excel directly.

```powershell
npm.cmd run sync-assets
```

## 6. Refresh Name and Description

Edit each model's Name and Description directly in Cesium ion. The Description may include plain text, Markdown headings, Markdown links, and complete `http` or `https` URLs. The page reads current metadata by Asset ID whenever it opens and safely renders supported text and links without executing HTML.

Run this command from `spk-documentation-website` to refresh the local fallback file.

```powershell
npm.cmd run sync-metadata
```

The command updates `public/cesium/data/metadata.json`. If one asset fails, the remaining assets continue to synchronize.

## 7. Add a new photogrammetric model

1. Upload and position the model in Cesium ion.
2. Complete its Name and Description and add the existing monument-detail link.
3. Add its Asset ID and Asset Name to the end of the Excel inventory.
4. Add the asset to the public token's selected assets when restrictions are enabled.
5. Save and close Excel.
6. Run the following three commands from `spk-documentation-website`.

The first command updates the browser inventory.

```powershell
npm.cmd run sync-assets
```

The second command updates the local metadata fallback.

```powershell
npm.cmd run sync-metadata
```

The third command verifies the complete static website.

```powershell
npm.cmd run build
```

## 8. Delete a photogrammetric model from the page

Delete the model's row from Excel, save the workbook, and run `sync-assets`, `sync-metadata`, and `build` again. This removes the model from the website inventory but does not delete the source asset from Cesium ion.

## 9. Configure base and optional layers

Layer Asset IDs and labels are maintained in `public/cesium/data/layers.json`.

- Asset `2`, **Bing Maps Aerial**, is always enabled as base imagery.
- Asset `1`, **Cesium World Terrain**, is always enabled as the terrain provider.
- Asset `5015776`, source name **SPK_Qgis_600_2**, is an ion imagery asset shown to visitors as **Terrain Data**.
- Asset `4558719`, source name **Pr.Sambor_Plan_new**, is a 3D Tiles point-cloud asset shown as **UAV Aerial Point Cloud Data**.
- Asset `5079833`, source name **SPK_Ground_SLAM_2025**, is a 3D Tiles point-cloud asset shown as **SLAM LiDAR Ground Point Cloud Data**.

The **Layers** control appears in the lower-left corner of the viewer. All three optional layers start turned off to reduce the initial load on the visitor's device. A layer loads the first time its checkbox is selected. These point-cloud layers are contextual data only: clicking them does not open a building information panel. If an Asset ID changes, edit only `layers.json`, then rebuild the site.

Clicking a photogrammetric building model applies a light orange-yellow style to the complete tileset while keeping the original texture visible. Selecting another model, closing the information panel, pressing Escape, or clicking empty terrain restores the previous model's exact original style. This is a temporary browser effect and never changes the Cesium ion asset.

## 10. Update the local token

The local token is stored in:

```text
spk-documentation-website/.env.local
```

Use this format and replace only the placeholder after the equals sign:

```dotenv
VITE_CESIUM_ION_TOKEN=your_restricted_public_token_here
```

Do not add quotes or spaces. `.env.example` must contain only a placeholder. Stop and restart the local server after changing `.env.local`.

The source token document must never be copied into the repository. Git history can preserve a secret even after a later deletion.

For the public website, create a dedicated Cesium ion token with:

- `assets:read` only; do not enable `assets:list`, `assets:write`, or account-management access.
- Access limited to the 16 photogrammetric models, Bing Maps Aerial, Cesium World Terrain, SPK_Qgis_600_2, Pr.Sambor_Plan_new, and SPK_Ground_SLAM_2025.
- Allowed URL `https://heritageandy.github.io/spk-documentation-website/`.
- Optional local Allowed URL `http://localhost:4321/` while testing.

## 11. Rebuild the website

Run this command from `spk-documentation-website`. It checks the code and rebuilds the complete static site in `dist`; it does not publish anything.

```powershell
npm.cmd run build
```

To inspect the built output locally, run this command from the same folder.

```powershell
npm.cmd run preview
```

Use the address printed in PowerShell. Press `Ctrl + C` when finished.

## 12. Deploy to the existing GitHub Pages website

The repository already contains `.github/workflows/deploy.yml`. When reviewed code reaches `main`, GitHub Actions installs dependencies, builds `dist`, and deploys it to Pages. Local work does not publish automatically.

Before deployment, add the restricted production token on GitHub:

1. Open the repository **Settings**.
2. Open **Secrets and variables**, then **Actions**.
3. Select **New repository secret**.
4. Use the name `VITE_CESIUM_ION_TOKEN`.
5. Paste the restricted public token as the secret value.
6. Save it before running the Pages workflow.

Astro automatically applies the repository prefix in GitHub Actions. Keep the source route as `/cesium/`; do not hard-code `/spk-documentation-website/` in page code.

## 13. Common problems

### PowerShell blocks npm.ps1

Use `npm.cmd` as shown in this guide. Do not weaken the Windows security policy.

### The page says the token is not configured

Confirm that `.env.local` exists, the variable is named exactly `VITE_CESIUM_ION_TOKEN`, and a value follows the equals sign. Restart the development server.

### An asset returns 401 or Invalid access token

The token is invalid, revoked, or missing `assets:read`. Replace it with a valid restricted public token.

### An asset returns 403

The current page may be absent from Allowed URLs, or the Asset ID may be absent from selected assets. Correct the token restrictions and refresh the page.

### An asset returns 404

The Asset ID may be incorrect or deleted. Check Excel or `layers.json` against Cesium ion. One model failure does not stop the other models.

### The base map does not appear

Confirm that the token can read assets `1` and `2` and that the current URL is allowed. The viewer treats Bing Maps Aerial as required and reports an error instead of opening an empty globe.

### An optional layer does not appear

Check the browser console for its Asset ID and source name. Confirm that asset `5015776` is an imagery asset and assets `4558719` and `5079833` are complete 3D Tiles assets accessible to the token.

### Excel synchronization cannot find the columns

Confirm that the first row contains `asset_id` and `asset_name` without extra spaces. Capitalization may differ.

### The model page opens but no models appear

Wait for loading to finish, check the failed Asset ID and name in the browser console, and confirm that each model is COMPLETE, is 3D Tiles, and remains spatially positioned in Cesium ion.

### A Description link does not appear

Use a complete `http://` or `https://` URL. A Markdown link must follow `[Link text](https://complete-address.example)`.

### GitHub Pages shows a blank page or static-resource 404

Confirm that the repository workflow is used, the GitHub secret is named exactly `VITE_CESIUM_ION_TOKEN`, and Astro's automatic `base` configuration has not been replaced.

## 14. Files that must not be committed

Never commit:

- `.env.local`;
- the source token document or any file, screenshot, or log containing a complete token;
- a token with `assets:list`, `assets:write`, or other private permissions;
- `node_modules`, `dist`, or `.astro`;
- source photogrammetry, TLS, OBJ, PLY, LAS, E57, or photo datasets.

The generated `assets.json`, `metadata.json`, `layers.json`, source pages, scripts, styles, README, development log, and workflow configuration may be committed after review.

Run this command from `spk-documentation-website` before committing. It only reports file status and does not upload anything.

```powershell
git status
```

Confirm that neither `.env.local` nor a token document appears in the list.
