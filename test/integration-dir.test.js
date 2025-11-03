import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { execFile } from "child_process";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tmpDir = path.join(__dirname, "tmp-dir");
const fixturesDir = path.join(__dirname, "fixtures-dir");

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

    const inputDir = fixturesDir;
    const outDir = path.join(tmpDir, "output");

    // create two tiny images
    await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 0, g: 255, b: 0 },
      },
    })
      .png()
      .toFile(path.join(inputDir, "a.png"));

    await sharp({
      create: {
        width: 150,
        height: 150,
        channels: 3,
        background: { r: 0, g: 0, b: 255 },
      },
    })
      .png()
      .toFile(path.join(inputDir, "b.png"));

    // run the CLI on the directory to generate 50px jpegs
    const nodeBin = process.execPath; // path to node
    const cliArgs = [
      "index.js",
      "-i",
      inputDir,
      "-s",
      "50",
      "-t",
      "jpeg",
      "-o",
      outDir,
      "-c",
    ];

    console.log("Running CLI for dir test:", nodeBin, cliArgs.join(" "));
    const { stdout } = await run(nodeBin, cliArgs);
    console.log(stdout);

    // check output files exist
    const expectedFiles = [
      path.join(outDir, "a-50.jpeg"),
      path.join(outDir, "b-50.jpeg"),
    ];

    for (const f of expectedFiles) {
      const stat = await fs.stat(f);
      if (!stat.isFile())
        throw new Error(`Expected output file not found: ${f}`);
    }

    console.log("Integration dir test passed");
    process.exit(0);
  } catch (e) {
    console.error("Integration dir test failed", e);
    process.exit(1);
  }
})();
