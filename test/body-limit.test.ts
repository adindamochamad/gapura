import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  readRequestBodyForObservation,
  observeHttpRequest,
} from "../src/core/observe.js";
import { DEFAULT_MAX_BODY_BYTES } from "../src/core/types.js";
import { wrapFetch } from "../src/wrap/wrapFetch.js";
import { startMockLlmProvider } from "../src/cli/mockProvider.js";

describe("readRequestBodyForObservation — size gate", () => {
  it("skips arrayBuffer when Content-Length exceeds max", async () => {
    const max = 1024;
    const req = new Request("http://127.0.0.1/v1/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(max + 1),
      },
      body: "x".repeat(max + 1),
    });
    const { bodyText, bodyBytes } = await readRequestBodyForObservation(
      req,
      max,
    );
    expect(bodyText).toBeNull();
    expect(bodyBytes).toBe(max + 1);
  });

  it("reads body under cap via stream", async () => {
    const body = JSON.stringify({ ok: true });
    const req = new Request("http://127.0.0.1/v1/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const { bodyText, bodyBytes } = await readRequestBodyForObservation(req);
    expect(bodyText).toBe(body);
    expect(bodyBytes).toBe(Buffer.byteLength(body));
  });

  it("returns null bodyText when stream exceeds max without full decode", async () => {
    const max = 512;
    const big = "y".repeat(max + 100);
    const req = new Request("http://127.0.0.1/v1/big", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: big,
    });
    const { bodyText, bodyBytes } = await readRequestBodyForObservation(
      req,
      max,
    );
    expect(bodyText).toBeNull();
    expect(bodyBytes).toBeGreaterThan(max);
  });
});

describe("observeHttpRequest — too-large", () => {
  it("marks unchecked when bytes over default max", () => {
    const { entry } = observeHttpRequest({
      url: "https://api.openai.com/v1/chat/completions",
      method: "POST",
      headers: new Headers({ "content-type": "application/json" }),
      bodyText: null,
      bodyBytes: DEFAULT_MAX_BODY_BYTES + 1,
    });
    expect(entry.status).toBe("unchecked");
    expect(entry.bytes).toBe(DEFAULT_MAX_BODY_BYTES + 1);
  });
});

describe("wrapFetch — oversized body", () => {
  it("logs unchecked without storing payload and forwards request", async () => {
    const logDir = mkdtempSync(join(tmpdir(), "gapura-huge-"));
    const mock = await startMockLlmProvider();
    const gapuraFetch = wrapFetch(fetch, { logDir });
    const hugeInner = "z".repeat(6 * 1024 * 1024);
    const body = JSON.stringify({
      model: "mock",
      messages: [{ role: "user", content: hugeInner }],
    });
    const res = await gapuraFetch(`${mock.baseUrl}/v1/huge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    expect(res.ok).toBe(true);
    const logFile = join(logDir, readdirSync(logDir)[0]!);
    const logContent = readFileSync(logFile, "utf8");
    expect(logContent).toContain('"status":"unchecked"');
    expect(logContent).not.toContain(hugeInner.slice(0, 200));
    await mock.close();
    rmSync(logDir, { recursive: true, force: true });
  });
});
