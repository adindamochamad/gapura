import { DEFAULT_MAX_BODY_BYTES } from "../core/types.js";
import type { CoverageReason } from "../core/reasons.js";
import { extractTextsFromFormData } from "../core/bodyExtract.js";

export interface BodyForObservation {
  url: string;
  method: string;
  headers: Headers;
  bodyText: string | null;
  bodyBytes: number;
  extraReasons: CoverageReason[];
}

function headersFromInit(input: RequestInfo | URL, init?: RequestInit): Headers {
  if (input instanceof Request) return input.headers;
  return new Headers(init?.headers ?? {});
}

function methodFromInit(input: RequestInfo | URL, init?: RequestInit): string {
  if (input instanceof Request) return input.method;
  return init?.method ?? "GET";
}

function urlFromInit(input: RequestInfo | URL, init?: RequestInit): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function byteLengthBody(body: unknown): number | null {
  if (typeof body === "string") return Buffer.byteLength(body, "utf8");
  if (body instanceof URLSearchParams) {
    return Buffer.byteLength(body.toString(), "utf8");
  }
  if (body instanceof ArrayBuffer) return body.byteLength;
  if (ArrayBuffer.isView(body)) return body.byteLength;
  if (body instanceof Uint8Array) return body.byteLength;
  return null;
}

function bodyToText(body: unknown): string | null {
  if (typeof body === "string") return body;
  if (body instanceof URLSearchParams) return body.toString();
  if (body instanceof ArrayBuffer) {
    return new TextDecoder().decode(new Uint8Array(body));
  }
  if (ArrayBuffer.isView(body)) {
    return new TextDecoder().decode(
      new Uint8Array(body.buffer, body.byteOffset, body.byteLength),
    );
  }
  if (body instanceof Uint8Array) {
    return new TextDecoder().decode(body);
  }
  return null;
}

function isStreamLike(body: unknown): boolean {
  if (body === null || body === undefined) return false;
  if (typeof body === "string") return false;
  if (body instanceof URLSearchParams) return false;
  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) return false;
  if (body instanceof Uint8Array) return false;
  if (typeof FormData !== "undefined" && body instanceof FormData) return true;
  if (typeof Blob !== "undefined" && body instanceof Blob) return true;
  if (typeof ReadableStream !== "undefined" && body instanceof ReadableStream) {
    return true;
  }
  return true;
}

/** Baca body hanya bila ukuran diketahui tanpa menguras stream. */
export function bodyForObservation(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  maxBytes = DEFAULT_MAX_BODY_BYTES,
): BodyForObservation {
  const url = urlFromInit(input, init);
  const method = methodFromInit(input, init);
  const headers = headersFromInit(input, init);
  const extraReasons: CoverageReason[] = [];

  if (input instanceof Request) {
    extraReasons.push("stream-not-inspected");
    return {
      url,
      method,
      headers,
      bodyText: method === "GET" || method === "HEAD" ? "" : null,
      bodyBytes: 0,
      extraReasons,
    };
  }

  const body = init?.body;
  if (method === "GET" || method === "HEAD") {
    return { url, method, headers, bodyText: "", bodyBytes: 0, extraReasons };
  }

  if (body === null || body === undefined) {
    return { url, method, headers, bodyText: "", bodyBytes: 0, extraReasons };
  }

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    const scanTexts: string[] = [];
    const reasonSet = new Set<CoverageReason>();
    const { bodyBytes: fdBytes } = extractTextsFromFormData(
      body,
      scanTexts,
      reasonSet,
    );
    for (const r of reasonSet) extraReasons.push(r);
    return {
      url,
      method,
      headers,
      bodyText: scanTexts.join("\n"),
      bodyBytes: fdBytes,
      extraReasons,
    };
  }

  if (isStreamLike(body)) {
    extraReasons.push("stream-not-inspected");
    return { url, method, headers, bodyText: null, bodyBytes: 0, extraReasons };
  }

  const len = byteLengthBody(body);
  if (len === null) {
    extraReasons.push("stream-not-inspected");
    return { url, method, headers, bodyText: null, bodyBytes: 0, extraReasons };
  }

  if (len > maxBytes) {
    extraReasons.push("too-large");
    return { url, method, headers, bodyText: null, bodyBytes: len, extraReasons };
  }

  const bodyText = bodyToText(body);
  return {
    url,
    method,
    headers,
    bodyText,
    bodyBytes: len,
    extraReasons,
  };
}

export function shouldLogHost(
  hostname: string,
  opts: { hosts?: string[]; excludeHosts?: string[] },
): boolean {
  if (opts.excludeHosts?.includes(hostname)) return false;
  if (opts.hosts && opts.hosts.length > 0) {
    return opts.hosts.includes(hostname);
  }
  return true;
}
