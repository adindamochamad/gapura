import type { GapuraConfig, LogOutcome } from "../core/types.js";
import {
  observeHttpRequest,
  readRequestBodyForObservation,
} from "../core/observe.js";
import { appendLogEntry, type LoggerOptions } from "../core/logger.js";

export interface WrapFetchOptions {
  fetch?: typeof fetch;
  logDir: string;
  label?: string;
  config?: GapuraConfig;
  strictSchema?: boolean;
  onUnknownKey?: "drop" | "throw";
  onError?: (err: unknown) => void;
}

function buildRequest(input: RequestInfo | URL, init?: RequestInit): Request {
  if (input instanceof Request) {
    if (init) {
      return new Request(input, init);
    }
    return input;
  }
  return new Request(input, init);
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

export function wrapFetch(baseFetch: typeof fetch, options: WrapFetchOptions) {
  const logOpts: LoggerOptions = {
    logDir: options.logDir,
    strictSchema: options.strictSchema,
    onUnknownKey: options.onUnknownKey,
  };

  return async function gapuraFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    let request: Request;
    try {
      request = buildRequest(input, init);
    } catch (err) {
      if (options.onError) options.onError(err);
      else console.error("gapura: observation failed");
      return baseFetch(input as RequestInfo, init);
    }

    let bodyText: string | null = null;
    let bodyBytes = 0;
    try {
      const body = await readRequestBodyForObservation(request);
      bodyText = body.bodyText;
      bodyBytes = body.bodyBytes;
    } catch (err) {
      if (options.onError) options.onError(err);
      else console.error("gapura: observation failed");
    }

    const observeInput = {
      url: request.url,
      method: request.method,
      headers: request.headers,
      bodyText,
      bodyBytes,
      label: options.label ?? options.config?.label,
      config: options.config,
    };

    let entry;
    try {
      ({ entry } = observeHttpRequest(observeInput));
    } catch (err) {
      if (options.onError) options.onError(err);
      else console.error("gapura: observation failed");
      try {
        ({ entry } = observeHttpRequest({
          ...observeInput,
          bodyText: null,
          bodyBytes: 0,
        }));
        entry.status = "unchecked";
        entry.coverage = "partial";
        entry.reasons = [...(entry.reasons ?? []), "detector-error"];
      } catch {
        return baseFetch(request);
      }
    }

    try {
      const response = await baseFetch(request);
      entry.outcome = response.status >= 400 ? "http_error" : "ok";
      entry.http_status = response.status;
      try {
        appendLogEntry(entry, logOpts);
      } catch (logErr) {
        if (options.onError) options.onError(logErr);
        else console.error("gapura: log write failed");
      }
      return response;
    } catch (err) {
      entry.outcome = isAbortError(err) ? "aborted" : "network_error";
      try {
        appendLogEntry(entry, logOpts);
      } catch (logErr) {
        if (options.onError) options.onError(logErr);
        else console.error("gapura: log write failed");
      }
      throw err;
    }
  };
}
