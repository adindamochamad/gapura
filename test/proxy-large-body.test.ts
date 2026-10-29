import { describe, expect, it, afterEach } from "vitest";
import { createServer } from "node:http";
import { Readable } from "node:stream";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startGapuraProxy } from "../src/proxy/server.js";

describe("proxy large request bodies", () => {
  let logDir: string;

  afterEach(() => {
    if (logDir) rmSync(logDir, { recursive: true, force: true });
  });

  it("relays stream under default max request bytes", async () => {
    let received = 0;
    const upstream = createServer((req, res) => {
      req.on("data", (c) => {
        received += c.length;
      });
      req.on("end", () => {
        res.end("ok");
      });
    });
    await new Promise<void>((r) => upstream.listen(0, "127.0.0.1", () => r()));
    const upPort = (upstream.address() as { port: number }).port;
    logDir = mkdtempSync(join(tmpdir(), "gapura-plb-"));
    const proxy = await startGapuraProxy({
      listenHost: "127.0.0.1",
      listenPort: 0,
      targetOrigin: `http://127.0.0.1:${upPort}`,
      logDir,
      maxRequestBytes: 8 * 1024 * 1024,
    });
    const size = 2 * 1024 * 1024;
    const body = Readable.from(
      (async function* () {
        let sent = 0;
        while (sent < size) {
          const chunk = Buffer.alloc(Math.min(64 * 1024, size - sent), 97);
          sent += chunk.length;
          yield chunk;
        }
      })(),
    );
    const heapBefore = process.memoryUsage().heapUsed;
    const res = await fetch(`${proxy.baseUrl}/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: body as unknown as BodyInit,
      duplex: "half",
    } as RequestInit);
    expect(res.status).toBe(200);
    expect(received).toBe(size);
    const heapDelta = process.memoryUsage().heapUsed - heapBefore;
    expect(heapDelta).toBeLessThan(80 * 1024 * 1024);
    await proxy.close();
    await new Promise<void>((r) => upstream.close(() => r()));
  });

  it("returns 413 when body exceeds max-request-bytes", async () => {
    let received = 0;
    const upstream = createServer((req, res) => {
      req.on("data", (c) => {
        received += c.length;
      });
      req.on("end", () => res.end("ok"));
    });
    await new Promise<void>((r) => upstream.listen(0, "127.0.0.1", () => r()));
    const upPort = (upstream.address() as { port: number }).port;
    logDir = mkdtempSync(join(tmpdir(), "gapura-plb-"));
    const cap = 512 * 1024;
    const proxy = await startGapuraProxy({
      listenHost: "127.0.0.1",
      listenPort: 0,
      targetOrigin: `http://127.0.0.1:${upPort}`,
      logDir,
      maxRequestBytes: cap,
    });
    const res = await fetch(`${proxy.baseUrl}/big`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "x".repeat(cap + 1024),
    });
    expect(res.status).toBe(413);
    expect(received).toBeLessThanOrEqual(cap + 64 * 1024);
    const content = readFileSync(
      join(logDir, readdirSync(logDir)[0]!),
      "utf8",
    );
    expect(content).toContain('"http_status":413');
    await proxy.close();
    await new Promise<void>((r) => upstream.close(() => r()));
  });
});
