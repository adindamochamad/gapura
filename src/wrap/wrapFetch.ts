import type { GapuraConfig } from "../core/types.js";
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

export function wrapFetch(baseFetch: typeof fetch, options: WrapFetchOptions) {
  const logOpts: LoggerOptions = {
    logDir: options.logDir,
    strictSchema: options.strictSchema,
  };

  return async function gapuraFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const request = buildRequest(input, init);
    try {
      const { bodyText, bodyBytes } = await readRequestBodyForObservation(
        request,
      );
      const { entry } = observeHttpRequest({
        url: request.url,
        method: request.method,
        headers: request.headers,
        bodyText,
        bodyBytes,
        label: options.label ?? options.config?.label,
        config: options.config,
      });
      appendLogEntry(entry, logOpts);
    } catch (err) {
      if (options.onError) options.onError(err);
      else console.error("gapura: observation failed");
    }
    return baseFetch(request);
  };
}
