import { randomUUID } from "node:crypto";
import type { CallStatus, GapuraConfig, LogEntryV1 } from "./types.js";
import { DEFAULT_MAX_BODY_BYTES as MAX_BYTES } from "./types.js";
import {
  extractModelField,
  extractStringsFromJson,
  tryParseJsonBody,
} from "./extract.js";
import {
  countPiiInTexts,
  countTiraiTokensInTexts,
} from "./detect.js";
import { classifyCall } from "./classify.js";
import { resolveProvider } from "./providers.js";

export interface ObserveInput {
  url: string;
  method: string;
  headers: Headers;
  bodyText: string | null;
  bodyBytes: number;
  label?: string;
  config?: GapuraConfig;
  maxBodyBytes?: number;
}

export interface ObserveOutput {
  entry: LogEntryV1;
  skippedReason?: string;
}

function pathWithoutQuery(url: URL): string {
  return url.pathname || "/";
}

function shouldSkipBody(headers: Headers, bodyBytes: number, max: number): {
  unchecked: boolean;
  reason?: string;
} {
  const ct = (headers.get("content-type") ?? "").toLowerCase();
  if (ct.includes("multipart/form-data")) {
    return { unchecked: true, reason: "multipart" };
  }
  if (headers.get("content-encoding")) {
    return { unchecked: true, reason: "content-encoding" };
  }
  if (bodyBytes > max) {
    return { unchecked: true, reason: "too-large" };
  }
  return { unchecked: false };
}

export function observeHttpRequest(input: ObserveInput): ObserveOutput {
  const max = input.maxBodyBytes ?? MAX_BYTES;
  const url = new URL(input.url);
  const { provider, region_ref } = resolveProvider(url.hostname, input.config);

  let status: CallStatus = "unchecked";
  let pii = {};
  let tokens = {};
  let model: string | undefined;

  const skip = shouldSkipBody(input.headers, input.bodyBytes, max);

  if (input.bodyText === null) {
    status = "unchecked";
  } else if (skip.unchecked) {
    status = "unchecked";
  } else if (!input.bodyText.trim()) {
    status = classifyCall({}, {}, false);
  } else {
    const parsed = tryParseJsonBody(input.bodyText);
    if (parsed === null) {
      status = "unchecked";
    } else {
      const strings: string[] = [];
      extractStringsFromJson(parsed, strings);
      pii = countPiiInTexts(strings);
      tokens = countTiraiTokensInTexts(strings);
      model = extractModelField(parsed);
      status = classifyCall(pii, tokens, false);
    }
  }

  const entry: LogEntryV1 = {
    v: 1,
    id: randomUUID(),
    ts: new Date().toISOString(),
    provider: provider.id,
    host: url.hostname,
    path: pathWithoutQuery(url),
    status,
    pii,
    tokens,
    bytes: input.bodyBytes,
    region_ref,
  };

  if (model) entry.model = model;
  if (input.label) entry.label = input.label;

  return { entry, skippedReason: skip.reason };
}

export async function readRequestBodyForObservation(
  request: Request,
  maxBytes = MAX_BYTES,
): Promise<{ bodyText: string | null; bodyBytes: number }> {
  if (request.method === "GET" || request.method === "HEAD") {
    return { bodyText: "", bodyBytes: 0 };
  }
  const clone = request.clone();
  const buf = await clone.arrayBuffer();
  const bodyBytes = buf.byteLength;
  if (bodyBytes > maxBytes) {
    return { bodyText: null, bodyBytes };
  }
  const bodyText = new TextDecoder().decode(buf);
  return { bodyText, bodyBytes };
}
