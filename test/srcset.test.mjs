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
