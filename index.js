#!/usr/bin/env node
import yargs from "yargs";
import { processPath } from "./lib/processor.js";

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
const sizes = [];

if (argv.sizes != "-") {
  // yargs may parse a single numeric size as Number (e.g. -s 100),
  // so coerce to string before splitting to avoid calling .split on a Number.
  const sizesRaw =
    typeof argv.sizes === "string" ? argv.sizes : String(argv.sizes);
  sizes.push(...sizesRaw.split(",").map((s) => parseInt(s)));
}

const options = {
  sizes: sizes.length > 0 ? sizes : null,
  filetypes: argv.filetypes,
  outputdir,
  clear: argv.c,
};

try {
  const result = await processPath(input, options);

  // Log results
  for (const item of result.output) {
    console.log(`✅ ${item.file} - ${item.size}`);
  }

  console.log("Everything done");

  if (result.srcset) {
    console.log(`\n` + result.srcset);
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
