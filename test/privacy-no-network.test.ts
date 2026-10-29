import { describe, expect, it, vi, afterEach } from "vitest";
import dns from "node:dns";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { wrapFetch } from "../src/wrap/wrapFetch.js";
import { startMockLlmProvider, syntheticOpenAiBody } from "../src/cli/mockProvider.js";
import { runDemo } from "../src/cli/demo.js";

describe("privacy no extra network", () => {
  const lookups: string[] = [];
  let origLookup: typeof dns.lookup;

  afterEach(() => {
    lookups.length = 0;
    vi.restoreAllMocks();
  });

  function spyDns(): void {
    origLookup = dns.lookup;
    vi.spyOn(dns, "lookup").mockImplementation(function (
      hostname: Parameters<typeof dns.lookup>[0],
      ...rest: unknown[]
    ) {
      const host =
        typeof hostname === "string"
          ? hostname
          : String((hostname as { hostname?: string }).hostname ?? "");
      lookups.push(host);
      const cb = rest.find((r) => typeof r === "function") as (
        err: NodeJS.ErrnoException | null,
        address: string,
        family: number,
      ) => void;
      if (cb) {
        cb(null, "127.0.0.1", 4);
        return;
      }
      return origLookup.call(dns, hostname, ...(rest as never));
    });
  }

  it("wrapFetch only hits mock loopback", async () => {
    spyDns();
    const logDir = mkdtempSync(join(tmpdir(), "gapura-net-"));
    const mock = await startMockLlmProvider();
    const gapuraFetch = wrapFetch(fetch, { logDir });
    await gapuraFetch(`${mock.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: syntheticOpenAiBody("clean"),
    });
    expect(mock.requestCount()).toBe(1);
    const external = lookups.filter(
      (h) => h !== "127.0.0.1" && h !== "localhost" && h !== "::1",
    );
    expect(external).toEqual([]);
    await mock.close();
    rmSync(logDir, { recursive: true, force: true });
  });

  it("runDemo does not resolve external hostnames", async () => {
    spyDns();
    const outDir = mkdtempSync(join(tmpdir(), "gapura-demo-net-"));
    await runDemo({ outDir, deterministic: true });
    const external = lookups.filter(
      (h) =>
        !h.includes("127.0.0.1") &&
        h !== "localhost" &&
        h !== "::1" &&
        !h.endsWith(".localhost"),
    );
    expect(external).toEqual([]);
    rmSync(outDir, { recursive: true, force: true });
  });
});
