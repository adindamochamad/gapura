#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const FORBIDDEN = [
  /\bpatuh\b/i,
  /\bkepatuhan\b/i,
  /\bcompliant\b/i,
  /\bcomply\b/i,
  /\bsesuai PP 33/i,
  /\bcertified\b/i,
  /\btersertifikasi\b/i,
  /\bterjamin\b/i,
  /\bpelopor\b/i,
  /\bpertama\b/i,
  /\b100%\b/,
  /\baman\b/i,
  /\bmenuntut\b/i,
];

const ALLOW_LINE = [
  /bukan bukti kepatuhan/i,
  /tidak klaim kepatuhan/i,
  /bukan nasihat hukum/i,
  /bukan jaminan/i,
];

const ROOT = process.cwd();
const SCAN = ["README.md", "README.en.md", "src", "docs", "examples"];
const SKIP_FILES = new Set(["PRD.md"]);

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
  const lines = readFileSync(file, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (ALLOW_LINE.some((re) => re.test(line))) continue;
    for (const re of FORBIDDEN) {
      if (re.test(line)) {
        console.error(`${file}:${i + 1}: matched ${re}`);
        failed = true;
      }
    }
  }
}

if (failed) process.exit(1);
console.log("No forbidden marketing/compliance words found.");
