#!/usr/bin/env node
const FORBIDDEN = [
  /\bpatuh\b/i,
  /\bcompliant\b/i,
  /\bcomply\b/i,
  /\bsesuai PP 33/i,
  /\bcertified\b/i,
  /\btersertifikasi\b/i,
  /\bterjamin\b/i,
  /\bpelopor\b/i,
];

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SCAN = ["README.md", "README.en.md", "src", "docs", "examples"];
const SKIP_FILES = new Set([
  "gapura-cursor-prompt.md",
  "PRD.md",
]);

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "node_modules" || name === "dist") continue;
      walk(p, out);
    } else if (/\.(md|html|ts|tsx|json)$/.test(name)) {
      if (!SKIP_FILES.has(name)) out.push(p);
    }
  }
}

const files = [];
for (const part of SCAN) {
  const p = join(ROOT, part);
  try {
    if (statSync(p).isDirectory()) walk(p, files);
    else files.push(p);
  } catch {
    /* skip */
  }
}

let failed = false;
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const re of FORBIDDEN) {
    if (re.test(text)) {
      console.error(`${file}: matched ${re}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log("No forbidden marketing/compliance words found.");
