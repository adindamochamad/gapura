import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runDemo } from "../dist/cli/demo.js";
import { renderViewerPage } from "../dist/report/viewerPage.js";

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

const root = process.cwd();
const tmp = mkdtempSync(join(tmpdir(), "gapura-ex-check-"));
await runDemo({ cwd: root, outDir: tmp, deterministic: true });
const pairs = [
  ["laporan-contoh.md", "laporan-contoh.md"],
  ["laporan-contoh.html", "laporan-contoh.html"],
];
for (const [a, b] of pairs) {
  const gen = join(tmp, "reports", a);
  const committed = join(root, "examples/sample-reports", b);
  if (sha256(gen) !== sha256(committed)) {
    console.error(`Mismatch: ${b} — run npm run examples:update`);
    rmSync(tmp, { recursive: true, force: true });
    process.exit(1);
  }
}
rmSync(tmp, { recursive: true, force: true });
const committedViewer = readFileSync(
  join(root, "viewer/index.html"),
  "utf8",
);
if (committedViewer !== renderViewerPage()) {
  console.error("Mismatch: viewer/index.html — run npm run examples:update");
  process.exit(1);
}
console.log("examples/sample-reports match deterministic demo.");
console.log("viewer/index.html matches renderViewerPage().");
