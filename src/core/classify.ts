import type { CallStatus, PiiCounts, TokenCounts } from "./types.js";
import { totalCount } from "./detect.js";

export function classifyCall(
  pii: PiiCounts,
  tokens: TokenCounts,
  unchecked: boolean,
): CallStatus {
  if (unchecked) return "unchecked";
  const piiTotal = totalCount(pii);
  const tokenTotal = totalCount(tokens);
  if (piiTotal > 0 && tokenTotal > 0) return "mixed";
  if (piiTotal > 0) return "raw";
  if (tokenTotal > 0) return "masked";
  return "clean";
}
