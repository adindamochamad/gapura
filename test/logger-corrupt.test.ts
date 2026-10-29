import { describe, expect, it } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readAllLogLinesWithStats } from "../src/core/logger.js";
import { renderMarkdown } from "../src/report/markdown.js";

describe("corrupt log lines", () => {
  it("skips truncated lines and reports count", () => {
    const logDir = mkdtempSync(join(tmpdir(), "gapura-corrupt-"));
    writeFileSync(
      join(logDir, "gapura-2026-10-28.jsonl"),
      '{"v":2,"id":"ok","ts":"2026-10-28T00:00:00.000Z","provider":"local","host":"127.0.0.1","path":"/","status":"clean","pii":{},"tokens":{},"bytes":0,"coverage":"full","region_ref":{"provider_id":"local","processing_region":"x","verification":"x","docs_url":null,"verified_at":null}}\n{"v":1,"id":"trunc',
      "utf8",
    );
    const { entries, corrupt_lines } = readAllLogLinesWithStats(logDir);
    expect(entries.length).toBe(1);
    expect(corrupt_lines).toBe(1);
    const md = renderMarkdown(entries, {}, corrupt_lines);
    expect(md).toContain("1 baris log rusak dilewati");
    rmSync(logDir, { recursive: true, force: true });
  });
});
