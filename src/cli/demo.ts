import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { wrapFetch } from "../wrap/wrapFetch.js";
import { loadGapuraConfig } from "../core/config.js";
import { readAllLogLines } from "../core/logger.js";
import { renderHtml } from "../report/html.js";
import { renderMarkdown } from "../report/markdown.js";
import { renderViewerPage } from "../report/viewerPage.js";
import {
  startMockLlmProvider,
  syntheticOpenAiBody,
  packageRoot,
} from "./mockProvider.js";

export async function runDemo(cwd = process.cwd()): Promise<void> {
  const root = packageRoot();
  const logDir = join(root, "examples", "demo-logs");
  const outDir = join(root, "examples", "sample-reports");

  if (existsSync(logDir)) rmSync(logDir, { recursive: true, force: true });
  mkdirSync(logDir, { recursive: true });

  const mock = await startMockLlmProvider();
  const config = loadGapuraConfig(join(root, "examples"));
  const gapuraFetch = wrapFetch(fetch, { logDir, config, label: "Toko Contoh" });

  try {
    await gapuraFetch(`${mock.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer sk-FAKE-DO-NOT-USE",
      },
      body: syntheticOpenAiBody("raw"),
    });

    await gapuraFetch(`${mock.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: syntheticOpenAiBody("masked"),
    });

    await gapuraFetch(`${mock.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: syntheticOpenAiBody("clean"),
    });

    const entries = readAllLogLines(logDir);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(
      join(outDir, "laporan-contoh.md"),
      renderMarkdown(entries, config),
      "utf8",
    );
    writeFileSync(
      join(outDir, "laporan-contoh.html"),
      renderHtml(entries, config),
      "utf8",
    );
    const viewerDir = join(root, "viewer");
    mkdirSync(viewerDir, { recursive: true });
    writeFileSync(join(viewerDir, "index.html"), renderViewerPage(), "utf8");

    console.log(`Log: ${logDir} (${entries.length} baris)`);
    console.log(`Laporan: ${outDir}/laporan-contoh.md`);
    console.log(`Laporan: ${outDir}/laporan-contoh.html`);
    console.log(`Penampil: ${join(root, "viewer", "index.html")}`);
    console.log(`Mock LLM menerima ${mock.requestCount()} request.`);
  } finally {
    await mock.close();
  }
}
