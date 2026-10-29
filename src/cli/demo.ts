import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { wrapFetch } from "../wrap/wrapFetch.js";
import { loadGapuraConfig } from "../core/config.js";
import { readAllLogLines } from "../core/logger.js";
import { renderHtml } from "../report/html.js";
import { renderMarkdown } from "../report/markdown.js";
import { startMockLlmProvider, syntheticOpenAiBody } from "./mockProvider.js";
import {
  resetGapuraObserveHooks,
  setGapuraObserveHooks,
} from "../core/observeHooks.js";

export interface DemoOptions {
  cwd?: string;
  outDir?: string;
  /** UUID dan timestamp tetap untuk contoh yang di-commit. */
  deterministic?: boolean;
}

const DEMO_IDS = [
  "11111111-1111-4111-8111-111111111111",
  "22222222-2222-4222-8222-222222222222",
  "33333333-3333-4333-8333-333333333333",
];
const DEMO_TS = "2026-10-29T04:00:00.000Z";

export async function runDemo(options: DemoOptions = {}): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  const outDir = options.outDir ?? join(cwd, "gapura-demo-out");
  const logDir = join(outDir, "logs");
  const reportDir = join(outDir, "reports");

  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  mkdirSync(logDir, { recursive: true });

  if (options.deterministic) {
    let n = 0;
    setGapuraObserveHooks({
      clock: () => DEMO_TS,
      idFactory: () => DEMO_IDS[n++] ?? DEMO_IDS[DEMO_IDS.length - 1]!,
    });
  }

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
    const reportOpts = options.deterministic
      ? { generatedAt: DEMO_TS }
      : {};
    writeFileSync(
      join(reportDir, "laporan-contoh.md"),
      renderMarkdown(entries, config, 0, reportOpts),
      "utf8",
    );
    writeFileSync(
      join(reportDir, "laporan-contoh.html"),
      renderHtml(entries, config, 0, reportOpts),
      "utf8",
    );

    console.log(`Log: ${logDir} (${entries.length} baris)`);
    console.log(`Laporan: ${reportDir}/laporan-contoh.md`);
    console.log(`Laporan: ${reportDir}/laporan-contoh.html`);
    console.log(`Mock LLM menerima ${mock.requestCount()} request.`);
  } finally {
    if (options.deterministic) resetGapuraObserveHooks();
    await mock.close();
  }
}
