import test from "node:test";
import assert from "node:assert";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { processPath } from "../lib/processor.js";

// Test each supported format individually
const supportedFormats = ["avif", "webp", "jpeg", "jpg", "png"];

for (const format of supportedFormats) {
  test(`processPath supports ${format} format`, async () => {
    const testDir = path.join(process.cwd(), `test-fixtures-format-${format}`);
    const inputFile = path.join(testDir, "test-image.jpg");
    const outputDir = path.join(testDir, "output");

    try {
      await fs.mkdir(testDir, { recursive: true });

      // Create test image
      await sharp({
        create: {
          width: 80,
          height: 80,
          channels: 3,
          background: { r: 200, g: 100, b: 50 },
        },
      })
        .jpeg()
        .toFile(inputFile);

      // Process with specific format
      const result = await processPath(inputFile, {
        sizes: [40],
        filetypes: format,
        outputdir: outputDir,
        clear: true,
      });

      // Verify output
      assert.ok(result.output, "result should have output array");
      assert.strictEqual(
        result.output.length,
        1,
        `should have 1 output for ${format}`
      );
      assert.strictEqual(
        result.output[0].ext,
        format,
        `output extension should be ${format}`
      );

      // Verify file exists
      const outputFiles = await fs.readdir(outputDir);
      assert.strictEqual(
        outputFiles.length,
        1,
        "output directory should contain 1 file"
      );

      const expectedExtension = format;
      assert.ok(
        outputFiles[0].endsWith(`.${expectedExtension}`),
        `file should have ${expectedExtension} extension`
      );

      // Verify file is valid by reading metadata
      const outputFile = path.join(outputDir, outputFiles[0]);
      const metadata = await sharp(outputFile).metadata();
      assert.ok(metadata, "should be able to read output file metadata");
      assert.strictEqual(metadata.width, 40, "width should be 40px");
    } finally {
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });
}

test("processPath supports multiple formats at once", async () => {
  const testDir = path.join(process.cwd(), "test-fixtures-multi-format");
  const inputFile = path.join(testDir, "test-image.png");
  const outputDir = path.join(testDir, "output");

  try {
    await fs.mkdir(testDir, { recursive: true });

    // Create test image
    await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 50, g: 150, b: 250 },
      },
    })
      .png()
      .toFile(inputFile);

    // Process with all formats
    const result = await processPath(inputFile, {
      sizes: [50],
      filetypes: "avif,webp,jpeg,png",
      outputdir: outputDir,
      clear: true,
    });

    // Verify output
    assert.ok(result.output, "result should have output array");
    assert.strictEqual(
      result.output.length,
      4,
      "should have 4 outputs (4 formats)"
    );

    // Verify all formats are present
    const extensions = result.output.map((o) => o.ext);
    assert.ok(extensions.includes("avif"), "should include avif");
    assert.ok(extensions.includes("webp"), "should include webp");
    assert.ok(extensions.includes("jpeg"), "should include jpeg");
    assert.ok(extensions.includes("png"), "should include png");

    // Verify files exist
    const outputFiles = await fs.readdir(outputDir);
    assert.strictEqual(
      outputFiles.length,
      4,
      "output directory should contain 4 files"
    );

    // Verify each file is valid
    for (const file of outputFiles) {
      const filePath = path.join(outputDir, file);
      const metadata = await sharp(filePath).metadata();
      assert.ok(metadata, `should be able to read ${file} metadata`);
      assert.strictEqual(metadata.width, 50, `${file} width should be 50px`);
    }
  } finally {
    await fs.rm(testDir, { recursive: true, force: true });
  }
});

test("processPath handles jpg and jpeg equivalently", async () => {
  const testDir = path.join(process.cwd(), "test-fixtures-jpg-jpeg");
  const inputFile = path.join(testDir, "test-image.png");
  const outputDir = path.join(testDir, "output");

  try {
    await fs.mkdir(testDir, { recursive: true });

    // Create test image
    await sharp({
      create: {
        width: 60,
        height: 60,
        channels: 3,
        background: { r: 128, g: 128, b: 128 },
      },
    })
      .png()
      .toFile(inputFile);

    // Process with both jpg and jpeg
    const result = await processPath(inputFile, {
      sizes: [30],
      filetypes: "jpg,jpeg",
      outputdir: outputDir,
      clear: true,
    });

    // Both should produce valid output
    assert.strictEqual(
      result.output.length,
      2,
      "should have 2 outputs (jpg and jpeg)"
    );

    // Verify files exist and are valid
    const outputFiles = await fs.readdir(outputDir);
    assert.strictEqual(outputFiles.length, 2, "should have 2 output files");

    for (const file of outputFiles) {
      const filePath = path.join(outputDir, file);
      const metadata = await sharp(filePath).metadata();
      assert.ok(metadata, `should be able to read ${file}`);
      // Both jpg and jpeg files are handled as JPEG by Sharp
      assert.ok(
        metadata.format === "jpeg" || metadata.format === "jpg",
        `${file} should be JPEG format`
      );
    }
  } finally {
    await fs.rm(testDir, { recursive: true, force: true });
  }
});
