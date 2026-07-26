# Cesium Layers and Model Highlighting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the SLAM ground point cloud as a third default-off optional layer, move the renamed Layers control to the lower-left, and add reversible whole-tileset highlighting for selected building models.

**Architecture:** Keep ion Asset IDs and visitor labels in `layers.json`, discover optional-layer inputs through `data-layer-key`, and preserve the existing `WeakMap` from building tilesets to asset records. Put highlight state and exact style restoration in a small dependency-injected controller, while `cesium-viewer.js` supplies the real `Cesium3DTileStyle` and connects it to panel and scene-pick events.

**Tech Stack:** Astro 7, Vite, JavaScript ES modules, CesiumJS 1.143, Node built-in test runner, HTML, CSS, GitHub Pages static output.

## Global Constraints

- Keep all website, source, test, README, and development-log content in English.
- Keep Bing Maps Aerial Asset `2` and Cesium World Terrain Asset `1` always enabled.
- Keep all three optional layers unchecked and unloaded at startup.
- Use `Cesium3DTileStyle` for the entire selected building tileset and restore its exact previous `style`.
- Do not add optional point clouds to the building `tilesetToAsset` mapping.
- Do not change ion data, model transforms, positions, rotations, heights, routes, or monument-detail pages.
- Do not add per-asset building conditionals.
- Do not change the Codex preview toolbar.
- Use `npm.cmd` on Windows.
- Do not push or publish.

## File structure

- Create `src/scripts/tileset-selection.js`: framework-independent selected-tileset state and style restoration.
- Create `tests/tileset-selection.test.mjs`: unit tests for first selection, switching, clearing, and repeated selection.
- Modify `package.json`: add the `test` command using Node's built-in runner.
- Modify `public/cesium/data/layers.json`: rename the UAV layer and add Asset `5079833`.
- Modify `src/pages/cesium/index.astro`: rename the panel, add three keyed checkboxes, and keep English-only copy.
- Modify `src/scripts/cesium-viewer.js`: generic optional-layer control discovery and selection-controller integration.
- Modify `src/styles/cesium.css`: lower-left Layers layout and responsive sizing.
- Modify `README.md`: document the three optional layers and highlight interaction.
- Modify `DEVELOPMENT_LOG.md`: record the phase, files, rationale, reversal path, and actual test results.

---

### Task 1: Reversible tileset-selection controller

**Files:**
- Create: `tests/tileset-selection.test.mjs`
- Create: `src/scripts/tileset-selection.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: `createHighlightStyle: () => unknown`
- Produces: `createTilesetSelectionController({ createHighlightStyle })` returning `{ select(tileset), clear(), getSelectedTileset() }`

- [ ] **Step 1: Add the test command**

Add this script to `package.json`:

```json
"test": "node --test tests/*.test.mjs"
```

- [ ] **Step 2: Write the failing controller tests**

Create `tests/tileset-selection.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { createTilesetSelectionController } from "../src/scripts/tileset-selection.js";

function createController() {
  let sequence = 0;
  return createTilesetSelectionController({
    createHighlightStyle: () => ({ highlight: ++sequence })
  });
}

test("select stores the original style and applies a highlight style", () => {
  const originalStyle = { name: "original" };
  const tileset = { style: originalStyle };
  const controller = createController();

  controller.select(tileset);

  assert.deepEqual(tileset.style, { highlight: 1 });
  assert.equal(controller.getSelectedTileset(), tileset);
});

test("selecting another tileset restores the previous style", () => {
  const firstOriginal = { name: "first" };
  const secondOriginal = { name: "second" };
  const first = { style: firstOriginal };
  const second = { style: secondOriginal };
  const controller = createController();

  controller.select(first);
  controller.select(second);

  assert.equal(first.style, firstOriginal);
  assert.deepEqual(second.style, { highlight: 2 });
  assert.equal(controller.getSelectedTileset(), second);
});

test("clear restores an undefined original style exactly", () => {
  const tileset = { style: undefined };
  const controller = createController();

  controller.select(tileset);
  controller.clear();

  assert.equal(tileset.style, undefined);
  assert.equal(controller.getSelectedTileset(), undefined);
});

