#!/usr/bin/env node
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

// Simple wrapper that delegates to index.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indexPath = path.join(__dirname, "..", "index.js");

// Forward all arguments to index.js
const child = spawn("node", [indexPath, ...process.argv.slice(2)], {
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
