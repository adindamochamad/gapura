import { randomUUID } from "node:crypto";
import type { CallStatus, GapuraConfig, LogEntryV2 } from "./types.js";
import { DEFAULT_MAX_BODY_BYTES as MAX_BYTES } from "./types.js";
import {
  collectFromJson,
  tryParseJsonBody,
  type JsonExtractState,
} from "./extract.js";
import { extractSafeModelField } from "./modelField.js";
import { scanPayloadSync } from "./scanPayload.js";
import { classifyCall } from "./classify.js";
import { resolveProvider } from "./providers.js";
import { sanitizePathForLog } from "./pathLog.js";
import type { Coverage, CoverageReason } from "./reasons.js";

export interface ObserveInput {
  url: string;
  method: string;
  headers: Headers;
  bodyText: string | null;
  bodyBytes: number;
  label?: string;
  config?: GapuraConfig;
  maxBodyBytes?: number;
  extraReasons?: CoverageReason[];
}

export interface ObserveOutput {
  entry: LogEntryV2;
}

function appendUrlScanTexts(url: URL, texts: string[]): void {
  for (const [key, value] of url.searchParams.entries()) {
    texts.push(key);
    texts.push(value);
  }
  for (const part of url.pathname.split("/")) {
    if (!part) continue;
    try {
      texts.push(decodeURIComponent(part));
    } catch {
      texts.push(part);
    }
  }
}

function bodySkipReasons(
  headers: Headers,
  bodyBytes: number,
  max: number,
): CoverageReason[] {
  const reasons: CoverageReason[] = [];
  const ct = (headers.get("content-type") ?? "").toLowerCase();
  if (ct.includes("multipart/form-data")) reasons.push("multipart");
  if (headers.get("content-encoding")) reasons.push("compressed");
  if (bodyBytes > max) reasons.push("too-large");
  return reasons;
}

export function observeHttpRequest(input: ObserveInput): ObserveOutput {
  const max = input.maxBodyBytes ?? MAX_BYTES;
  const url = new URL(input.url);
  const { provider, region_ref } = resolveProvider(url.hostname, input.config);

  const scanTexts: string[] = [];
  appendUrlScanTexts(url, scanTexts);

  const reasons = new Set<CoverageReason>();
  const skipReasons = bodySkipReasons(input.headers, input.bodyBytes, max);
  for (const r of skipReasons) reasons.add(r);
  for (const r of input.extraReasons ?? []) reasons.add(r);

  let model: string | undefined;

  if (input.bodyText === null) {
    if (!skipReasons.includes("too-large") && input.bodyBytes <= max) {
      reasons.add("stream-not-inspected");
    }
  } else if (skipReasons.length === 0) {
    if (!input.bodyText.trim()) {
      /* empty body — tidak ada yang dipindai di body */
    } else {
      const ct = (input.headers.get("content-type") ?? "").toLowerCase();
      if (ct && !ct.includes("json")) {
        reasons.add("unsupported-content-type");
      }
      const parsed = tryParseJsonBody(input.bodyText);
      if (parsed === null) {
        reasons.add("non-json");
      } else {
        const state: JsonExtractState = { texts: scanTexts, reasons: new Set() };
        collectFromJson(parsed, state);
        for (const r of state.reasons) reasons.add(r);
        model = extractSafeModelField(parsed);
      }
    }
  }

  const scan = scanPayloadSync(scanTexts);
  for (const r of scan.reasons) reasons.add(r);

  const pii = scan.pii;
  const tokens = scan.tokens;
  const hitTotal =
    Object.values(pii).reduce<number>((a, b) => a + (b ?? 0), 0) +
    Object.values(tokens).reduce<number>((a, b) => a + (b ?? 0), 0);

  const coverage: Coverage = reasons.size === 0 ? "full" : "partial";
  let status: CallStatus;
  if (hitTotal > 0) {
    status = classifyCall(pii, tokens, {
      coverage: "partial",
      forceUnchecked: false,
    });
  } else if (skipReasons.includes("too-large") || input.bodyBytes > max) {
    status = "unchecked";
  } else {
    status = classifyCall(pii, tokens, {
      coverage,
      forceUnchecked: false,
    });
  }

  const entry: LogEntryV2 = {
    v: 2,
    id: randomUUID(),
    ts: new Date().toISOString(),
    provider: provider.id,
    host: url.hostname,
    path: sanitizePathForLog(url.pathname || "/"),
    status,
    pii,
    tokens,
    bytes: input.bodyBytes,
    region_ref,
    coverage,
  };

  if (reasons.size > 0) entry.reasons = [...reasons];
  if (model) entry.model = model;
  if (input.label) entry.label = input.label;

  return { entry };
}

function parseContentLength(headers: Headers): number | null {
  const raw = headers.get("content-length");
  if (raw === null || raw.trim() === "") return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

async function readStreamWithCap(
  stream: ReadableStream<Uint8Array>,
  maxBytes: number,
): Promise<{ bodyText: string | null; bodyBytes: number; overLimit: boolean }> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  let overLimit = false;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value || value.byteLength === 0) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        overLimit = true;
        while (true) {
          const next = await reader.read();
          if (next.done) break;
        }
        break;
      }
      chunks.push(value);
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      /* ignore */
    }
  }

  if (overLimit) {
    return { bodyText: null, bodyBytes: total, overLimit: true };
  }

  const buf = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    buf.set(c, offset);
    offset += c.byteLength;
  }
  const bodyText = new TextDecoder().decode(buf);
  return { bodyText, bodyBytes: total, overLimit: false };
}

export async function readRequestBodyForObservation(
  request: Request,
  maxBytes = MAX_BYTES,
): Promise<{ bodyText: string | null; bodyBytes: number }> {
  if (request.method === "GET" || request.method === "HEAD") {
    return { bodyText: "", bodyBytes: 0 };
  }

  const contentLength = parseContentLength(request.headers);
  if (contentLength !== null && contentLength > maxBytes) {
    return { bodyText: null, bodyBytes: contentLength };
  }

  const clone = request.clone();
  const body = clone.body;
  if (!body) {
    return { bodyText: "", bodyBytes: 0 };
  }

  const { bodyText, bodyBytes, overLimit } = await readStreamWithCap(
    body,
    maxBytes,
  );
  if (overLimit) {
    return { bodyText: null, bodyBytes: bodyBytes };
  }
  return { bodyText, bodyBytes };
}
