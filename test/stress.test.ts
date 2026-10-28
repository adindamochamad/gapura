import { describe, expect, it, afterEach } from "vitest";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { wrapFetch } from "../src/wrap/wrapFetch.js";
import { readAllLogLines } from "../src/core/logger.js";
import { startMockLlmProvider } from "../src/cli/mockProvider.js";
import { LEGAL_DISCLAIMER } from "../src/report/pasal161.js";
import { renderMarkdown } from "../src/report/markdown.js";

const SINTETIS_NIK = "3171010101010000";
const FAKE_KEY = "sk-FAKE-DO-NOT-USE";

function scanForbidden(dir: string, forbidden: string[]): string[] {
  const hits: string[] = [];
  for (const file of readdirSync(dir)) {
    const content = readFileSync(join(dir, file), "utf8");
    for (const f of forbidden) {
      if (content.includes(f)) hits.push(`${file}: ${f}`);
    }
  }
  return hits;
}

describe("stress — concurrent and classification smoke", () => {
  let logDir: string;
  let mock: Awaited<ReturnType<typeof startMockLlmProvider>>;

  afterEach(async () => {
    if (mock) await mock.close();
    if (logDir) rmSync(logDir, { recursive: true, force: true });
  });

  it("handles mixed statuses, 80 parallel calls, no log leaks", async () => {
    logDir = mkdtempSync(join(tmpdir(), "gapura-stress-"));
    mock = await startMockLlmProvider();
    const gf = wrapFetch(fetch, { logDir, strictSchema: true });

    const post = (path: string, body: string, headers: Record<string, string> = {}) =>
      gf(`${mock.baseUrl}${path}?key=LEAK`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FAKE_KEY}`,
          ...headers,
        },
        body,
      });

    await post(
      "/v1/raw",
      JSON.stringify({
        model: "mock",
        messages: [
          {
            role: "user",
            content: `SINTETIS NIK ${SINTETIS_NIK} HP 0800-0000-0001`,
          },
        ],
      }),
    );
    await post(
      "/v1/masked",
      JSON.stringify({
        model: "mock",
        messages: [{ role: "user", content: "SINTETIS [NIK_1] [TELEPON_1]" }],
      }),
    );
    await post(
      "/v1/mixed",
      JSON.stringify({
        model: "mock",
        messages: [
          {
            role: "user",
            content: `SINTETIS [NIK_1] and NIK ${SINTETIS_NIK}`,
          },
        ],
      }),
    );
    await post(
      "/v1/clean",
      JSON.stringify({
        model: "mock",
        messages: [{ role: "user", content: "SINTETIS tanpa identitas" }],
      }),
    );
    await post(`/v1/broken`, `{not-json ${SINTETIS_NIK}`);
    await post("/v1/multipart", "------bound", {
      "Content-Type": "multipart/form-data",
    });
    await post(
      "/v1/gzip",
      JSON.stringify({ model: "mock", messages: [{ role: "user", content: "x" }] }),
      { "Content-Encoding": "gzip" },
    );

    const huge = "x".repeat(6 * 1024 * 1024);
    await post(
      "/v1/huge",
      JSON.stringify({
        model: "mock",
        messages: [{ role: "user", content: huge }],
      }),
    );

    const conc = await Promise.all(
      Array.from({ length: 80 }, (_, i) =>
        post(
          `/v1/c/${i}`,
          JSON.stringify({
            model: "mock",
            messages: [{ role: "user", content: `SINTETIS batch ${i}` }],
          }),
        ).then((r) => r.ok),
      ),
    );
    expect(conc.every(Boolean)).toBe(true);

    const entries = readAllLogLines(logDir);
    expect(entries.length).toBeGreaterThanOrEqual(88);

    const hist: Record<string, number> = {};
    for (const e of entries) {
      hist[e.status] = (hist[e.status] ?? 0) + 1;
    }
    expect(hist.raw).toBeGreaterThanOrEqual(1);
    expect(hist.masked).toBeGreaterThanOrEqual(1);
    expect(hist.mixed).toBeGreaterThanOrEqual(1);
    expect(hist.clean).toBeGreaterThanOrEqual(1);
    expect(hist.unchecked).toBeGreaterThanOrEqual(1);

    const leaks = scanForbidden(logDir, [
      SINTETIS_NIK,
      "0800-0000-0001",
      FAKE_KEY,
      "LEAK",
      "Authorization",
      "messages",
    ]);
    expect(leaks).toEqual([]);

    for (const file of readdirSync(logDir)) {
      for (const line of readFileSync(join(logDir, file), "utf8").split("\n")) {
        if (!line.trim()) continue;
        expect(() => JSON.parse(line)).not.toThrow();
      }
    }

    const md = renderMarkdown(entries.slice(0, 5), {});
    expect(md).toContain(LEGAL_DISCLAIMER);
  });

  it("fail-open when log dir is not writable as directory", async () => {
    const failDir = mkdtempSync(join(tmpdir(), "gapura-fail-"));
    writeFileSync(join(failDir, "not-a-dir"), "x");
    mock = await startMockLlmProvider();
    const gf = wrapFetch(fetch, { logDir: join(failDir, "not-a-dir") });
    const res = await gf(`${mock.baseUrl}/v1/failopen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "m", messages: [{ role: "user", content: "ok" }] }),
    });
    expect(res.ok).toBe(true);
    rmSync(failDir, { recursive: true, force: true });
  });
});
