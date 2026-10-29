import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { wrapFetch } from "../wrap/wrapFetch.js";
import { loadGapuraConfig } from "../core/config.js";
import { readAllLogLines } from "../core/logger.js";
import { renderHtml } from "../report/html.js";
import { renderMarkdown } from "../report/markdown.js";
import { startMockLlmProvider, syntheticOpenAiBody } from "./mockProvider.js";

export interface DemoOptions {
  cwd?: string;
  outDir?: string;
}

export async function runDemo(options: DemoOptions = {}): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  const outDir = options.outDir ?? join(cwd, "gapura-demo-out");
  const logDir = join(outDir, "logs");
  const reportDir = join(outDir, "reports");

  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  mkdirSync(logDir, { recursive: true });

  const mock = await startMockLlmProvider();
  const config = loadGapuraConfig(cwd);
  const routeToMock = (input: RequestInfo | URL, init?: RequestInit) => {
    const raw =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const path = new URL(raw).pathname + new URL(raw).search;
    return fetch(`${mock.baseUrl}${path}`, init);
  };
  const gapuraFetch = wrapFetch(routeToMock, {
    logDir,
    config,
    label: "Toko Contoh",
  });

  try {
    await gapuraFetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer sk-FAKE-DO-NOT-USE",
      },
      body: syntheticOpenAiBody("raw"),
    });

    await gapuraFetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: syntheticOpenAiBody("masked"),
    });

    await gapuraFetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: syntheticOpenAiBody("clean"),
    });

    const entries = readAllLogLines(logDir);
    mkdirSync(reportDir, { recursive: true });
    writeFileSync(
      join(reportDir, "laporan-contoh.md"),
      renderMarkdown(entries, config),
      "utf8",
    );
    writeFileSync(
      join(reportDir, "laporan-contoh.html"),
      renderHtml(entries, config),
      "utf8",
    );

    console.log(`Log: ${logDir} (${entries.length} baris)`);
    console.log(`Laporan: ${reportDir}/laporan-contoh.md`);
    console.log(`Laporan: ${reportDir}/laporan-contoh.html`);
    console.log(`Mock LLM menerima ${mock.requestCount()} request.`);
  } finally {
    await mock.close();
  }
}
