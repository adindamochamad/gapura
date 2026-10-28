import { describe, expect, it, afterEach } from "vitest";
import { createServer, type Server } from "node:http";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startGapuraProxy } from "../src/proxy/server.js";
import { syntheticOpenAiBody } from "../src/cli/mockProvider.js";

const SINTETIS_NIK = "3171010101010000";

function startStreamingUpstream(): Promise<{
  origin: string;
  chunks: string[];
  close: () => Promise<void>;
}> {
  const chunks: string[] = [];
  return new Promise((resolve) => {
    const server = createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      const parts = ["chunk-", "one-", "two"];
      for (const p of parts) {
        res.write(p);
        chunks.push(p);
      }
      res.end();
    });
    server.listen(0, "127.0.0.1", () => {
      const port = (server.address() as { port: number }).port;
      resolve({
        origin: `http://127.0.0.1:${port}`,
        chunks,
        close: () =>
          new Promise((r, j) => server.close((e) => (e ? j(e) : r()))),
      });
    });
  });
}

describe("gapura proxy", () => {
  let logDir: string;
  let proxy: Awaited<ReturnType<typeof startGapuraProxy>>;
  let upstream: Awaited<ReturnType<typeof startStreamingUpstream>>;

  afterEach(async () => {
    if (proxy) await proxy.close();
    if (upstream) await upstream.close();
    if (logDir) rmSync(logDir, { recursive: true, force: true });
  });

  it("observes raw request and streams response", async () => {
    logDir = mkdtempSync(join(tmpdir(), "gapura-proxy-"));
    upstream = await startStreamingUpstream();
    proxy = await startGapuraProxy({
      listenHost: "127.0.0.1",
      listenPort: 0,
      targetOrigin: upstream.origin,
      logDir,
    });

    const res = await fetch(`${proxy.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: syntheticOpenAiBody("raw"),
    });
    expect(res.ok).toBe(true);
    const text = await res.text();
    expect(text).toBe("chunk-one-two");

    const logContent = readFileSync(
      join(logDir, readdirSync(logDir)[0]!),
      "utf8",
    );
    expect(logContent).toContain('"status":"raw"');
    expect(logContent).not.toContain(SINTETIS_NIK);
  });

  it("fail-open when log path invalid", async () => {
    const failDir = mkdtempSync(join(tmpdir(), "gapura-proxy-fail-"));
    const { writeFileSync } = await import("node:fs");
    writeFileSync(join(failDir, "not-a-dir"), "x");
    upstream = await startStreamingUpstream();
    proxy = await startGapuraProxy({
      listenHost: "127.0.0.1",
      listenPort: 0,
      targetOrigin: upstream.origin,
      logDir: join(failDir, "not-a-dir"),
    });
    const res = await fetch(`${proxy.baseUrl}/ping`, { method: "GET" });
    expect(res.ok).toBe(true);
    rmSync(failDir, { recursive: true, force: true });
  });
});
