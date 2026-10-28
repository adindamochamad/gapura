const BASE64_LIKE = /^[A-Za-z0-9+/=\s]{200,}$/;

export function isLikelyBase64Blob(s: string): boolean {
  if (s.length < 200) return false;
  const trimmed = s.replace(/\s/g, "");
  if (trimmed.length < 200) return false;
  return BASE64_LIKE.test(trimmed.slice(0, 512));
}

export function extractStringsFromJson(value: unknown, out: string[]): void {
  if (value === null || value === undefined) return;
  if (typeof value === "string") {
    if (!isLikelyBase64Blob(value)) out.push(value);
    return;
  }
  if (typeof value === "number" || typeof value === "boolean") return;
  if (Array.isArray(value)) {
    for (const item of value) extractStringsFromJson(item, out);
    return;
  }
  if (typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) {
      extractStringsFromJson(v, out);
    }
  }
}

export function extractModelField(value: unknown): string | undefined {
  if (value === null || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  const model = obj.model;
  if (typeof model === "string" && model.length > 0 && model.length <= 128) {
    return model;
  }
  return undefined;
}

export function tryParseJsonBody(text: string): unknown | null {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
