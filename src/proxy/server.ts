import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import type { GapuraConfig } from "../core/types.js";
import { observeHttpRequest } from "../core/observe.js";
import { appendLogEntry, type LoggerOptions } from "../core/logger.js";
import { bufferIncomingMessageBody } from "./body.js";

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
  onError?: (err: unknown) => void;
}

export interface ProxyServerHandle {
  port: number;
  baseUrl: string;
  close: () => Promise<void>;
}

function buildTargetUrl(
  targetOrigin: string,
  req: IncomingMessage,
): string {
  const base = new URL(targetOrigin);
  const path = req.url ?? "/";
  return new URL(path, base).toString();
}

function forwardRequestHeaders(
  req: IncomingMessage,
  targetUrl: URL,
): Headers {
  const out = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower)) continue;
    if (Array.isArray(value)) {
      for (const v of value) out.append(key, v);
    } else {
      out.set(key, value);
    }
  }
  out.set("host", targetUrl.host);
  return out;
}

export function startGapuraProxy(
  options: ProxyServerOptions,
): Promise<ProxyServerHandle> {
  const targetOrigin = options.targetOrigin.replace(/\/$/, "");
  const logOpts: LoggerOptions = {
    logDir: options.logDir,
    strictSchema: options.strictSchema,
  };

  return new Promise((resolve, reject) => {
    const server: Server = createServer(
      async (req: IncomingMessage, res: ServerResponse) => {
        const targetUrl = new URL(buildTargetUrl(targetOrigin, req));
        let forwardBody: Buffer = Buffer.alloc(0);
        try {
          const buffered = await bufferIncomingMessageBody(req);
          forwardBody = buffered.forwardBody;
          const headerPairs: [string, string][] = [];
          for (const [k, v] of Object.entries(req.headers)) {
            if (v === undefined) continue;
            if (Array.isArray(v)) {
              for (const x of v) headerPairs.push([k, x]);
            } else {
              headerPairs.push([k, v]);
            }
          }
          const { entry } = observeHttpRequest({
            url: targetUrl.toString(),
            method: req.method ?? "GET",
            headers: new Headers(headerPairs),
            bodyText: buffered.bodyText,
            bodyBytes: buffered.bodyBytes,
            label: options.label ?? options.config?.label,
            config: options.config,
          });
          appendLogEntry(entry, logOpts);
        } catch (err) {
          if (options.onError) options.onError(err);
          else console.error("gapura: observation failed");
        }

        try {
          const method = req.method ?? "GET";
          const headers = forwardRequestHeaders(req, targetUrl);
          const hasBody =
            method !== "GET" &&
            method !== "HEAD" &&
            forwardBody.byteLength > 0;
          const upstream = await fetch(targetUrl.toString(), {
            method,
            headers,
            body: hasBody ? forwardBody : undefined,
          });

          res.statusCode = upstream.status;
          upstream.headers.forEach((value, key) => {
            if (HOP_BY_HOP.has(key.toLowerCase())) return;
            res.setHeader(key, value);
          });

          if (!upstream.body) {
            res.end();
            return;
          }

          const reader = upstream.body.getReader();
          try {
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value?.byteLength) res.write(Buffer.from(value));
            }
          } finally {
            res.end();
          }
        } catch (err) {
          if (!res.headersSent) {
            res.statusCode = 502;
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.end("gapura proxy: upstream error");
          } else {
            res.end();
          }
          if (options.onError) options.onError(err);
        }
      },
    );

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
