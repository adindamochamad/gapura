import { cpSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { runDemo } from "../dist/cli/demo.js";

const root = process.cwd();
const outDir = join(root, "gapura-demo-out");
await runDemo({ cwd: root, outDir, deterministic: true });
const dest = join(root, "examples/sample-reports");
mkdirSync(dest, { recursive: true });
cpSync(join(outDir, "reports/laporan-contoh.md"), join(dest, "laporan-contoh.md"));
cpSync(
  join(outDir, "reports/laporan-contoh.html"),
  join(dest, "laporan-contoh.html"),
);
console.log("Updated examples/sample-reports from deterministic demo.");
