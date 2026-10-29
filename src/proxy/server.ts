import {
  createServer,
  request as httpRequest,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import { request as httpsRequest } from "node:https";
import { pipeline } from "node:stream/promises";
import type { GapuraConfig, LogOutcome } from "../core/types.js";
import { DEFAULT_MAX_REQUEST_BYTES } from "../core/types.js";
import { observeHttpRequest } from "../core/observe.js";
import { appendLogEntry, type LoggerOptions } from "../core/logger.js";
import { createRequestBodyBridge, parseClientRequestPath } from "./body.js";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

export interface ProxyServerOptions {
  listenHost: string;
  listenPort: number;
  targetOrigin: string;
  logDir: string;
  config?: GapuraConfig;
  label?: string;
  strictSchema?: boolean;
  timeoutMs?: number;
  maxRequestBytes?: number;
  onError?: (err: unknown) => void;
}

export interface ProxyServerHandle {
  port: number;
  baseUrl: string;
  close: () => Promise<void>;
}

function sendText(res: ServerResponse, code: number, msg: string): void {
  if (res.headersSent) return;
  res.statusCode = code;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(msg);
}

function allowedHostHeader(
  hostHeader: string | undefined,
  listenHost: string,
  listenPort: number,
): boolean {
  if (!hostHeader) return true;
  const allowed = new Set([
    `${listenHost}:${listenPort}`,
    `127.0.0.1:${listenPort}`,
    `localhost:${listenPort}`,
    `[::1]:${listenPort}`,
  ]);
  return allowed.has(hostHeader.toLowerCase());
}

function buildUpstreamUrl(
  target: URL,
  pathname: string,
  search: string,
): string {
  return `${target.origin}${pathname}${search}`;
}

function parseContentLengthHeader(
  headers: IncomingMessage["headers"],
): number | null {
  const raw = headers["content-length"];
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (s === undefined || s === "") return null;
  const n = Number.parseInt(s, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function startGapuraProxy(
  options: ProxyServerOptions,
): Promise<ProxyServerHandle> {
  const target = new URL(options.targetOrigin.replace(/\/$/, "") + "/");
  const logOpts: LoggerOptions = {
    logDir: options.logDir,
    strictSchema: options.strictSchema,
  };
  const timeoutMs = options.timeoutMs ?? 60_000;
  const maxRequestBytes =
    options.maxRequestBytes ?? DEFAULT_MAX_REQUEST_BYTES;

  return new Promise((resolve, reject) => {
    const server: Server = createServer(async (req, res) => {
      try {
        if (req.method === "CONNECT") {
          sendText(res, 501, "CONNECT not supported");
          return;
        }
        const rawUrl = req.url ?? "/";
        if (rawUrl.length > 8192) {
          sendText(res, 414, "URI Too Long");
          return;
        }
        if (req.headers.origin) {
          sendText(res, 403, "Forbidden");
          return;
        }
        const listenPort =
          typeof server.address() === "object" && server.address()
            ? (server.address() as { port: number }).port
            : options.listenPort;
        if (
          !allowedHostHeader(
            req.headers.host,
            options.listenHost,
            listenPort,
          )
        ) {
          sendText(res, 400, "Bad Request");
          return;
        }

        const parsed = parseClientRequestPath(rawUrl);
        if (!parsed) {
          sendText(res, 400, "Bad Request");
          return;
        }

        const upstreamUrl = new URL(
          buildUpstreamUrl(target, parsed.pathname, parsed.search),
        );
        if (upstreamUrl.origin !== target.origin) {
          sendText(res, 400, "Bad Request");
          return;
        }

        const method = req.method ?? "GET";
        const contentLength = parseContentLengthHeader(req.headers);
        if (
          contentLength !== null &&
          contentLength > maxRequestBytes
        ) {
          try {
            const headerPairs: [string, string][] = [];
            for (const [k, v] of Object.entries(req.headers)) {
              if (v === undefined) continue;
              if (Array.isArray(v)) for (const x of v) headerPairs.push([k, x]);
              else headerPairs.push([k, v]);
            }
            const { entry } = observeHttpRequest({
              url: upstreamUrl.toString(),
              method,
              headers: new Headers(headerPairs),
              bodyText: null,
              bodyBytes: contentLength,
              label: options.label ?? options.config?.label,
              config: options.config,
              extraReasons: ["too-large"],
            });
            entry.outcome = "http_error";
            entry.http_status = 413;
            appendLogEntry(entry, logOpts);
          } catch (err) {
            if (options.onError) options.onError(err);
          }
          sendText(res, 413, "Payload Too Large");
          req.resume();
          return;
        }

        const bridge =
          method === "GET" || method === "HEAD"
            ? null
            : createRequestBodyBridge(req, undefined, maxRequestBytes);

        const headers: Record<string, string | string[]> = {};
        for (const [key, value] of Object.entries(req.headers)) {
          if (value === undefined) continue;
          const lower = key.toLowerCase();
          if (HOP_BY_HOP.has(lower)) continue;
          headers[key] = value;
        }
        headers.host = upstreamUrl.host;

        const transport = upstreamUrl.protocol === "https:" ? httpsRequest : httpRequest;
        const upstreamReq = transport(upstreamUrl, {
          method,
          headers,
          timeout: timeoutMs,
        });

        let outcome: LogOutcome = "network_error";
        let http_status: number | undefined;
        let logged = false;

        const logResult = async () => {
          if (logged) return;
          logged = true;
          try {
            const bodyInfo = bridge
              ? await bridge.finished
              : { bodyBytes: 0, bodyText: "", extraReasons: [] as const };
            const headerPairs: [string, string][] = [];
            for (const [k, v] of Object.entries(req.headers)) {
              if (v === undefined) continue;
              if (Array.isArray(v)) for (const x of v) headerPairs.push([k, x]);
              else headerPairs.push([k, v]);
            }
            const { entry } = observeHttpRequest({
              url: upstreamUrl.toString(),
              method,
              headers: new Headers(headerPairs),
              bodyText: bodyInfo.bodyText,
              bodyBytes: bodyInfo.bodyBytes,
              label: options.label ?? options.config?.label,
              config: options.config,
              extraReasons: [...bodyInfo.extraReasons],
            });
            entry.outcome = outcome;
            if (http_status !== undefined) entry.http_status = http_status;
            appendLogEntry(entry, logOpts);
          } catch (err) {
            if (options.onError) options.onError(err);
            else console.error("gapura: observation failed");
          }
        };

        res.on("close", () => {
          if (!res.writableFinished) {
            outcome = "aborted";
            upstreamReq.destroy();
            void logResult();
          }
        });

        upstreamReq.on("response", (upstreamRes) => {
          http_status = upstreamRes.statusCode ?? 502;
          outcome =
            http_status >= 400 ? "http_error" : http_status >= 300 ? "ok" : "ok";
          if (http_status >= 400) outcome = "http_error";
          else outcome = "ok";

          res.statusCode = http_status;
          for (const [key, value] of Object.entries(upstreamRes.headers)) {
            if (value === undefined) continue;
            const lower = key.toLowerCase();
            if (HOP_BY_HOP.has(lower)) continue;
            if (Array.isArray(value)) res.setHeader(key, value);
            else res.setHeader(key, value);
          }

          void (async () => {
            try {
              await pipeline(upstreamRes, res);
              await logResult();
            } catch (err) {
              if (options.onError) options.onError(err);
              if (!res.headersSent) sendText(res, 502, "Bad Gateway");
            }
          })();
        });

        upstreamReq.on("timeout", () => {
          upstreamReq.destroy();
          outcome = "timeout";
          http_status = 504;
          void logResult();
          sendText(res, 504, "Gateway Timeout");
        });

        upstreamReq.on("error", () => {
          if (logged) return;
          outcome = "network_error";
          void logResult();
          sendText(res, 502, "Bad Gateway");
        });

        if (bridge) {
          void bridge.finished.then((bodyInfo) => {
            if (bodyInfo.requestRejected) {
              upstreamReq.destroy();
              outcome = "http_error";
              http_status = 413;
              sendText(res, 413, "Payload Too Large");
              void logResult();
            }
          });
          bridge.forward.pipe(upstreamReq);
        } else {
          upstreamReq.end();
        }
      } catch {
        sendText(res, 400, "Bad Request");
      }
    });

    server.listen(options.listenPort, options.listenHost, () => {
      const addr = server.address();
      const port =
        typeof addr === "object" && addr ? addr.port : options.listenPort;
      resolve({
        port,
        baseUrl: `http://${options.listenHost}:${port}`,
        close: () =>
          new Promise((r, j) => server.close((e) => (e ? j(e) : r()))),
      });
    });
    server.on("error", reject);
  });
}
