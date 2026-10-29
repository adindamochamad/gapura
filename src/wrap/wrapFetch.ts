import type { GapuraConfig } from "../core/types.js";
import { observeHttpRequest } from "../core/observe.js";
import { appendLogEntry, type LoggerOptions } from "../core/logger.js";
import {
  isAbortError,
  outcomeFromFetchError,
} from "../core/outcomeFromError.js";
import { bodyForObservation, shouldLogHost } from "./bodyForObserve.js";

export interface WrapFetchOptions {
  fetch?: typeof fetch;
  logDir: string;
  label?: string;
  config?: GapuraConfig;
  strictSchema?: boolean;
  onUnknownKey?: "drop" | "throw";
  maxBodyBytes?: number;
  hosts?: string[];
  excludeHosts?: string[];
  onError?: (err: unknown) => void;
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
    const fetchPromise = baseFetch(input, init);

    let entry;
    try {
      const body = bodyForObservation(input, init, options.maxBodyBytes);
      const host = new URL(body.url).hostname;
      if (!shouldLogHost(host, options)) {
        return fetchPromise;
      }
      ({ entry } = observeHttpRequest({
        url: body.url,
        method: body.method,
        headers: body.headers,
        bodyText: body.bodyText,
        bodyBytes: body.bodyBytes,
        label: options.label ?? options.config?.label,
        config: options.config,
        maxBodyBytes: options.maxBodyBytes,
        extraReasons: body.extraReasons,
      }));
    } catch (err) {
      if (options.onError) options.onError(err);
      else console.error("gapura: observation failed");
      return fetchPromise;
    }

    try {
      const response = await fetchPromise;
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
      entry.outcome = isAbortError(err)
        ? "aborted"
        : outcomeFromFetchError(err);
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