test("selecting the same tileset twice does not replace its saved original style", () => {
  const originalStyle = { name: "original" };
  const tileset = { style: originalStyle };
  const controller = createController();

  controller.select(tileset);
  const firstHighlight = tileset.style;
  controller.select(tileset);
  controller.clear();

  assert.equal(tileset.style, originalStyle);
  assert.deepEqual(firstHighlight, { highlight: 1 });
});
```

- [ ] **Step 3: Run the tests and verify RED**

Run:

```powershell
npm.cmd test
```

Expected: FAIL because `src/scripts/tileset-selection.js` does not exist.

- [ ] **Step 4: Implement the minimal controller**

Create `src/scripts/tileset-selection.js`:

```js
export function createTilesetSelectionController({ createHighlightStyle }) {
  if (typeof createHighlightStyle !== "function") {
    throw new TypeError("createHighlightStyle must be a function.");
  }

  let selectedTileset;
  let originalStyle;

  function clear() {
    if (!selectedTileset) return;
    selectedTileset.style = originalStyle;
    selectedTileset = undefined;
    originalStyle = undefined;
  }

  function select(tileset) {
    if (!tileset || tileset === selectedTileset) return;
    clear();
    selectedTileset = tileset;
    originalStyle = tileset.style;
    tileset.style = createHighlightStyle();
  }

  return {
    select,
    clear,
    getSelectedTileset: () => selectedTileset
  };
}
```

- [ ] **Step 5: Run the tests and verify GREEN**

Run:

```powershell
npm.cmd test
```

Expected: 4 tests pass with 0 failures.

- [ ] **Step 6: Commit the controller and tests**

```powershell
git add package.json tests/tileset-selection.test.mjs src/scripts/tileset-selection.js
git commit -m "Add reversible Cesium tileset selection"
```

---

### Task 2: Integrate whole-model highlighting

**Files:**
- Modify: `src/scripts/cesium-viewer.js`

**Interfaces:**
- Consumes: `createTilesetSelectionController({ createHighlightStyle })`
- Produces: scene selection behavior that highlights one mapped building tileset and restores previous styles on switching or clearing

- [ ] **Step 1: Create the real highlight style and controller**

Import the dependencies:

```js
import {
  Cesium3DTileStyle,
  // existing Cesium imports remain
} from "cesium";
import { createTilesetSelectionController } from "./tileset-selection.js";
```

Create one controller near the existing maps:

```js
const modelSelection = createTilesetSelectionController({
  createHighlightStyle: () =>
    new Cesium3DTileStyle({
      color: 'color("#F2B84B", 0.32)'
    })
});
```

- [ ] **Step 2: Make panel closing restore the selected model**

Change `closePanel()` so restoration happens before hiding the panel:

```js
function closePanel() {
  modelSelection.clear();
  panel.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
  panel.inert = true;
  delete panel.dataset.assetId;
}
```

- [ ] **Step 3: Connect mapped picks to whole-tileset selection**

In the left-click handler:

```js
if (asset) {
  modelSelection.select(tileset);
  openPanel(asset);
} else {
  closePanel();
}
```

The existing close button, Escape handler, and blank-scene branch all call `closePanel()` and therefore share the same restoration path.

- [ ] **Step 4: Run unit tests and static build**

Run:

```powershell
npm.cmd test
```

Expected: 4 tests pass.

Run:

```powershell
npm.cmd run build
```

Expected: Astro check reports 0 errors and the 12 static routes build.

- [ ] **Step 5: Commit the viewer integration**

```powershell
git add src/scripts/cesium-viewer.js
git commit -m "Highlight selected Cesium building models"
```

---

### Task 3: Add and reposition optional layers

**Files:**
- Modify: `public/cesium/data/layers.json`
- Modify: `src/pages/cesium/index.astro`
- Modify: `src/scripts/cesium-viewer.js`
- Modify: `src/styles/cesium.css`

**Interfaces:**
- Consumes: optional layer definitions with `{ key, assetId, assetName, label, type }`
- Produces: three default-off checkbox inputs carrying matching `data-layer-key` values

- [ ] **Step 1: Update the optional-layer configuration**

Use these three entries:

```json
[
  {
    "key": "terrain-data",
    "assetId": 5015776,
    "assetName": "SPK_Qgis_600_2",
    "label": "Terrain Data",
    "type": "imagery"
  },
  {
    "key": "uav-aerial-point-cloud-data",
    "assetId": 4558719,
    "assetName": "Pr.Sambor_Plan_new",
    "label": "UAV Aerial Point Cloud Data",
    "type": "tileset"
  },
  {
    "key": "slam-lidar-ground-point-cloud-data",
    "assetId": 5079833,
    "assetName": "SPK_Ground_SLAM_2025",
    "label": "SLAM LiDAR Ground Point Cloud Data",
    "type": "tileset"
  }
]
```

- [ ] **Step 2: Replace the panel markup**

Use `Layers` and three unchecked inputs:

```html
<aside class="layer-control" aria-label="Layer controls">
  <h2>Layers</h2>
  <label class="layer-toggle" for="terrain-data-toggle">
    <input id="terrain-data-toggle" type="checkbox" data-layer-key="terrain-data" />
    <span>Terrain Data</span>
  </label>
  <label class="layer-toggle" for="uav-aerial-point-cloud-data-toggle">
    <input
      id="uav-aerial-point-cloud-data-toggle"
      type="checkbox"
      data-layer-key="uav-aerial-point-cloud-data"
    />
    <span>UAV Aerial Point Cloud Data</span>
  </label>
  <label class="layer-toggle" for="slam-lidar-ground-point-cloud-data-toggle">
    <input
      id="slam-lidar-ground-point-cloud-data-toggle"
      type="checkbox"
      data-layer-key="slam-lidar-ground-point-cloud-data"
    />
    <span>SLAM LiDAR Ground Point Cloud Data</span>
  </label>
  <p id="layer-status" class="visually-hidden" role="status" aria-live="polite"></p>
