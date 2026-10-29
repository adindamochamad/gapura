import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../src/report/markdown.js";
import type { LogEntry } from "../src/core/types.js";

const entry: LogEntry = {
  v: 2,
  id: "1",
  ts: "2026-10-28T10:00:00.000Z",
  provider: "local",
  host: "127.0.0.1",
  path: "/v1/chat/completions",
  status: "clean",
  pii: {},
  tokens: {},
  bytes: 0,
  coverage: "full",
  region_ref: {
    provider_id: "local",
    processing_region: "tidak keluar mesin (kategori khusus)",
    verification: "tidak ada dokumentasi penyedia",
    docs_url: null,
    verified_at: null,
  },
};

describe("report contract", () => {
  it("uses neutral title and clean disclaimer", () => {
    const md = renderMarkdown([entry], {});
    expect(md).toContain("# Catatan panggilan LLM");
    expect(md).toContain("bukan bukti kepatuhan");
    expect(md).toContain("bukan jaminan");
    expect(md).not.toContain("Transfer ke luar negeri");
    expect(md).not.toContain("Pasal 165");
  });
});
