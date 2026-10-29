export const COVERAGE_REASONS = [
  "non-json",
  "unsupported-content-type",
  "compressed",
  "multipart",
  "stream-not-inspected",
  "too-large",
  "base64-skipped",
  "base64-partial",
  "number-precision-lost",
  "time-budget",
  "detector-error",
  "too-dense",
] as const;

export type CoverageReason = (typeof COVERAGE_REASONS)[number];

export type Coverage = "full" | "partial";

const REASON_SET = new Set<string>(COVERAGE_REASONS);

export function isCoverageReason(s: string): s is CoverageReason {
  return REASON_SET.has(s);
}
