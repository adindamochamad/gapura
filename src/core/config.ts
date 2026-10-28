import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { GapuraConfig } from "./types.js";

export function loadGapuraConfig(cwd = process.cwd()): GapuraConfig {
  const paths = [
    join(cwd, "gapura.config.json"),
    join(cwd, ".gapura", "config.json"),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      return JSON.parse(readFileSync(p, "utf8")) as GapuraConfig;
    }
  }
  return {};
}
