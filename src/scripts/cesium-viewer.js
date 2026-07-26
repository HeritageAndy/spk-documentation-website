import {
  BoundingSphere,
  Cesium3DTileStyle,
  Cesium3DTileset,
  CesiumTerrainProvider,
  Color,
  HeadingPitchRange,
  ImageryLayer,
  Ion,
  IonImageryProvider,
  Matrix4,
  ScreenSpaceEventType,
  Viewer
} from "cesium";
import { createTilesetSelectionController } from "./tileset-selection.js";

const app = document.querySelector("#cesium-app");
const status = document.querySelector("#loading-status");
const statusText = document.querySelector("#loading-status-text");
const layerStatus = document.querySelector("#layer-status");
const terrainDataToggle = document.querySelector("#terrain-data-toggle");
const pointCloudDataToggle = document.querySelector("#point-cloud-data-toggle");
const panel = document.querySelector("#model-panel");
const panelClose = document.querySelector("#panel-close");
const modelName = document.querySelector("#model-name");
const modelDescription = document.querySelector("#model-description");
const baseUrl = app?.dataset.baseUrl || "/";
const token = window.__SPK_CESIUM_CONFIG__?.token?.trim();

const tilesetToAsset = new WeakMap();
const loadedTilesets = [];
const modelSelection = createTilesetSelectionController({
  createHighlightStyle: () =>
    new Cesium3DTileStyle({
      color: 'color("#F2B84B", 0.32)'
    })
});

function setStatus(message, state = "loading") {
  status.hidden = false;
  status.classList.remove("is-hidden");
  statusText.textContent = message;
  status.dataset.state = state;
}

function hideStatus() {
  status.dataset.state = "ready";
  status.classList.add("is-hidden");
  window.setTimeout(() => {
    if (status.classList.contains("is-hidden")) status.hidden = true;
  }, 240);
}

