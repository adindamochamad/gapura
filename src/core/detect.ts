import { normalizeForScan } from "./normalize.js";
import { detectAll, PII_TYPES, type PiiType } from "@adindamochamad/tirai";
import type { PiiCounts, TokenCounts } from "./types.js";

const TOKEN_TYPES = PII_TYPES.map((t) => t.toLowerCase()).join("|");
const TOKEN_RE = new RegExp(
  `\\[\\s*(${TOKEN_TYPES})\\s*_\\s*(\\d+)\\s*\\]`,
  "gi",
);

function maxMerge(a: PiiCounts, b: PiiCounts): PiiCounts {
  const out: PiiCounts = { ...a };
  for (const [k, v] of Object.entries(b)) {
    const n = v ?? 0;
    out[k] = Math.max(out[k] ?? 0, n);
  }
  return out;
}

export function countPiiInText(text: string): PiiCounts {
  const matches = detectAll(text);
  const counts: PiiCounts = {};
  for (const m of matches) {
    const t = m.type;
    counts[t] = (counts[t] ?? 0) + 1;
  }
  return counts;
}

/** Maksimum hitungan dari teks asli dan varian ternormalisasi (bukan jumlah). */
export function countPiiInTextPair(text: string): PiiCounts {
  return maxMerge(countPiiInText(text), countPiiInText(normalizeForScan(text)));
}

export function countPiiInTexts(texts: string[]): PiiCounts {
  const merged: PiiCounts = {};
  for (const text of texts) {
    const part = countPiiInTextPair(text);
    for (const [k, v] of Object.entries(part)) {
      merged[k] = Math.max(merged[k] ?? 0, v ?? 0);
    }
  }
  return merged;
}

export function countTiraiTokens(text: string): TokenCounts {
  const counts: TokenCounts = {};
  TOKEN_RE.lastIndex = 0;
  for (const match of text.matchAll(TOKEN_RE)) {
    const rawType = match[1];
    if (!rawType) continue;
    const type = rawType.toUpperCase() as PiiType;
    if (!PII_TYPES.includes(type)) continue;
    counts[type] = (counts[type] ?? 0) + 1;
  }
  return counts;
}

function maxMergeTokens(a: TokenCounts, b: TokenCounts): TokenCounts {
  const out: TokenCounts = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] = Math.max(out[k] ?? 0, v ?? 0);
  }
  return out;
}

export function countTiraiTokensPair(text: string): TokenCounts {
  return maxMergeTokens(
    countTiraiTokens(text),
    countTiraiTokens(normalizeForScan(text)),
  );
}

export function countTiraiTokensInTexts(texts: string[]): TokenCounts {
  const merged: TokenCounts = {};
  for (const text of texts) {
    const part = countTiraiTokensPair(text);
    for (const [k, v] of Object.entries(part)) {
      merged[k] = Math.max(merged[k] ?? 0, v ?? 0);
    }
  }
  return merged;
}

export function totalCount(counts: PiiCounts | TokenCounts): number {
  return Object.values(counts).reduce<number>((a, b) => a + (b ?? 0), 0);
}
