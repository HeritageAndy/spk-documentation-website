# Development Log

This file records the implementation and verification of the CesiumJS 3D archive. It never contains the complete Cesium ion token.

## 2026-07-21 | Stage 1: Repository and source-material review

- Changed: Performed a read-only review of the real Git repository, existing routes, Git status, Astro configuration, and GitHub Pages workflow.
- Created: No files.
- Reason: Confirmed the safe repository boundary before changing the website and preserved the legacy reference site in the parent directory.
- Revert or revise: No changes were made during this stage.
- Test result: The baseline build passed and generated 11 existing static routes.

## 2026-07-21 | Stage 2: Model inventory and credentials

- Changed: Added Excel-to-JSON conversion, Cesium ion metadata synchronization, Vite environment variables, and Git ignore rules.
- Created: `.env.example`, `scripts/sync-assets.mjs`, and `scripts/sync-metadata.mjs`.
- Reason: The browser must not read Excel directly, the token must not enter Git, and Description remains maintained in Cesium ion.
- Revert or revise: Remove the scripts and environment configuration to revert; edit Excel and run `npm.cmd run sync-assets` to revise the inventory.
- Test result: The source folder contained the private token document and 16 model records. At that time, 15 assets were readable and asset 5073918 returned 404.

## 2026-07-21 | Stage 3: CesiumJS viewer

- Changed: Added the independent `/cesium/` route, Cesium static assets, model loading, exact tileset-to-asset pick mapping, group framing, and the responsive information panel.
- Created: `src/pages/cesium/index.astro`, `src/scripts/cesium-viewer.js`, and `src/styles/cesium.css`.
- Reason: The existing Astro application already uses Vite and can build the independent viewer without changing any existing route.
- Revert or revise: Remove the page, script, and stylesheet and remove the Cesium static-copy configuration from `astro.config.mjs`.
- Test result: Fifteen models rendered; direct picks on N1 and N7 opened the correct live metadata and detail links.

## 2026-07-21 | Stage 4: Documentation and deployment configuration

- Changed: Added beginner maintenance instructions and passed the production token to the GitHub Pages build through an Actions secret.
- Created: No additional files; updated `README.md` and `.github/workflows/deploy.yml`.
- Reason: The local token cannot be committed, while the public build requires a separately restricted read-only token.
- Revert or revise: Remove the environment variable from the workflow Build step to revert; continue editing README for procedure changes.
- Test result: `.env.local` was ignored by Git and the workflow syntax passed the later simulated Pages build.

## 2026-07-21 | Stage 5: Initial build and regression verification

- Changed: Corrected the Cesium Workers and Assets copy paths and normalized the GitHub Pages base path.
- Created: `public/cesium/data/assets.json` and `public/cesium/data/metadata.json`.
- Reason: Cesium tile-decoding workers must resolve under `/cesium-static/Workers/`, including on a project Pages subpath.
- Revert or revise: The copy configuration is in `astro.config.mjs`; base normalization is in `src/pages/cesium/index.astro`.
- Test result: Installation, development server, build, model clicks, detail links, blank-scene close, mobile panel, original routes, Git ignore rules, and simulated project Pages paths passed. The only expected error was the then-unavailable N14-2 asset.

## 2026-07-21 | Stage 6: Home entry, English interface, base map, and optional layers

