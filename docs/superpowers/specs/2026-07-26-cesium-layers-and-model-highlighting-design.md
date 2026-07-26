# Cesium Layers and Model Highlighting Design

Date: 2026-07-26

## Purpose

Extend the existing Sambor Prei Kuk CesiumJS viewer with a third optional point-cloud layer, move and rename the layer control, and add reversible whole-model highlighting when a visitor selects a photogrammetric building model.

## Scope

This phase changes only the existing Cesium viewer and its maintenance documentation. It does not change any Cesium ion asset, model position, model transform, existing monument-detail page, or GitHub Pages route.

## Layer configuration

The required base map remains unchanged:

- Asset `2`: Bing Maps Aerial, always enabled.
- Asset `1`: Cesium World Terrain, always enabled.

The `Layers` panel contains three optional layers. All three start disabled to reduce initial memory, network, and GPU load:

| Configuration key | Cesium ion asset | Visitor-facing label | Cesium type |
| --- | --- | --- | --- |
| `terrain-data` | `5015776 / SPK_Qgis_600_2` | Terrain Data | Imagery |
| `uav-aerial-point-cloud-data` | `4558719 / Pr.Sambor_Plan_new` | UAV Aerial Point Cloud Data | 3D Tiles |
| `slam-lidar-ground-point-cloud-data` | `5079833 / SPK_Ground_SLAM_2025` | SLAM LiDAR Ground Point Cloud Data | 3D Tiles |

The two point-cloud layers are optional context layers only. They are not added to the `tilesetToAsset` building-model mapping, do not open the model information panel, and do not receive the building-selection highlight.

Each checkbox carries a `data-layer-key` value. The JavaScript reads all optional-layer controls from the DOM and matches them to `layers.json`, avoiding a separate hard-coded control list.

## Layout

- Rename the control heading from `Layer` to `Layers`.
- Move the control from the upper-right corner to the lower-left corner.
- Position it above Cesium attribution so the two interfaces do not overlap.
- Allow enough width for the two longer point-cloud labels.
- On small screens, keep it aligned to the lower-left with responsive width.
- The model information panel keeps a higher stacking level and may cover the Layers control while a model record is open.

## Model-selection highlight

Selection continues to use the existing scene pick and `Cesium3DTileset` to asset-record `WeakMap`. No asset-specific conditionals are introduced.

A dedicated selection controller owns this state:

- currently selected tileset;
- the selected tileset's original `style`;
- a factory that creates the temporary highlight style.

Selecting a building model performs these operations in order:

1. Restore the previously selected tileset's original style, if one exists.
2. Save the newly selected tileset's current style exactly, including `undefined`.
3. Apply a new `Cesium3DTileStyle` to the entire tileset.
4. Open the existing information panel for the mapped asset record.

The highlight uses a light orange-yellow color with low opacity:

```js
new Cesium3DTileStyle({
  color: 'color("#F2B84B", 0.32)'
})
```

The implementation does not change the tileset transform, ion source data, or permanent style. It also does not highlight only the picked tile or picked screen position.

The current selection is cleared and the original style is restored when:

- the information panel close button is selected;
- the visitor presses Escape;
- the visitor clicks blank terrain or another unmapped object;
- the visitor selects a different mapped building model.

Selecting the same mapped model again keeps it selected without replacing the saved original style.

## Code organization

- `public/cesium/data/layers.json` remains the editable source for optional-layer Asset IDs, source names, labels, and types.
- `src/pages/cesium/index.astro` contains the three English checkbox controls.
- `src/styles/cesium.css` owns the lower-left responsive Layers layout.
- `src/scripts/tileset-selection.js` provides the small, dependency-injected selection controller.
- `src/scripts/cesium-viewer.js` creates the real `Cesium3DTileStyle`, connects the selection controller to picking and panel events, and loads optional layers.

## Error handling

- A failed optional layer returns its checkbox to the unchecked state, re-enables the control for a later retry, announces an English accessibility message, and logs its Asset ID and source name without stopping other layers or building models.
- Missing DOM controls or layer definitions are logged and only the affected control is disabled.
- Selection restoration is safe when the original style is absent.
- No token value is included in errors, logs, documentation, tests, or source code.

## Test strategy

Automated tests use Node's built-in test runner and exercise the real selection controller with simple tileset objects:

1. First selection stores the original style and applies the highlight style.
2. Selecting another tileset restores the first style and highlights the second.
3. Clearing selection restores the current tileset's original style.
4. Selecting the same tileset twice does not overwrite the saved original style.

Tests are written and observed failing before production implementation.

Browser verification checks:

- all 16 building models still load;
- all three optional layers start unchecked;
- Terrain Data loads and toggles;
- UAV Aerial Point Cloud Data loads and toggles;
- SLAM LiDAR Ground Point Cloud Data loads and toggles;
- selecting two different building models visibly moves the highlight and updates the information panel;
- closing the panel restores the selected model;
- clicking blank terrain restores the selected model and closes the panel;
- point-cloud layer clicks do not open a building information panel;
- desktop and mobile Layers layouts are usable;
- the browser console has no unexpected errors;
- GitHub Pages project-subpath assets still resolve.

## Preview toolbar

The bottom `Menu / Inspect / Audit / Settings` toolbar belongs to the Codex in-app preview environment. It is not created by the website or Cesium viewer, is useful for development inspection, and is not visible on the public GitHub Pages website. No website source change is required for it.

## Documentation

Update `README.md` with the new layer names, Asset ID, default-off behavior, lower-left layout, and selection-highlight behavior. Append the implementation and test results to `DEVELOPMENT_LOG.md`.

## Acceptance criteria

- The Layers panel is in the lower-left and shows the three requested English labels.
- All optional layers default to off and can be independently enabled and disabled.
- The SLAM point cloud is not treated as a selectable building record.
- A selected mapped building tileset receives a subtle whole-tileset orange-yellow highlight.
- Previous styles are restored on switching, closing, Escape, and blank-scene clicks.
- Existing Name, Description, and monument-detail links continue to work.
- No existing page route or Cesium ion asset is modified.
- Automated tests, the static build, and required browser checks pass.
