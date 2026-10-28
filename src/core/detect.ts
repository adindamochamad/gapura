import { detectAll, PII_TYPES, type PiiType } from "@adindamochamad/tirai";
import type { PiiCounts, TokenCounts } from "./types.js";

const TOKEN_TYPES = PII_TYPES.map((t) => t.toLowerCase()).join("|");
const TOKEN_RE = new RegExp(
  `\\[\\s*(${TOKEN_TYPES})\\s*_\\s*(\\d+)\\s*\\]`,
  "gi",
);

export function countPiiInText(text: string): PiiCounts {
  const matches = detectAll(text);
  const counts: PiiCounts = {};
  for (const m of matches) {
    const t = m.type;
    counts[t] = (counts[t] ?? 0) + 1;
  }
  return counts;
}

export function countPiiInTexts(texts: string[]): PiiCounts {
  const merged: PiiCounts = {};
  for (const text of texts) {
    const part = countPiiInText(text);
    for (const [k, v] of Object.entries(part)) {
      merged[k] = (merged[k] ?? 0) + (v ?? 0);
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

export function countTiraiTokensInTexts(texts: string[]): TokenCounts {
  const merged: TokenCounts = {};
  for (const text of texts) {
    const part = countTiraiTokens(text);
    for (const [k, v] of Object.entries(part)) {
      merged[k] = (merged[k] ?? 0) + (v ?? 0);
    }
  }
  return merged;
}

export function totalCount(counts: PiiCounts | TokenCounts): number {
  let sum = 0;
  for (const v of Object.values(counts)) {
    sum += v ?? 0;
  }
  return sum;
}
