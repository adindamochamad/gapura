#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];

function fail(id, msg) {
  failures.push(`${id}: ${msg}`);
}

function read(rel) {
  const p = join(root, rel);
  if (!existsSync(p)) {
    fail("FILE", `missing ${rel}`);
    return "";
  }
  return readFileSync(p, "utf8");
}

const click = read("examples/saas-mockup/index.html");
const artboard = read("design/gapura-saas.html");
const readme = read("README.md");
const pitch = read("docs/PITCH.md");
const ci = read(".github/workflows/ci.yml");
const pkg = read("package.json");

for (const rel of [
  "design/DESIGN.md",
  "design/DOD.md",
  "design/gapura-saas.pen",
  "design/REVIEW.md",
  "examples/saas-mockup/README.md",
  "scripts/open-mockup.mjs",
]) {
  if (!existsSync(join(root, rel))) fail("D1", `missing ${rel}`);
}

if (!/fiksi/i.test(click)) fail("A1", "click mockup must say fiksi");
if (!/bukan bukti kepatuhan/i.test(click)) fail("A2", "missing bukan bukti kepatuhan");
if (!/bukan pendapat hukum/i.test(click)) fail("A2", "missing bukan pendapat hukum");
if (!/mockup pitch \(fiksi SaaS\)/i.test(readme)) fail("A4", "README must separate CLI vs mockup");
if (!/saas-mockup/i.test(pitch)) fail("A4", "PITCH.md must link mockup");

for (const label of ["Masuk ke workspace", "Ringkasan", "Penjelajah log", "Pasal 161", "Pengaturan", "Belum ada log"]) {
  if (!click.includes(label)) fail("B1", `click mockup missing «${label}»`);
}

for (const letter of ["(a)", "(b)", "(c)", "(d)", "(e)", "(f)", "(g)"]) {
  if (!click.includes(letter)) fail("B2", `click mockup missing Pasal ${letter}`);
  if (!artboard.includes(letter)) fail("B2", `artboard missing Pasal ${letter}`);
}

if (!/162 \(2\) h/.test(click) || !/162 \(2\) h/.test(artboard)) {
  fail("B3", "Pasal 162 (2) h note missing");
}

if (!/2026-10-29/.test(click) || !/api\.openai\.com/.test(click) || !/api\.anthropic\.com/.test(click)) {
  fail("B4", "dummy host/date missing on click mockup");
}
if (!/st raw/.test(click) || !/st masked/.test(click) || !/st clean/.test(click)) {
  fail("B4", "status badges missing");
}

if (!/M4 56 L4 28/.test(click) || !/#9a3412/i.test(click)) {
  fail("B5", "candi bentar path or terracotta token missing");
}

for (const hash of ["#masuk", "#ringkasan", "#log", "#laporan", "#pengaturan", "#mulai"]) {
  if (!click.includes(`"${hash.slice(1)}"`) && !click.includes(hash)) {
    fail("C1", `hash routing must include ${hash}`);
  }
}
if (!/location\.hash/.test(click) || !/data-page/.test(click)) {
  fail("C1", "hash/nav wiring missing");
}
if (!/data-status/.test(click) || !/chip/.test(click)) {
  fail("C2", "log filter hooks missing");
}
if (!/type="file"/.test(click) || !/accept="\.jsonl/.test(click)) {
  fail("C3", "local JSONL file input missing");
}

if (!/version": "2.21"/.test(read("design/gapura-saas.pen"))) {
  fail("D1", "pen document must be schema 2.21");
}

if (!/mockup:check/.test(ci)) fail("E1", "CI must run mockup:check");
if (!/"mockup:check"/.test(pkg)) fail("E1", "package.json missing mockup:check");
if (!/"mockup": "node scripts\/open-mockup.mjs"/.test(pkg)) {
  fail("E2", "mockup script must use open-mockup.mjs");
}

if (failures.length) {
  console.error("mockup:check FAILED\n" + failures.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
console.log("mockup:check: P0 otomatis lulus (P0 manual C2–C5, D2, E3–E4 masih dicentang manusia).");
