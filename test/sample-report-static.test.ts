import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("committed sample report", () => {
  it("laporan-contoh.md matches neutral report contract", () => {
    const md = readFileSync(
      join(process.cwd(), "examples/sample-reports/laporan-contoh.md"),
      "utf8",
    );
    expect(md).toContain("# Catatan panggilan LLM");
    expect(md).toContain("bukan bukti kepatuhan");
    expect(md).not.toContain("Transfer ke luar negeri");
    expect(md).not.toMatch(/\bSCC\b/);
    expect(md).not.toContain("127.0.0.1");
  });
});
