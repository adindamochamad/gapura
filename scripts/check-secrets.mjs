#!/usr/bin/env node
/** Fail if tracked files look like real API keys (allow FAKE/DEMO markers). */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SCAN = ["src", "test", "examples", "scripts", "docs", "README.md", "README.en.md"];
const SKIP = new Set(["node_modules", "dist", ".git"]);
const ALLOW = [/FAKE/i, /DO-NOT-USE/i, /SINTETIS/i, /mock/i, /example\.test/i];
const PATTERNS = [
  /\bsk-[a-zA-Z0-9]{20,}\b/,
  /\bsk-proj-[a-zA-Z0-9_-]{20,}\b/,
  /\bANTHROPIC_API_KEY\s*=\s*['"][^'"]+['"]/,
];

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|js|mjs|json|md|html|jsonl)$/.test(name)) out.push(p);
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
  for (const re of PATTERNS) {
    const m = text.match(re);
    if (!m) continue;
    if (ALLOW.some((a) => a.test(m[0]))) continue;
    console.error(`${file}: suspicious secret pattern ${re}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("No suspicious secret patterns in scanned files.");
