import type { CoverageReason } from "./reasons.js";
import { collectFromJson, tryParseJsonBody } from "./extract.js";
import { extractSafeModelField } from "./modelField.js";

export function extractTextsFromUrlEncoded(
  body: string,
  out: string[],
  reasons: Set<CoverageReason>,
): void {
  try {
    const params = new URLSearchParams(body);
    for (const [key, value] of params.entries()) {
      out.push(key);
      out.push(value);
    }
  } catch {
    reasons.add("non-json");
  }
}

export function extractTextsFromFormData(
  fd: FormData,
  out: string[],
  reasons: Set<CoverageReason>,
): { bodyBytes: number } {
  let bodyBytes = 0;
  reasons.add("multipart");
  for (const [key, value] of fd.entries()) {
    out.push(key);
    if (typeof value === "string") {
      out.push(value);
      bodyBytes +=
        Buffer.byteLength(key, "utf8") + Buffer.byteLength(value, "utf8");
    } else {
      reasons.add("stream-not-inspected");
      bodyBytes += value.size;
    }
  }
  return { bodyBytes: Math.max(bodyBytes, 1) };
}

function parseBoundary(contentType: string): string | null {
  const m = /boundary=(?:"([^"]+)"|([^;\s]+))/i.exec(contentType);
  return m ? (m[1] ?? m[2] ?? null) : null;
}

function isLikelyTextPart(headersBlock: string): boolean {
  const ct = /content-type:\s*([^\r\n]+)/i.exec(headersBlock);
  if (!ct) return true;
  const type = ct[1]!.toLowerCase();
  if (type.includes("application/octet-stream")) return false;
  if (type.startsWith("text/")) return true;
  if (type.includes("json")) return true;
  if (type.includes("xml")) return true;
  return type.includes("urlencoded");
}

export function extractTextsFromMultipartBody(
  bodyText: string,
  contentType: string,
  maxInspectBytes: number,
  out: string[],
  reasons: Set<CoverageReason>,
): void {
  reasons.add("multipart");
  const boundary = parseBoundary(contentType);
  if (!boundary) {
    reasons.add("unsupported-content-type");
    return;
  }
  const delim = `--${boundary}`;
  const parts = bodyText.split(delim);
  if (bodyText.length > maxInspectBytes) {
    reasons.add("too-large");
  }
  for (const part of parts) {
    const trimmed = part.replace(/^\r\n/, "").replace(/\r\n--$/, "");
    if (!trimmed || trimmed === "--") continue;
    const headerEnd = trimmed.indexOf("\r\n\r\n");
    if (headerEnd < 0) continue;
    const headersBlock = trimmed.slice(0, headerEnd);
    const partBody = trimmed.slice(headerEnd + 4).replace(/\r\n$/, "");
    const nameMatch = /name="([^"]+)"/i.exec(headersBlock);
    if (nameMatch) out.push(nameMatch[1]!);
    const filenameMatch = /filename="([^"]*)"/i.exec(headersBlock);
    if (filenameMatch && filenameMatch[1]) {
      reasons.add("stream-not-inspected");
      continue;
    }
    if (!isLikelyTextPart(headersBlock)) {
      reasons.add("stream-not-inspected");
      continue;
    }
    out.push(partBody);
  }
}

export type BodyTextKind = "json" | "urlencoded" | "multipart" | "unknown";

export function classifyBodyContentType(contentType: string): BodyTextKind {
  const ct = contentType.toLowerCase();
  if (ct.includes("application/json") || ct.includes("+json")) return "json";
  if (ct.includes("application/x-www-form-urlencoded")) return "urlencoded";
  if (ct.includes("multipart/form-data")) return "multipart";
  return "unknown";
}

export function appendBodyTextsForObservation(
  bodyText: string,
  contentType: string,
  maxInspectBytes: number,
  scanTexts: string[],
  reasons: Set<CoverageReason>,
): string | undefined {
  const kind = classifyBodyContentType(contentType);
  if (kind === "json") {
    const parsed = tryParseJsonBody(bodyText);
    if (parsed === null) {
      reasons.add("non-json");
      return undefined;
    }
    const state = { texts: scanTexts, reasons: new Set<CoverageReason>() };
    collectFromJson(parsed, state);
    for (const r of state.reasons) reasons.add(r);
    return extractSafeModelField(parsed);
  }
  if (kind === "urlencoded") {
    extractTextsFromUrlEncoded(bodyText, scanTexts, reasons);
    return undefined;
  }
  if (kind === "multipart") {
    extractTextsFromMultipartBody(
      bodyText,
      contentType,
      maxInspectBytes,
      scanTexts,
      reasons,
    );
    return undefined;
  }
  if (bodyText.trim()) {
    reasons.add("unsupported-content-type");
  }
  return undefined;
}