- Changed: Added a Home-page entry between Project History and Members; converted the Cesium interface and maintenance material to English; configured Bing Maps Aerial and Cesium World Terrain; added two optional Layer controls; removed the persistent model-count message.
- Created: `public/cesium/data/layers.json`.
- Reason: Visitors need a direct Home-page route into the viewer, a visible base map, and simple control over the project imagery and point-cloud layers.
- Revert or revise: Remove the Cesium Home section from `src/pages/index.astro`; edit Asset IDs and labels in `layers.json`; edit layer behavior in `src/scripts/cesium-viewer.js`.
- Test result:
  - `npm.cmd run sync-assets` generated 16 unique model records.
  - `npm.cmd run sync-metadata` synchronized all 16 records with 0 failures; N14-2 asset 5073918 is now COMPLETE and readable.
  - Astro check completed with 0 errors, 0 warnings, and 0 hints; the static build generated all 12 routes.
  - The Home-page link appears between Project History and Members and opens `/cesium/`.
  - The default scene visibly renders Bing Maps Aerial over Cesium World Terrain.
  - Terrain Data asset 5015776 and Point Cloud Data asset 4558719 both loaded, turned on, and turned off through their checkboxes without console errors.
  - All 16 photogrammetric models loaded with 0 failures. Direct model selection opened the correct N1 Name, Description, and new-tab detail link; a blank-scene click and the close button closed the panel.
  - The loading message disappeared after initialization and no model-count message remained.
  - At 390 by 844 pixels, the English heading and Layer control did not overlap, and the model information panel opened from the bottom.
  - A source and build scan found no Chinese, Japanese, or Korean characters in project text content.
  - A simulated GitHub Pages build verified the Home link, Cesium static base, layer configuration, Cesium Worker path, and original Project route under the repository subpath.
  - `.env.local` remained ignored and untracked; no complete token was written to logs, documentation, comments, or source code.

## 2026-07-26 | Stage 7: SLAM layer, lower-left controls, and model highlighting

- Changed:
  - Renamed the control heading to **Layers** and moved it to the lower-left corner on desktop and mobile layouts.
  - Renamed the Pr.Sambor_Plan_new layer to **UAV Aerial Point Cloud Data**.
  - Added SPK_Ground_SLAM_2025 asset 5079833 as **SLAM LiDAR Ground Point Cloud Data**.
  - Kept Terrain Data, UAV Aerial Point Cloud Data, and SLAM LiDAR Ground Point Cloud Data turned off by default.
  - Added reversible whole-tileset highlighting for selected photogrammetric models.
- Created:
  - `src/scripts/tileset-selection.js` for reusable selection and exact style restoration.
  - `tests/tileset-selection.test.mjs` for selection-switching and restoration tests.
  - `docs/superpowers/specs/2026-07-26-cesium-layers-and-model-highlighting-design.md`.
  - `docs/superpowers/plans/2026-07-26-cesium-layers-and-model-highlighting.md`.
- Reason: The site-wide SLAM point cloud is contextual layer data rather than a monument record, and a selected building needs a clear visual relationship with its information panel without changing the Cesium ion source asset.
- Revert or revise:
  - Edit optional Asset IDs, source names, and labels in `public/cesium/data/layers.json`.
  - Edit the lower-left layout in `src/styles/cesium.css`.
  - Edit highlight color and opacity in `src/scripts/cesium-viewer.js`.
  - Remove the selection-controller calls from `cesium-viewer.js` to disable highlighting; the original tileset style is restored automatically whenever selection is cleared.
- Test result:
  - Four automated selection tests passed, including first selection, switching between models, restoring an undefined style, and repeated selection of the same tileset.
  - Astro check completed with 0 errors, 0 warnings, and 0 hints; the static build generated all 12 routes.
  - The 16-item building inventory completed loading without a failure log or browser console warning/error.
  - All three layer checkboxes were initially clear. Assets 5015776, 4558719, and 5079833 each loaded, became visible, and turned off again through the interface.
  - Clicking the SLAM point cloud did not open a building information panel.
  - Direct selection of N1 asset 5075835 and N10 asset 5073914 opened the correct Name, Description, and detail link.
  - Switching from N1 to N10 restored N1's original appearance and highlighted the complete N10 tileset. The light orange-yellow highlight preserved visible model texture.
  - The close button, Escape key, and empty-terrain click each closed the panel and restored the selected model's original style.
  - At 390 by 844 pixels, the lower-left Layers control remained inside the viewport without overlapping the heading, and the information panel opened from the bottom.
  - Detail links retained `target="_blank"` and `rel="noopener noreferrer"`.
  - A simulated GitHub Pages build verified the `/spk-documentation-website/cesium/` route, Cesium static-resource base, Home link, Worker folder, SLAM layer configuration, and an original Project route.
  - Source scans found no CJK project text or complete token outside `.env.local`; `.env.local` remained ignored and untracked, and the private token document remained outside the repository.
  - The optional `npm audit` check could not produce a report because both npm and Yarn registry audit endpoints returned a compressed, non-JSON response to npm despite successful registry connectivity. This external audit-response error did not affect installation, tests, builds, or browser operation.
