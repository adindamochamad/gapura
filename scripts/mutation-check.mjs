#!/usr/bin/env node
/**
 * Uji mutasi ringkas: salin repo ke tmp, terapkan mutasi, vitest harus gagal.
 */
import { cpSync, mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

const MUTATIONS = [
  {
    id: "M1",
    file: "src/core/logger.ts",
    find: "validateLogEntry(entry",
    replace: "/*M1*/ validateLogEntry({ ...entry, preview: bodyText } as any",
  },
  {
    id: "M9",
    file: "src/core/schema.ts",
    find: 'onUnknownKey ?? "drop"',
    replace: 'onUnknownKey ?? "throw"',
  },
];

const root = process.cwd();
const tmp = mkdtempSync(join(tmpdir(), "gapura-mut-"));
cpSync(root, tmp, {
  recursive: true,
  filter: (src) => !src.includes("node_modules") && !src.includes(".git"),
});
execSync("npm ci", { cwd: tmp, stdio: "pipe" });
execSync("npm run build", { cwd: tmp, stdio: "pipe" });

const results = [];
for (const m of MUTATIONS) {
  const path = join(tmp, m.file);
  let text = readFileSync(path, "utf8");
  if (!text.includes(m.find)) {
    results.push({ id: m.id, ok: false, note: "pattern missing" });
    continue;
  }
  writeFileSync(path, text.replace(m.find, m.replace));
  execSync("npm run build", { cwd: tmp, stdio: "pipe" });
  let failed = false;
  try {
    execSync("npx vitest run test/privacy.test.ts test/schema.test.ts", {
      cwd: tmp,
      stdio: "pipe",
    });
  } catch {
    failed = true;
  }
  results.push({ id: m.id, ok: failed, note: failed ? "tests failed" : "tests passed" });
  text = readFileSync(path, "utf8");
  writeFileSync(path, text.replace(m.replace, m.find));
}

rmSync(tmp, { recursive: true, force: true });
console.table(results);
if (results.some((r) => !r.ok)) process.exit(1);
