import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderViewerPage } from "../dist/report/viewerPage.js";

const root = process.cwd();
const destDir = join(root, "viewer");
mkdirSync(destDir, { recursive: true });
writeFileSync(join(destDir, "index.html"), renderViewerPage(), "utf8");
console.log("Wrote viewer/index.html from renderViewerPage().");
