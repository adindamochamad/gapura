import type { PiiCounts, TokenCounts } from "./types.js";
import type { CoverageReason } from "./reasons.js";
import {
  countPiiInTextPair,
  countTiraiTokensPair,
  totalCount,
} from "./detect.js";

export interface ScanBudget {
  maxMatches?: number;
  /** Batas waktu pemindaian sinkron (ms). */
  maxScanMs?: number;
}

export interface ScanPayloadResult {
  pii: PiiCounts;
  tokens: TokenCounts;
  reasons: CoverageReason[];
}

const CHUNK_SIZE = 16 * 1024;
const DEFAULT_MAX_MATCHES = 5000;

export type DetectFn = (text: string) => { pii: PiiCounts; tokens: TokenCounts };

export function defaultDetectFn(text: string): {
  pii: PiiCounts;
  tokens: TokenCounts;
} {
  return {
    pii: countPiiInTextPair(text),
    tokens: countTiraiTokensPair(text),
  };
}

function mergeMaxPii(into: PiiCounts, part: PiiCounts): void {
  for (const [k, v] of Object.entries(part)) {
    into[k] = Math.max(into[k] ?? 0, v ?? 0);
  }
}

function mergeMaxTok(into: TokenCounts, part: TokenCounts): void {
  for (const [k, v] of Object.entries(part)) {
    into[k] = Math.max(into[k] ?? 0, v ?? 0);
  }
}

function chunkText(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text];
  const chunks: string[] = [];
  for (let i = 0; i < text.length; ) {
    let end = Math.min(i + CHUNK_SIZE, text.length);
    if (end < text.length) {
      const slice = text.slice(i, end);
      const sp = slice.lastIndexOf(" ");
      if (sp > CHUNK_SIZE / 2) end = i + sp;
    }
    chunks.push(text.slice(i, end));
    i = end;
  }
  return chunks;
}

export function scanPayloadSync(
  texts: string[],
  budget: ScanBudget = {},
  detect: DetectFn = defaultDetectFn,
): ScanPayloadResult {
  const maxMatches = budget.maxMatches ?? DEFAULT_MAX_MATCHES;
  const maxMs = budget.maxScanMs;
  const started = maxMs !== undefined ? Date.now() : 0;
  const pii: PiiCounts = {};
  const tokens: TokenCounts = {};
  const reasons: CoverageReason[] = [];
  let matchCount = 0;

  try {
    for (const text of texts) {
      for (const chunk of chunkText(text)) {
        if (maxMs !== undefined && Date.now() - started > maxMs) {
          reasons.push("time-budget");
          return { pii, tokens, reasons };
        }
        const part = detect(chunk);
        matchCount += totalCount(part.pii) + totalCount(part.tokens);
        mergeMaxPii(pii, part.pii);
        mergeMaxTok(tokens, part.tokens);
        if (matchCount > maxMatches) {
          reasons.push("too-dense");
          return { pii, tokens, reasons };
        }
      }
    }
  } catch (err) {
    reasons.push("detector-error");
    console.error(
      `gapura: detector-error ${err instanceof Error ? err.name : "Error"}`,
    );
  }

  return { pii, tokens, reasons };
}

export function yieldImmediate(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

export interface AsyncScanBudget extends ScanBudget {
  maxScanMs?: number;
}

export async function scanPayloadAsync(
  texts: string[],
  budget: AsyncScanBudget = {},
  detect: DetectFn = defaultDetectFn,
): Promise<ScanPayloadResult> {
  const maxMs = budget.maxScanMs ?? 500;
  const started = Date.now();
  const maxMatches = budget.maxMatches ?? DEFAULT_MAX_MATCHES;
  const pii: PiiCounts = {};
  const tokens: TokenCounts = {};
  const reasons: CoverageReason[] = [];
  let matchCount = 0;

  try {
    for (const text of texts) {
      for (const chunk of chunkText(text)) {
        if (Date.now() - started > maxMs) {
          reasons.push("time-budget");
          return { pii, tokens, reasons };
        }
        await yieldImmediate();
        const part = detect(chunk);
        matchCount += totalCount(part.pii) + totalCount(part.tokens);
        mergeMaxPii(pii, part.pii);
        mergeMaxTok(tokens, part.tokens);
        if (matchCount > maxMatches) {
          reasons.push("too-dense");
          return { pii, tokens, reasons };
        }
      }
    }
  } catch (err) {
    reasons.push("detector-error");
    console.error(
      `gapura: detector-error ${err instanceof Error ? err.name : "Error"}`,
    );
  }

  return { pii, tokens, reasons };
}
