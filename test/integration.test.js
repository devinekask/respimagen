import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { execFile } from "child_process";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tmpDir = path.join(__dirname, "tmp");
const fixturesDir = path.join(__dirname, "fixtures");

const run = (file, args) =>
  new Promise((resolve, reject) => {
    execFile(
      file,
      args,
      { cwd: path.resolve(__dirname, "..") },
      (err, stdout, stderr) => {
        if (err) return reject({ err, stdout, stderr });
        resolve({ stdout, stderr });
      }
    );
  });

const ensureDir = async (d) => {
  await fs.rm(d, { recursive: true, force: true }).catch(() => {});
  await fs.mkdir(d, { recursive: true });
};

(async () => {
  try {
    await ensureDir(tmpDir);
    await ensureDir(fixturesDir);

    const inputImage = path.join(fixturesDir, "test.png");
    const outDir = path.join(tmpDir, "output");

    // create a tiny 200x200 red PNG
    await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .png()
      .toFile(inputImage);

    // run the CLI to generate a 100px jpeg
    const nodeBin = process.execPath; // path to node
    const cliArgs = [
      "index.js",
      "-i",
      inputImage,
      "-s",
      "100",
      "-t",
      "jpeg",
      "-o",
      outDir,
      "-c",
    ];

    console.log("Running CLI:", nodeBin, cliArgs.join(" "));
    const { stdout } = await run(nodeBin, cliArgs);
    console.log(stdout);

    // check output file exists
    const expectedFile = path.join(outDir, "test-100.jpeg");
    const stat = await fs.stat(expectedFile);

    if (!stat.isFile()) throw new Error("Expected output file not found");

    console.log("Integration test passed");
    process.exit(0);
  } catch (e) {
    console.error("Integration test failed", e);
    process.exit(1);
  }
})();