</aside>
```

- [ ] **Step 3: Discover controls by configuration key**

Replace fixed input constants with:

```js
const optionalLayerInputs = Array.from(
  document.querySelectorAll(".layer-toggle input[data-layer-key]")
);
```

Replace the fixed `controls` array in `connectOptionalLayers()` with:

```js
for (const input of optionalLayerInputs) {
  const key = input.dataset.layerKey;
  const definition = definitions.get(key);
  // keep the existing loading, show/hide, status, and failure behavior
}
```

The required-element check verifies `optionalLayerInputs.length > 0` instead of checking named input constants.

- [ ] **Step 4: Move the Layers control to the lower-left**

Update desktop positioning:

```css
.layer-control {
  left: max(22px, env(safe-area-inset-left));
  right: auto;
  top: auto;
  bottom: max(42px, calc(env(safe-area-inset-bottom) + 42px));
  width: min(340px, calc(100vw - 44px));
}
```

Update mobile positioning:

```css
.layer-control {
  left: max(14px, env(safe-area-inset-left));
  right: auto;
  top: auto;
  bottom: max(40px, calc(env(safe-area-inset-bottom) + 40px));
  width: min(342px, calc(100vw - 28px));
  min-width: 0;
}
```

- [ ] **Step 5: Run tests and build**

```powershell
npm.cmd test
```

Expected: 4 tests pass.

```powershell
npm.cmd run build
```

Expected: Astro check reports 0 errors and the static build includes `/cesium/`.

- [ ] **Step 6: Commit the layer changes**

```powershell
git add public/cesium/data/layers.json src/pages/cesium/index.astro src/scripts/cesium-viewer.js src/styles/cesium.css
git commit -m "Add optional SLAM layer controls"
```

---

### Task 4: Documentation and complete verification

**Files:**
- Modify: `README.md`
- Modify: `DEVELOPMENT_LOG.md`

**Interfaces:**
- Consumes: actual test and browser results from Tasks 1-3
- Produces: beginner maintenance guidance and an auditable phase record

- [ ] **Step 1: Update README**

Document:

- `Layers` is in the lower-left;
- all optional layers default to off;
- Asset `5015776` is Terrain Data;
- Asset `4558719` is UAV Aerial Point Cloud Data;
- Asset `5079833` is SLAM LiDAR Ground Point Cloud Data;
- optional point clouds do not open building records;
- building selection uses a reversible whole-tileset highlight;
- deployment tokens must include all three optional assets with `assets:read`.

- [ ] **Step 2: Start the local server**

Run from the repository root:

```powershell
npm.cmd run dev
```

Use the exact local URL reported by Astro.

- [ ] **Step 3: Verify the viewer in a real browser**

Check and record:

1. All 16 mapped building models load.
2. All three optional checkboxes start unchecked.
3. Each optional layer turns on and off independently.
4. Selecting N1 opens its existing information and visibly highlights the entire N1 tileset.
5. Selecting a second mapped building restores N1 and highlights the second tileset.
6. The close button restores the second model.
7. Escape closes the panel and restores the selected model.
8. Blank terrain closes the panel and restores the model.
9. Optional point-cloud clicks do not open a building panel.
10. At 390 by 844 pixels, the lower-left Layers control remains usable and the model panel opens from the bottom.
11. The browser console contains no unexpected error or warning.

- [ ] **Step 4: Verify the GitHub Pages project subpath**

Build with the existing simulated GitHub Actions environment and confirm:

- Home points to `/spk-documentation-website/cesium/`;
- Cesium static files resolve under `/spk-documentation-website/cesium-static/`;
- `dist/cesium/data/layers.json` contains Asset `5079833`;
- original routes remain present.

- [ ] **Step 5: Update the development log with actual evidence**

Append a dated stage containing:

- files changed;
- why each change was made;
- how to revert or revise it;
- automated test counts;
- build results;
- layer toggle results;
- two-model highlight-switch results;
- close, Escape, and blank-click restoration results;
- desktop/mobile layout results;
- console results;
- token and Git-ignore safety results.

- [ ] **Step 6: Run final verification**

```powershell
npm.cmd test
```

Expected: 4 tests pass.

```powershell
npm.cmd run build
```

Expected: Astro check has 0 errors and all 12 routes build.

```powershell
npm.cmd audit --omit=dev
```

Expected: 0 vulnerabilities.

Run `git diff --check`, the English-only source scan, the complete-token pattern scan excluding `.env.local`, and confirm `.env.local` is ignored and untracked.

- [ ] **Step 7: Commit documentation**

```powershell
git add README.md DEVELOPMENT_LOG.md
git commit -m "Document Cesium layer and highlight updates"
```

- [ ] **Step 8: Stop the local server**

```powershell
npm.cmd run dev -- stop
```

Do not push or deploy.