function assetDataUrl(fileName) {
  return `${baseUrl}cesium/data/${fileName}`;
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function loadFallbackMetadata() {
  try {
    const records = await fetchJson(assetDataUrl("metadata.json"));
    return new Map(records.map((record) => [record.assetId, record]));
  } catch (error) {
    console.warn("[Cesium] The local metadata fallback is unavailable.", error);
    return new Map();
  }
}

async function fetchAssetMetadata(asset, fallbackById) {
  try {
    const metadata = await fetchJson(`https://api.cesium.com/v1/assets/${asset.assetId}`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` }
    });
    return {
      assetId: asset.assetId,
      name: String(metadata.name || asset.assetName),
      description: String(metadata.description || "")
    };
  } catch (error) {
    const fallback = fallbackById.get(asset.assetId);
    console.warn(
      `[Cesium] Metadata request failed; using the local fallback: assetId=${asset.assetId}, assetName=${asset.assetName}`,
      error
    );
    return (
      fallback || {
        assetId: asset.assetId,
        name: asset.assetName,
        description: ""
      }
    );
  }
}

function safeLinkUrl(rawUrl) {
  try {
    const url = new URL(rawUrl, window.location.href);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function appendInlineMarkdown(container, text) {
  const linkPattern = /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+)/g;
  let cursor = 0;

  for (const match of text.matchAll(linkPattern)) {
    if (match.index > cursor) {
      container.append(document.createTextNode(text.slice(cursor, match.index)));
    }

    const label = match[1] || match[3];
    const href = safeLinkUrl(match[2] || match[3]);

    if (href) {
      const link = document.createElement("a");
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = label;
      container.append(link);
    } else {
      container.append(document.createTextNode(match[0]));
    }

    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    container.append(document.createTextNode(text.slice(cursor)));
  }
}

function renderSafeDescription(description) {
  modelDescription.replaceChildren();

  if (!description.trim()) {
    const empty = document.createElement("p");
    empty.className = "description-empty";
    empty.textContent = "No description is available for this Cesium ion asset.";
    modelDescription.append(empty);
    return;
  }

  let currentList = null;

  for (const rawLine of description.replaceAll("\r\n", "\n").split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      currentList = null;
      continue;
    }

    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      currentList = null;
      const heading = document.createElement("h3");
      appendInlineMarkdown(heading, headingMatch[1]);
      modelDescription.append(heading);
      continue;
    }

    const listMatch = line.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      if (!currentList) {
        currentList = document.createElement("ul");
        modelDescription.append(currentList);
      }
      const item = document.createElement("li");
      appendInlineMarkdown(item, listMatch[1]);
      currentList.append(item);
      continue;
    }

    currentList = null;
    const paragraph = document.createElement("p");
    appendInlineMarkdown(paragraph, line);
    modelDescription.append(paragraph);
  }
}

function openPanel(asset) {
  modelName.textContent = asset.name;
  renderSafeDescription(asset.description);
  panel.dataset.assetId = String(asset.assetId);
  panel.classList.add("is-open");
  panel.setAttribute("aria-hidden", "false");
  panel.inert = false;
}

function closePanel() {
  modelSelection.clear();
  panel.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
  panel.inert = true;
  delete panel.dataset.assetId;
}

function frameLoadedModels(viewer) {
  if (!loadedTilesets.length) return Promise.resolve();

  const boundingSphere = BoundingSphere.fromBoundingSpheres(
    loadedTilesets.map((tileset) => tileset.boundingSphere)
  );
  const range = Math.max(boundingSphere.radius * 2.8, 200);

  viewer.camera.viewBoundingSphere(
    boundingSphere,
    new HeadingPitchRange(0, -0.55, range)
  );
  viewer.camera.lookAtTransform(Matrix4.IDENTITY);
  return Promise.resolve();
}

function waitForVisibleTiles(viewer, timeout = 10000) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const removeListener = viewer.scene.postRender.addEventListener(() => {
      const finished = loadedTilesets.every((tileset) => tileset.tilesLoaded);
      if (finished || Date.now() - startedAt >= timeout) {
        removeListener();
        resolve();
      }
    });
    viewer.scene.requestRender();
  });
}

async function createRequiredMap(layerConfig) {
  const baseImageryId = layerConfig?.baseImagery?.assetId;
  const worldTerrainId = layerConfig?.worldTerrain?.assetId;

  if (!Number.isSafeInteger(baseImageryId) || !Number.isSafeInteger(worldTerrainId)) {
    throw new Error("The required base map configuration is incomplete.");
  }

  const [baseImageryProvider, terrainProvider] = await Promise.all([
    IonImageryProvider.fromAssetId(baseImageryId),
    CesiumTerrainProvider.fromIonAssetId(worldTerrainId)
  ]);

  return {
    baseLayer: new ImageryLayer(baseImageryProvider),
    terrainProvider
  };
}

function connectOptionalLayers(viewer, layerConfig) {
  const layers = Array.isArray(layerConfig?.optionalLayers) ? layerConfig.optionalLayers : [];
  const definitions = new Map(layers.map((layer) => [layer.key, layer]));
  const loaded = new Map();

  const controls = [
    { key: "terrain-data", input: terrainDataToggle },
    { key: "point-cloud-data", input: pointCloudDataToggle }
  ];

  async function loadLayer(definition) {
    if (definition.type === "imagery") {
      const provider = await IonImageryProvider.fromAssetId(definition.assetId);
      const imageryLayer = viewer.imageryLayers.addImageryProvider(provider);
      imageryLayer.show = true;
      return imageryLayer;
    }

    if (definition.type === "tileset") {
      const tileset = await Cesium3DTileset.fromIonAssetId(definition.assetId, {
        enablePick: true
      });
      viewer.scene.primitives.add(tileset);
      tileset.show = true;
      return tileset;
    }

    throw new Error(`Unsupported optional layer type: ${definition.type}`);
  }

  for (const { key, input } of controls) {
    const definition = definitions.get(key);

    if (!definition || !input) {
      console.error(`[Cesium] Optional layer control is incomplete: ${key}`);
      if (input) input.disabled = true;
      continue;
    }

    input.addEventListener("change", async () => {
      const shouldShow = input.checked;
      input.disabled = true;
      layerStatus.textContent = shouldShow
        ? `Loading ${definition.label}…`
        : `Hiding ${definition.label}…`;

      try {
        let resource = loaded.get(key);
        if (!resource && shouldShow) {
          resource = await loadLayer(definition);
          loaded.set(key, resource);
        }

        if (resource) {
          resource.show = shouldShow;
          viewer.scene.requestRender();
        }

        layerStatus.textContent = `${definition.label} is ${shouldShow ? "visible" : "hidden"}.`;
      } catch (error) {
        input.checked = false;
        layerStatus.textContent = `${definition.label} could not be loaded.`;
        console.error(
          `[Cesium] Optional layer failed: assetId=${definition.assetId}, assetName=${definition.assetName}`,
          error
        );
      } finally {
        input.disabled = false;
      }
    });
  }
}

async function initialize() {
  if (
    !app ||
    !status ||
    !statusText ||
    !layerStatus ||
    !terrainDataToggle ||
    !pointCloudDataToggle ||
    !panel ||
    !panelClose ||
    !modelName ||
    !modelDescription
  ) {
    console.error("[Cesium] Required interface elements are missing.");
    return;
  }

  if (!token) {
    setStatus("Cesium ion token is not configured. Check .env.local.", "error");
    return;
  }

  Ion.defaultAccessToken = token;

  let layerConfig;
  let requiredMap;

  try {
    layerConfig = await fetchJson(assetDataUrl("layers.json"));
    setStatus("Loading the base map and terrain…");
    requiredMap = await createRequiredMap(layerConfig);
  } catch (error) {
    console.error("[Cesium] The required base map or terrain could not be loaded.", error);
    setStatus("The required base map could not be loaded.", "error");
    return;
  }

  const viewer = new Viewer("cesium-container", {
    animation: false,
    baseLayer: requiredMap.baseLayer,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    navigationHelpButton: false,
    scene3DOnly: true,
    sceneModePicker: false,
    selectionIndicator: false,
    terrainProvider: requiredMap.terrainProvider,
    timeline: false,
    vrButton: false
  });

  viewer.scene.backgroundColor = Color.fromCssColorString("#111a1c");
  viewer.scene.globe.baseColor = Color.fromCssColorString("#37423d");
  viewer.scene.globe.depthTestAgainstTerrain = true;

  connectOptionalLayers(viewer, layerConfig);

  let assets;
  try {
    assets = await fetchJson(assetDataUrl("assets.json"));
  } catch (error) {
    console.error("[Cesium] The model list could not be read.", error);
    setStatus("The model list could not be read. Run npm run sync-assets.", "error");
    return;
  }

  if (!Array.isArray(assets) || !assets.length) {
    setStatus("The model list is empty.", "error");
    return;
  }

  const fallbackById = await loadFallbackMetadata();
  let completed = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    assets.map(async (asset) => {
      const metadataPromise = fetchAssetMetadata(asset, fallbackById);

      try {
        const tileset = await Cesium3DTileset.fromIonAssetId(asset.assetId, {
          enablePick: true
        });
        viewer.scene.primitives.add(tileset);

        const metadata = await metadataPromise;
        const record = {
          assetId: asset.assetId,
          assetName: asset.assetName,
          name: metadata.name,
          description: metadata.description
        };

        tilesetToAsset.set(tileset, record);
        loadedTilesets.push(tileset);
        return record;
      } catch (error) {
        failed += 1;
        console.error(
          `[Cesium] Model failed to load: assetId=${asset.assetId}, assetName=${asset.assetName}`,
          error
        );
        throw error;
      } finally {
        completed += 1;
        setStatus(`Loading models ${completed}/${assets.length}…`);
      }
    })
  );

  viewer.screenSpaceEventHandler.setInputAction((movement) => {
    const picked = viewer.scene.pick(movement.position);
    const tileset = picked?.tileset || picked?.primitive;
    const asset = tileset ? tilesetToAsset.get(tileset) : undefined;

    if (asset) {
      modelSelection.select(tileset);
      openPanel(asset);
    } else {
      closePanel();
    }
  }, ScreenSpaceEventType.LEFT_CLICK);

  panelClose.addEventListener("click", closePanel);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePanel();
  });

  const loaded = results.length - failed;
  setStatus("Framing the site and loading visible tiles…");
  await frameLoadedModels(viewer);
  await waitForVisibleTiles(viewer);
  hideStatus();

  app.dataset.ready = "true";
  app.dataset.loadedCount = String(loaded);
  app.dataset.failedCount = String(failed);

  window.dispatchEvent(
    new CustomEvent("spk:cesium-ready", {
      detail: { loaded, failed, total: assets.length }
    })
  );

  window.addEventListener(
    "pagehide",
    () => {
      if (!viewer.isDestroyed()) viewer.destroy();
    },
    { once: true }
  );
}

initialize().catch((error) => {
  console.error("[Cesium] The 3D viewer failed to initialize.", error);
  setStatus("The 3D viewer failed to initialize. Check the browser console.", "error");
});
