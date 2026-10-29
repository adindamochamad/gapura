import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { wrapFetch } from "../src/wrap/wrapFetch.js";
import { startMockLlmProvider } from "../src/cli/mockProvider.js";
import { startGapuraProxy } from "../src/proxy/server.js";

describe("outcome logging", () => {
  it("records aborted fetch", async () => {
    const logDir = mkdtempSync(join(tmpdir(), "gapura-out-"));
    const controller = new AbortController();
    controller.abort();
    const gapuraFetch = wrapFetch(fetch, { logDir });
    await expect(
      gapuraFetch("http://127.0.0.1:9/v1/x", {
        method: "POST",
        body: '{"a":1}',
        signal: controller.signal,
      }),
    ).rejects.toThrow();
    const content = readFileSync(
      join(logDir, readdirSync(logDir)[0]!),
      "utf8",
    );
    expect(content).toContain('"outcome":"aborted"');
    rmSync(logDir, { recursive: true, force: true });
  });

  it("records http_error from mock 500", async () => {
    const logDir = mkdtempSync(join(tmpdir(), "gapura-out-"));
    const mock = await startMockLlmProvider({ status: 500 });
    const gapuraFetch = wrapFetch(fetch, { logDir });
    await gapuraFetch(`${mock.baseUrl}/v1/fail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"a":1}',
    });
    const content = readFileSync(
      join(logDir, readdirSync(logDir)[0]!),
      "utf8",
    );
    expect(content).toContain('"outcome":"http_error"');
    expect(content).toContain('"http_status":500');
    await mock.close();
    rmSync(logDir, { recursive: true, force: true });
  });

  it("records timeout from slow upstream via proxy", async () => {
    const logDir = mkdtempSync(join(tmpdir(), "gapura-out-"));
    const upstream = createServer((_req, _res) => {
      /* never respond */
    });
    await new Promise<void>((r) => upstream.listen(0, "127.0.0.1", () => r()));
    const upPort = (upstream.address() as { port: number }).port;
    const proxy = await startGapuraProxy({
      listenHost: "127.0.0.1",
      listenPort: 0,
      targetOrigin: `http://127.0.0.1:${upPort}`,
      logDir,
      timeoutMs: 50,
    });
    await fetch(`${proxy.baseUrl}/slow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"a":1}',
    }).catch(() => undefined);
    const content = readFileSync(
      join(logDir, readdirSync(logDir)[0]!),
      "utf8",
    );
    expect(content).toContain('"outcome":"timeout"');
    expect(content).toContain('"http_status":504');
    await proxy.close();
    await new Promise<void>((r) => upstream.close(() => r()));
    rmSync(logDir, { recursive: true, force: true });
  });
});
