#!/usr/bin/env node
/**
 * Uji mutasi: salin repo ke folder tmp, terapkan satu mutasi, vitest harus gagal.
 */
import { cpSync, mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

/** @type {{ id: string, file: string, find: string, replace: string, tests: string }[]} */
const MUTATIONS = [
  {
    id: "M1",
    file: "src/core/logger.ts",
    find: "let line = serializeLogEntry(cleaned).trimEnd();",
    replace:
      'let line = `${JSON.stringify({ ...cleaned, preview: "3171010101010000" })}\\n`;',
    tests: "test/privacy.test.ts",
  },
  {
    id: "M2",
    file: "src/core/schema.ts",
    find: "delete obj[key];",
    replace: "void key; /* M2 keep leak */",
    tests: "test/schema.test.ts",
  },
  {
    id: "M3",
    file: "src/core/observe.ts",
    find: "path: sanitizePathForLog(url.pathname || \"/\"),",
    replace:
      'path: `${url.pathname}${input.headers.get("authorization") ?? ""}`,',
    tests: "test/privacy.test.ts",
  },
  {
    id: "M4",
    file: "src/core/observe.ts",
    find: "path: sanitizePathForLog(url.pathname || \"/\"),",
    replace: 'path: `${url.pathname}${url.search}`,',
    tests: "test/privacy.test.ts",
  },
  {
    id: "M5",
    file: "src/core/logger.ts",
    find: "let line = serializeLogEntry(cleaned).trimEnd();",
    replace:
      'let line = `${JSON.stringify({ ...cleaned, pii: { NIK: "3171010101010000" } })}\\n`;',
    tests: "test/privacy.test.ts",
  },
  {
    id: "M6",
    file: "src/core/extract.ts",
    find: `    state.texts.push(String(value));
    return;
  }
  if (typeof value === "string") {`,
    replace: `    /* M6 skip number */
    return;
  }
  if (typeof value === "string") {`,
    tests: "test/detect-gaps.test.ts",
  },
  {
    id: "M7",
    file: "src/core/pathLog.ts",
    find: "out.push(segmentLooksSensitive(seg) ? \":id\" : seg);",
    replace: "out.push(seg);",
    tests: "test/detect-gaps.test.ts",
  },
  {
    id: "M8",
    file: "src/core/bodyExtract.ts",
    find: "    return extractSafeModelField(parsed);",
    replace:
      "    return typeof (parsed as Record<string, unknown>).model === \"string\" ? ((parsed as Record<string, unknown>).model as string) : undefined;",
    tests: "test/detect-gaps.test.ts",
  },
  {
    id: "M9",
    file: "src/core/schema.ts",
    find: "dropped.push(key);",
    replace: "out[key] = raw[key]; dropped.push(key);",
    tests: "test/schema.test.ts",
  },
  {
    id: "M10",
    file: "src/core/extract.ts",
    find: `  if (/\\s/.test(s)) return false;
  if (s.startsWith("data:") && s.includes(";base64,")) return true;
  if (s.length < 200) return false;
  return BASE64_FULL.test(s);`,
    replace: `  const trimmed = s.replace(/\\s/g, "");
  if (trimmed.length < 200) return false;
  return BASE64_FULL.test(trimmed.slice(0, 512));`,
    tests: "test/detect-gaps.test.ts",
  },
  {
    id: "M11",
    file: "src/core/normalize.ts",
    find: "export function normalizeForScan(text: string): string {",
    replace:
      "export function normalizeForScan(text: string): string { return text;",
    tests: "test/detect-gaps.test.ts",
  },
  {
    id: "M12",
    file: "src/wrap/wrapFetch.ts",
    find: "const fetchPromise = baseFetch(input, init);",
    replace:
      "await new Promise((r) => setTimeout(r, 250)); const fetchPromise = baseFetch(input, init);",
    tests: "test/wrapfetch-transparent.test.ts",
  },
  {
    id: "M13",
    file: "src/core/scanPayload.ts",
    find: "reasons.push(\"detector-error\");",
    replace: "/* M13 swallow */",
    tests: "test/observer-budget.test.ts",
  },
  {
    id: "M14",
    file: "src/proxy/body.ts",
    find: "if (!raw.startsWith(\"/\") || raw.startsWith(\"//\")) return null;",
    replace: "if (false) return null;",
    tests: "test/proxy-hardening.test.ts",
  },
];

function runMutation(root, m) {
  const filePath = join(root, m.file);
  const text = readFileSync(filePath, "utf8");
  if (!text.includes(m.find)) {
    return { id: m.id, ok: false, note: "pattern missing" };
  }
  writeFileSync(filePath, text.replace(m.find, m.replace));
  try {
    execSync("npm run build", { cwd: root, stdio: "pipe" });
  } catch (e) {
    return { id: m.id, ok: false, note: "build failed after mutate" };
  }
  let testsFailed = false;
  try {
    execSync(`npx vitest run ${m.tests}`, { cwd: root, stdio: "pipe" });
  } catch {
    testsFailed = true;
  }
  return {
    id: m.id,
    ok: testsFailed,
    note: testsFailed ? "caught" : "NOT caught — tests still green",
  };
}

const root = process.cwd();

function missingPatterns(base) {
  const missing = [];
  for (const m of MUTATIONS) {
    const text = readFileSync(join(base, m.file), "utf8");
    if (!text.includes(m.find)) missing.push({ id: m.id, file: m.file });
  }
  return missing;
}

{
  const missing = missingPatterns(root);
  if (missing.length) {
    console.error("Pola mutasi tidak ditemukan:", missing);
    process.exit(1);
  }
}

if (process.argv.includes("--patterns-only")) {
  console.log("Semua pola M1–M14 ada di working tree.");
  process.exit(0);
}

const results = [];

for (const m of MUTATIONS) {
  const tmp = mkdtempSync(join(tmpdir(), `gapura-mut-${m.id}-`));
  try {
    cpSync(root, tmp, {
      recursive: true,
      filter: (src) =>
        !src.includes("node_modules") &&
        !src.includes(".git") &&
        !src.includes("gapura-demo-out"),
    });
    execSync("npm ci", { cwd: tmp, stdio: "pipe" });
    execSync("npm run build", { cwd: tmp, stdio: "pipe" });
    results.push(runMutation(tmp, m));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

console.table(results);
const bad = results.filter((r) => !r.ok);
if (bad.length) {
  console.error(`${bad.length} mutasi tidak tertangkap tes.`);
  process.exit(1);
}
console.log("Semua mutasi M1–M14 tertangkap tes.");
