import { countPiiInTextPair } from "./detect.js";

const MODEL_RE = /^[A-Za-z0-9._:/@-]{1,64}$/;

export function extractSafeModelField(value: unknown): string | undefined {
  if (value === null || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  const model = obj.model;
  if (typeof model !== "string" || model.length === 0) return undefined;
  if (!MODEL_RE.test(model)) return undefined;
  if (/\d{6,}/.test(model)) return undefined;
  const pii = countPiiInTextPair(model);
  if (Object.keys(pii).length > 0) return undefined;
  return model;
}
