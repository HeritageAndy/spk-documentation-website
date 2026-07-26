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
