import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { wrapFetch } from "../src/wrap/wrapFetch.js";
import { startMockLlmProvider } from "../src/cli/mockProvider.js";

const SYNTHETIC_NIK = "3171010101010000";

describe("wrapFetch FormData", () => {
  it("scans text fields in FormData body", async () => {
    const logDir = mkdtempSync(join(tmpdir(), "gapura-fd-"));
    const mock = await startMockLlmProvider();
    const gapuraFetch = wrapFetch(fetch, { logDir });
    const fd = new FormData();
    fd.set("note", `SINTETIS NIK ${SYNTHETIC_NIK}`);
    await gapuraFetch(`${mock.baseUrl}/v1/form`, {
      method: "POST",
      body: fd,
    });
    const content = readFileSync(
      join(logDir, readdirSync(logDir)[0]!),
      "utf8",
    );
    expect(content).toContain('"status":"raw"');
    expect(content).toContain('"NIK":1');
    await mock.close();
    rmSync(logDir, { recursive: true, force: true });
  });
});
