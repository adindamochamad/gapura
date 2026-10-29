import { describe, expect, it } from "vitest";
import { execSync } from "node:child_process";

const TRACKED_DEMO_PATHS = [
  "examples/demo-logs",
  "examples/sample-reports",
  "viewer/index.html",
];

describe("demo clean tree", () => {
  it("npm run demo does not change git status of example paths", () => {
    const root = process.cwd();
    execSync("npm run build", { cwd: root, stdio: "pipe" });
    const before = new Map<string, string>();
    for (const p of TRACKED_DEMO_PATHS) {
      before.set(
        p,
        execSync(`git status --porcelain ${p}`, { cwd: root, encoding: "utf8" }).trim(),
      );
    }
    execSync("npm run demo", { cwd: root, stdio: "pipe" });
    for (const p of TRACKED_DEMO_PATHS) {
      const after = execSync(`git status --porcelain ${p}`, {
        cwd: root,
        encoding: "utf8",
      }).trim();
      expect(after, p).toBe(before.get(p));
    }
  }, 120_000);
});
