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
