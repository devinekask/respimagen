#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import yargs from "yargs";
import { srcsetGenerator } from "./utils.js";

const output = [];
const sizes = [];
let files = [];
const queue = [];

const defaultTypes = [
  { id: "webp" },
  { id: "jpeg", options: { mozjpeg: true } },
  { id: "avif" },
  { id: "png" },
];

const logFile = (file, ext, size) => {
  console.log(`✅ ${file}-${size}.${ext} - ${size}`);
  output.push({ file: `${file}-${size}.${ext}`, ext, size });
};

const argv = yargs(process.argv.slice(2))
  .usage(
    "Usage: $0 -i <input> -s [sizes] -t [filetypes] -o [outputdir] -c [clear]"
  )
  .alias("i", "input")
  .alias("s", "sizes")
  .alias("t", "filetypes")
  .alias("o", "outputdir")
  .describe("i", "file or directory to process")
  .describe(
    "s",
    "different sizes to generate, separated by comma. Add a '-' to skip this"
  )
  .describe("t", "different filetypes to generate, separated by comma")
  .describe("c", "clear the output directory before processing, default false")
  .boolean("c")
  .demandOption(["input"])
  .default({
    sizes: "300,500,700",
    filetypes: "avif,jpeg",
    outputdir: "output",
    c: false,
  })
  .example(
    "$0 -i beach.jpg -s 500,750 -t webp,avif",
    "Resize and convert beach.jpg to 500px and 750px in webp and avif format"
  ).argv;

const { input, outputdir } = argv;

if (argv.sizes != "-") {
  sizes.push(...argv.sizes.split(",").map((s) => parseInt(s)));
}

const formats = argv.filetypes
  .split(",")
  .map((f) => defaultTypes.find((df) => df.id === f));

try {
  const inputPath = path.resolve(input);
  const stats = await fs.stat(inputPath);

  if (stats.isFile()) {
    // If it's a file, add it to the array
    files.push(inputPath);
  } else if (stats.isDirectory()) {
    // If it's a directory, get all files in the directory
    const rawDirFils = await fs.readdir(inputPath);
    const directoryFiles = rawDirFils.map((file) => path.join(inputPath, file));

    // Filter out non-files (e.g., directories, symlinks) if necessary
    files = directoryFiles.filter(async (file) => {
      const check = await fs.lstat(file);
      return check.isFile();
    });
  } else {
    console.log(`${inputPath} is neither a file nor a directory`);
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
}

//if clear flag is set, clear ouput directory
if (argv.c) {
  await fs.rm(outputdir, { recursive: true });
}

try {
  await fs.mkdir(outputdir, { recursive: true });
} catch (e) {
  console.log("error", e);
}

for (const file of files) {
  const filename = path.basename(file, path.extname(file));

  const image = sharp(file);

  for (const format of formats) {
    for (const size of sizes) {
      queue.push(
        image
          .clone()
          .resize({ width: size })
          .toFormat(format.id)
          .toFile(`${outputdir}/${filename}-${size}.${format.id}`)
          .then(() => logFile(filename, format.id, size))
          .catch((err) => console.error("Error processing file", err))
      );
    }
    if (sizes.length === 0) {
      const imgSize = await image.metadata();
      queue.push(
        image
          .clone()
          .toFormat(format.id)
          .toFile(`${outputdir}/${filename}.${format.id}`)
          .then(() => logFile(filename, format.id, imgSize.width))
          .catch((err) => console.error("Error processing file", err))
      );
    }
  }
}

Promise.all(queue)
  .then(() => {
    console.log("Everything done");
    if (sizes.length != 0) {
      console.log(`\n` + srcsetGenerator(output));
    }
  })
  .catch((err) => {
    console.error("Error processing files", err);
  });
