import type { CoverageReason } from "./reasons.js";

const BASE64_FULL =
  /^[A-Za-z0-9+/_-]+={0,2}$/;

export function isLikelyBase64Blob(s: string): boolean {
  if (/\s/.test(s)) return false;
  if (s.startsWith("data:") && s.includes(";base64,")) return true;
  if (s.length < 200) return false;
  return BASE64_FULL.test(s);
}

export interface JsonExtractState {
  texts: string[];
  reasons: Set<CoverageReason>;
}

export function extractStringsFromJson(
  value: unknown,
  out: string[],
): void {
  const state: JsonExtractState = { texts: out, reasons: new Set() };
  collectFromJson(value, state);
}

export function collectFromJson(value: unknown, state: JsonExtractState): void {
  if (value === null || value === undefined) return;
  if (typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return;
    if (
      Number.isInteger(value) &&
      Math.abs(value) > Number.MAX_SAFE_INTEGER
    ) {
      state.reasons.add("number-precision-lost");
      state.texts.push(String(value));
      return;
    }
    state.texts.push(String(value));
    return;
  }
  if (typeof value === "string") {
    if (isLikelyBase64Blob(value)) {
      state.reasons.add("base64-skipped");
      return;
    }
    state.texts.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectFromJson(item, state);
    return;
  }
  if (typeof value === "object") {
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      state.texts.push(key);
      collectFromJson(v, state);
    }
  }
}

export function tryParseJsonBody(text: string): unknown | null {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
