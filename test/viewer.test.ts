import { describe, expect, it } from "vitest";
import { renderViewerPage } from "../src/report/viewerPage.js";
import { LEGAL_DISCLAIMER } from "../src/report/pasal161.js";

describe("static viewer", () => {
  it("stays local: file picker, disclaimer, no remote URLs", () => {
    const html = renderViewerPage();
    expect(html).toContain(LEGAL_DISCLAIMER);
    expect(html).toContain('type="file"');
    expect(html).toContain("accept=");
    expect(html).toContain(".jsonl");
    expect(html).not.toMatch(/googleapis/i);
    expect(html).not.toMatch(/https?:\/\/fonts\./i);
  });
});
