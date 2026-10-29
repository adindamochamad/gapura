import { describe, expect, it, afterEach } from "vitest";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { wrapFetch } from "../src/wrap/wrapFetch.js";
import {
  startMockLlmProvider,
  syntheticOpenAiBody,
} from "../src/cli/mockProvider.js";

const SINTETIS_NIK = "3171010101010000";
const FAKE_KEY = "sk-FAKE-DO-NOT-USE";

function scanDirForForbidden(dir: string, forbidden: string[]): string[] {
  const hits: string[] = [];
  for (const file of readdirSync(dir)) {
    const content = readFileSync(join(dir, file), "utf8");
    for (const f of forbidden) {
      if (content.includes(f)) hits.push(`${file}: ${f}`);
    }
  }
  return hits;
}

describe("privacy — log tidak menyimpan data asli", () => {
  let logDir: string;
  let mock: Awaited<ReturnType<typeof startMockLlmProvider>>;

  afterEach(async () => {
    if (mock) await mock.close();
    if (logDir) rmSync(logDir, { recursive: true, force: true });
  });

  it("wrapFetch logs without prompt, PII, keys, or query", async () => {
    logDir = mkdtempSync(join(tmpdir(), "gapura-log-"));
    mock = await startMockLlmProvider();
    const gapuraFetch = wrapFetch(fetch, {
      logDir,
      strictSchema: true,
    });

    await gapuraFetch(
      `${mock.baseUrl}/v1/chat/completions?key=SHOULD-NOT-LOG`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FAKE_KEY}`,
          "x-api-key": FAKE_KEY,
        },
        body: syntheticOpenAiBody("raw"),
      },
    );

    const forbidden = [
      SINTETIS_NIK,
      "0800-0000-0001",
      "contoh@example.test",
      FAKE_KEY,
      "SHOULD-NOT-LOG",
      "messages",
      "Authorization",
    ];
    const files = readdirSync(logDir);
    expect(files.length).toBeGreaterThan(0);
    const hits = scanDirForForbidden(logDir, forbidden);
    expect(hits).toEqual([]);
  });

  it("fail-open on broken JSON still forwards and avoids payload in stderr", async () => {
    logDir = mkdtempSync(join(tmpdir(), "gapura-log-"));
    mock = await startMockLlmProvider();
    const gapuraFetch = wrapFetch(fetch, { logDir });
    const errLines: string[] = [];
    const orig = console.error;
    console.error = (...args: unknown[]) => {
      errLines.push(args.map(String).join(" "));
    };
    try {
      const res = await gapuraFetch(`${mock.baseUrl}/v1/broken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: `{not-json ${SINTETIS_NIK}`,
      });
      expect(res.ok).toBe(true);
      const logContent = readFileSync(
        join(logDir, readdirSync(logDir)[0]!),
        "utf8",
      );
      expect(logContent).not.toContain(SINTETIS_NIK);
      expect(errLines.join("\n")).not.toContain(SINTETIS_NIK);
    } finally {
      console.error = orig;
    }
  });
});

describe("no extra network from Gapura", () => {
  it("only hits mock upstream", async () => {
    const logDir = mkdtempSync(join(tmpdir(), "gapura-net-"));
    const mock = await startMockLlmProvider();
    const gapuraFetch = wrapFetch(fetch, { logDir });
    await gapuraFetch(`${mock.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: syntheticOpenAiBody("clean"),
    });
    expect(mock.requestCount()).toBe(1);
    await mock.close();
    rmSync(logDir, { recursive: true, force: true });
  });
});
