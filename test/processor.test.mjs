import test from "node:test";
import assert from "node:assert";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { processPath } from "../lib/processor.js";

test("processPath can be imported and used programmatically", async () => {
  const testDir = path.join(process.cwd(), "test-fixtures-processor");
  const inputFile = path.join(testDir, "test-image.jpg");
  const outputDir = path.join(testDir, "output");

  try {
    // Setup: create test fixture
    await fs.mkdir(testDir, { recursive: true });
    await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .jpeg()
      .toFile(inputFile);

    // Use the exported API
    const result = await processPath(inputFile, {
      sizes: [50, 75],
      filetypes: "webp,avif",
      outputdir: outputDir,
      clear: true,
    });

    // Verify output
    assert.ok(result.output, "result should have output array");
    assert.ok(result.srcset, "result should have srcset string");
    assert.strictEqual(
      result.output.length,
      4,
      "should have 4 outputs (2 sizes × 2 formats)"
    );

    // Verify files exist
    const outputFiles = await fs.readdir(outputDir);
    assert.strictEqual(
      outputFiles.length,
      4,
      "output directory should contain 4 files"
    );
    assert.ok(
      outputFiles.some((f) => f.includes("-50.webp")),
      "should have 50px webp file"
    );
    assert.ok(
      outputFiles.some((f) => f.includes("-75.avif")),
      "should have 75px avif file"
    );
  } finally {
    // Cleanup
    await fs.rm(testDir, { recursive: true, force: true });
  }
});

test("processPath throws error for unknown filetypes", async () => {
  const testDir = path.join(process.cwd(), "test-fixtures-processor-error");
  const inputFile = path.join(testDir, "test-image.jpg");

  try {
    await fs.mkdir(testDir, { recursive: true });
    await sharp({
      create: {
        width: 50,
        height: 50,
        channels: 3,
        background: { r: 0, g: 255, b: 0 },
      },
    })
      .jpeg()
      .toFile(inputFile);

    // Should throw for unknown filetype
    await assert.rejects(
      async () => {
        await processPath(inputFile, {
          sizes: [50],
          filetypes: "unknownformat",
          outputdir: path.join(testDir, "output"),
        });
      },
      {
        message: /Unknown filetypes/,
      }
    );
  } finally {
    await fs.rm(testDir, { recursive: true, force: true });
  }
});

test("processPath handles directory input", async () => {
  const testDir = path.join(process.cwd(), "test-fixtures-processor-dir");
  const outputDir = path.join(testDir, "output");

  try {
    await fs.mkdir(testDir, { recursive: true });

    // Create two test images
    await sharp({
      create: {
        width: 80,
        height: 80,
        channels: 3,
        background: { r: 100, g: 100, b: 255 },
      },
    })
      .png()
      .toFile(path.join(testDir, "image1.png"));

    await sharp({
      create: {
        width: 90,
        height: 90,
        channels: 3,
        background: { r: 255, g: 255, b: 0 },
      },
    })
      .png()
      .toFile(path.join(testDir, "image2.png"));

    const result = await processPath(testDir, {
      sizes: [40],
      filetypes: "webp",
      outputdir: outputDir,
      clear: true,
    });

    // Should process both images
    assert.strictEqual(result.output.length, 2, "should process 2 images");
    assert.ok(result.srcset, "should generate srcset");

    const outputFiles = await fs.readdir(outputDir);
    assert.strictEqual(outputFiles.length, 2, "should have 2 output files");
  } finally {
    await fs.rm(testDir, { recursive: true, force: true });
  }
});
