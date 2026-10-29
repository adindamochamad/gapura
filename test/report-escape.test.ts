import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderHtml } from "../src/report/html.js";
import { renderMarkdown } from "../src/report/markdown.js";
import { renderViewerPage } from "../src/report/viewerPage.js";
import type { LogEntryV2 } from "../src/core/types.js";

function evilEntry(): LogEntryV2 {
  return {
    v: 2,
    id: "x",
    ts: "2026-01-01T00:00:00.000Z",
    provider: 'evil"><script>alert(1)</script>',
    host: "h\" onmouseover=\"alert(1)",
    path: "</td><script>",
    status: "raw",
    pii: { NIK: 1 },
    tokens: {},
    bytes: 1,
    coverage: "full",
    reasons: ['reason"break'],
    label: "isi<script>",
    region_ref: {
      provider_id: "openai",
      processing_region: "US<script>",
      verification: "belum terverifikasi",
      docs_url: null,
      verified_at: null,
    },
  };
}

describe("report escape", () => {
  it("HTML report escapes injection in fields", () => {
    const html = renderHtml([evilEntry()], {});
    expect(html).toContain(
      "evil&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;",
    );
    expect(html).not.toMatch(/class="where">[^&]*<script/i);
    expect(html).not.toContain('onmouseover="alert(1)"');
  });

  it("Markdown report escapes pipe in cells", () => {
    const entry = evilEntry();
    entry.host = "a|b";
    const md = renderMarkdown([entry], {});
    expect(md).toContain("a\\|b");
  });

  it("viewer page script escapes quotes in esc()", () => {
    const page = renderViewerPage();
    expect(page).toContain('replace(/"/g,"&quot;")');
    expect(page).toContain("ALLOWED_STATUS");
  });

  it("committed viewer/index.html matches generator escape", () => {
    const committed = readFileSync(
      join(process.cwd(), "viewer/index.html"),
      "utf8",
    );
    const generated = renderViewerPage();
    expect(committed).toBe(generated);
    expect(committed).toContain('replace(/"/g,"&quot;")');
    expect(committed).toContain("ALLOWED_STATUS");
  });
});
