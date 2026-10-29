import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { runDemo } from "../src/cli/demo.js";

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

describe("committed sample report", () => {
  it("matches deterministic demo output", async () => {
    const outDir = mkdtempSync(join(tmpdir(), "gapura-sample-"));
    await runDemo({ outDir, deterministic: true });
    const root = process.cwd();
    const committedMd = join(root, "examples/sample-reports/laporan-contoh.md");
    const committedHtml = join(root, "examples/sample-reports/laporan-contoh.html");
    expect(sha256(join(outDir, "reports/laporan-contoh.md"))).toBe(
      sha256(committedMd),
    );
    expect(sha256(join(outDir, "reports/laporan-contoh.html"))).toBe(
      sha256(committedHtml),
    );
    const md = readFileSync(committedMd, "utf8");
    expect(md).toContain("# Catatan panggilan LLM");
    expect(md).toContain("bukan bukti kepatuhan");
    expect(md).not.toContain("Transfer ke luar negeri");
    rmSync(outDir, { recursive: true, force: true });
  });
});
