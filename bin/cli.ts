#!/usr/bin/env node
import { loadConsole, renderMarkdown } from "../src/index.js";

const [, , inputPath, formatFlag, format] = process.argv;

if (!inputPath) {
  console.error("Usage: ibm-zos-batch-window-risk-console <input.json> [--format markdown|json]");
  process.exit(1);
}

const batchConsole = await loadConsole(inputPath);
console.log(formatFlag === "--format" && format === "json" ? JSON.stringify(batchConsole, null, 2) : renderMarkdown(batchConsole));
