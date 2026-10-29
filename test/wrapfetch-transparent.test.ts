import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { wrapFetch } from "../src/wrap/wrapFetch.js";
import { startMockLlmProvider } from "../src/cli/mockProvider.js";

describe("wrapFetch transparency", () => {
  it("forwards same input and init objects to base fetch", async () => {
    let seenInput: RequestInfo | URL | undefined;
    let seenInit: RequestInit | undefined;
    const base = (input: RequestInfo | URL, init?: RequestInit) => {
      seenInput = input;
      seenInit = init;
      return new Response("ok");
    };
    const mock = await startMockLlmProvider();
    const gf = wrapFetch(base, { logDir: mkdtempSync(join(tmpdir(), "g-")) });
    const init = {
      method: "POST",
      keepalive: true,
      dispatcher: { marker: "agent" },
      body: '{"a":1}',
      headers: { "Content-Type": "application/json" },
    } as RequestInit & { dispatcher: { marker: string } };
    await gf(`${mock.baseUrl}/v1/x`, init);
    expect(Object.is(seenInput, `${mock.baseUrl}/v1/x`)).toBe(true);
    expect(Object.is(seenInit, init)).toBe(true);
    await mock.close();
  });

  it("marks 6MB string body too-large without manual Content-Length", async () => {
    const logDir = mkdtempSync(join(tmpdir(), "g-big-"));
    const mock = await startMockLlmProvider();
    const gf = wrapFetch(fetch, { logDir });
    const body = "x".repeat(6 * 1024 * 1024);
    await gf(`${mock.baseUrl}/v1/huge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const log = readFileSync(join(logDir, readdirSync(logDir)[0]!), "utf8");
    expect(log).toContain('"status":"unchecked"');
    expect(log).toContain("too-large");
    expect(log).not.toContain(body.slice(0, 100));
    await mock.close();
    rmSync(logDir, { recursive: true, force: true });
  });

  it("calls baseFetch before slow observation would finish", async () => {
    let fetchCalledAt = 0;
    const base = async () => {
      fetchCalledAt = Date.now();
      await new Promise((r) => setTimeout(r, 500));
      return new Response("ok");
    };
    const logDir = mkdtempSync(join(tmpdir(), "g-fast-"));
    const mock = await startMockLlmProvider();
    const start = Date.now();
    const gf = wrapFetch(base, { logDir });
    await gf(`${mock.baseUrl}/v1/x`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"a":1}',
    });
    expect(fetchCalledAt - start).toBeLessThan(100);
    await mock.close();
    rmSync(logDir, { recursive: true, force: true });
  });
});
