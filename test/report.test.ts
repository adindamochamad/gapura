import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../src/report/markdown.js";
import { renderHtml } from "../src/report/html.js";
import { PASAL161_SECTIONS, LEGAL_DISCLAIMER } from "../src/report/pasal161.js";
import type { LogEntryV1 } from "../src/core/types.js";

const sampleEntry: LogEntryV1 = {
  v: 1,
  id: "1",
  ts: "2026-10-28T10:00:00.000Z",
  provider: "local",
  host: "127.0.0.1",
  path: "/v1/chat/completions",
  status: "raw",
  pii: { NIK: 1 },
  tokens: {},
  bytes: 100,
  region_ref: {
    provider_id: "local",
    processing_region: "tidak keluar mesin (kategori khusus)",
    verification: "menurut dokumentasi penyedia, diakses 2026-10-28",
    docs_url: null,
    verified_at: "2026-10-28",
  },
};

describe("report snapshot", () => {
  it("includes Pasal 161 a–g, disclaimer, and honest verification labels", () => {
    const md = renderMarkdown([sampleEntry], {
      next_review_date: "2027-01-16",
    });
    expect(md).toContain(LEGAL_DISCLAIMER);
    for (const sec of PASAL161_SECTIONS) {
      expect(md).toContain(`### (${sec.id})`);
      expect(md).toContain(`**Label:** ${sec.label}`);
    }
    expect(md).toContain("tidak keluar mesin");
    expect(md).not.toMatch(/terverifikasi.*OpenAI.*setara/i);
  });

  it("has minimum content length", () => {
    const md = renderMarkdown([sampleEntry], {
      next_review_date: "2027-01-16",
      pasal161_manual: {
        instrumen_hukum: "[contoh] SCC",
      },
    });
    expect(md.length).toBeGreaterThan(500);
  });

  it("HTML report is a document: disclaimer, Pasal 161, icons+text status, no external URLs in CSS", () => {
    const html = renderHtml([sampleEntry], { next_review_date: "2027-01-16" });
    expect(html).toContain(LEGAL_DISCLAIMER);
    for (const sec of PASAL161_SECTIONS) {
      expect(html).toContain(`(${sec.id})`);
      expect(html).toContain(sec.label);
    }
    expect(html).toContain("status-raw");
    expect(html).toContain("Ikut apa adanya");
    expect(html).toContain("candi");
    expect(html).not.toMatch(/https?:\/\/fonts\./i);
    expect(html).not.toMatch(/googleapis/i);
  });
});
