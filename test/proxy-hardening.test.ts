import { describe, expect, it, afterEach } from "vitest";
import { createServer, request as httpRequest, type Server } from "node:http";
import { gzipSync } from "node:zlib";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startGapuraProxy } from "../src/proxy/server.js";

describe("proxy hardening", () => {
  let proxy: Awaited<ReturnType<typeof startGapuraProxy>>;
  let evilHits = 0;
  let evilServer: Server;

  let logDir: string;

  afterEach(async () => {
    if (proxy) await proxy.close();
    if (evilServer) {
      await new Promise<void>((r) => evilServer.close(() => r()));
    }
    if (logDir) rmSync(logDir, { recursive: true, force: true });
    evilHits = 0;
  });

  it("GET // returns 400 and process stays alive", async () => {
    logDir = mkdtempSync(join(tmpdir(), "gapura-ph-"));
    const upstream = createServer((_req, res) => {
      res.end("alive");
    });
    await new Promise<void>((r) => upstream.listen(0, "127.0.0.1", () => r()));
    const upPort = (upstream.address() as { port: number }).port;
    logDir = mkdtempSync(join(tmpdir(), "gapura-ph-"));
    proxy = await startGapuraProxy({
      listenHost: "127.0.0.1",
      listenPort: 0,
      targetOrigin: `http://127.0.0.1:${upPort}`,
      logDir,
    });
    const bad = await fetch(`${proxy.baseUrl}//`);
    expect(bad.status).toBe(400);
    const ok = await fetch(`${proxy.baseUrl}/alive`);
    expect(ok.status).toBe(200);
    await new Promise<void>((r) => upstream.close(() => r()));
  });

  it("blocks SSRF to second host", async () => {
    evilServer = createServer((_req, res) => {
      evilHits += 1;
      res.end("evil");
    });
    await new Promise<void>((r) =>
      evilServer.listen(0, "127.0.0.1", () => r()),
    );
    const evilPort = (evilServer.address() as { port: number }).port;
    logDir = mkdtempSync(join(tmpdir(), "gapura-ph-"));
    proxy = await startGapuraProxy({
      listenHost: "127.0.0.1",
      listenPort: 0,
      targetOrigin: `http://127.0.0.1:${evilPort + 1}`,
      logDir,
    });
    const res = await fetch(
      `${proxy.baseUrl}//127.0.0.1:${evilPort}/steal`,
    ).catch(() => ({ status: 400 }));
    expect(res.status).toBe(400);
    expect(evilHits).toBe(0);
  });

  it("preserves gzip response bytes", async () => {
    const payload = gzipSync("hello hello hello hello");
    const upstream = createServer((_req, res) => {
      res.writeHead(200, {
        "Content-Type": "text/plain",
        "Content-Encoding": "gzip",
        "Content-Length": String(payload.length),
      });
      res.end(payload);
    });
    await new Promise<void>((r) => upstream.listen(0, "127.0.0.1", () => r()));
    const upPort = (upstream.address() as { port: number }).port;
    logDir = mkdtempSync(join(tmpdir(), "gapura-ph-"));
    proxy = await startGapuraProxy({
      listenHost: "127.0.0.1",
      listenPort: 0,
      targetOrigin: `http://127.0.0.1:${upPort}`,
      logDir,
    });
    const rawBody = await new Promise<Buffer>((resolve, reject) => {
      httpRequest(`${proxy.baseUrl}/gzip`, {
        headers: { "Accept-Encoding": "gzip" },
      })
        .on("response", (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () => resolve(Buffer.concat(chunks)));
        })
        .on("error", reject)
        .end();
    });
    expect(rawBody.equals(payload)).toBe(true);
    await new Promise<void>((r) => upstream.close(() => r()));
  });

  it("rejects Origin header with 403", async () => {
    const upstream = createServer((_req, res) => {
      res.end("ok");
    });
    await new Promise<void>((r) => upstream.listen(0, "127.0.0.1", () => r()));
    const upPort = (upstream.address() as { port: number }).port;
    logDir = mkdtempSync(join(tmpdir(), "gapura-ph-"));
    proxy = await startGapuraProxy({
      listenHost: "127.0.0.1",
      listenPort: 0,
      targetOrigin: `http://127.0.0.1:${upPort}`,
      logDir,
    });
    const res = await fetch(`${proxy.baseUrl}/`, {
      headers: { Origin: "http://evil.example" },
    });
    expect(res.status).toBe(403);
    await new Promise<void>((r) => upstream.close(() => r()));
  });
});
