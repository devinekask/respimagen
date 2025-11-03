import test from "node:test";
import assert from "node:assert/strict";
import { srcsetGenerator } from "../utils.js";

test("srcsetGenerator groups by extension and formats srcset correctly", () => {
  const files = [
    { file: "image-300.avif", ext: "avif", size: 300 },
    { file: "image-600.avif", ext: "avif", size: 600 },
    { file: "image-300.jpeg", ext: "jpeg", size: 300 },
  ];

  const out = srcsetGenerator(files);

  // Expect two srcset blocks separated by blank line
  assert.ok(out.includes('srcset="image-300.avif 300w,\nimage-600.avif 600w"'));
  assert.ok(out.includes('srcset="image-300.jpeg 300w"'));
});

test("srcsetGenerator returns empty string for empty input", () => {
  const out = srcsetGenerator([]);
  assert.strictEqual(out, "");
});

test("srcsetGenerator skips entries missing ext or size gracefully", () => {
  const files = [
    { file: "ok-300.webp", ext: "webp", size: 300 },
    { file: "bad-noext", size: 200 },
    { file: "bad-nosize.webp", ext: "webp" },
  ];

  const out = srcsetGenerator(files);
  // Should include only the valid entry
  assert.ok(out.includes('srcset="ok-300.webp 300w"'));
  // Ensure entries without ext/size do not crash the function
  assert.ok(!out.includes("bad-noext"));
  assert.ok(!out.includes("bad-nosize"));
});

test("srcsetGenerator preserves input ordering within each extension group", () => {
  const files = [
    { file: "first-100.jpg", ext: "jpg", size: 100 },
    { file: "second-200.jpg", ext: "jpg", size: 200 },
  ];

  const out = srcsetGenerator(files);
  const idxFirst = out.indexOf("first-100.jpg");
  const idxSecond = out.indexOf("second-200.jpg");
  assert.ok(idxFirst < idxSecond, "ordering should preserve insertion order");
});
