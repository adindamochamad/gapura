import type { CoverageReason } from "../core/reasons.js";
import type { IncomingMessage } from "node:http";
import { PassThrough } from "node:stream";
import { once } from "node:events";
import {
  DEFAULT_MAX_BODY_BYTES,
  DEFAULT_MAX_REQUEST_BYTES,
} from "../core/types.js";

export function parseClientRequestPath(
  raw: string | undefined,
): { pathname: string; search: string } | null {
  if (raw === undefined || raw === "") return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  if (/^https?:\/\//i.test(raw)) return null;
  if (raw.includes("\\")) return null;
  try {
    const u = new URL(raw, "http://127.0.0.1");
    return { pathname: u.pathname, search: u.search };
  } catch {
    return null;
  }
}

export interface BodyBridgeResult {
  bodyBytes: number;
  bodyText: string | null;
  extraReasons: CoverageReason[];
  requestRejected: boolean;
}

export interface BodyBridge {
  forward: PassThrough;
  finished: Promise<BodyBridgeResult>;
}

export function createRequestBodyBridge(
  req: IncomingMessage,
  maxInspectBytes = DEFAULT_MAX_BODY_BYTES,
  maxRequestBytes = DEFAULT_MAX_REQUEST_BYTES,
): BodyBridge {
  const forward = new PassThrough();
  const inspect: Buffer[] = [];
  let bodyBytes = 0;
  let inspectBytes = 0;
  let requestRejected = false;
  const extraReasons: CoverageReason[] = [];

  if (req.headers["content-encoding"]) {
    extraReasons.push("compressed");
  }

  const buildResult = (): BodyBridgeResult => {
    const bodyText =
      bodyBytes === 0
        ? ""
        : extraReasons.includes("too-large") ||
            extraReasons.includes("compressed")
          ? null
          : Buffer.concat(inspect).toString("utf8");
    return { bodyBytes, bodyText, extraReasons, requestRejected };
  };

  let resolveFinished!: (r: BodyBridgeResult) => void;
  const finished = new Promise<BodyBridgeResult>((resolve) => {
    resolveFinished = resolve;
  });

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    resolveFinished(buildResult());
  };

  req.on("data", (chunk: Buffer) => {
    bodyBytes += chunk.length;
        if (bodyBytes > maxRequestBytes) {
      if (!requestRejected) {
        requestRejected = true;
        if (!extraReasons.includes("too-large")) {
          extraReasons.push("too-large");
        }
        forward.destroy();
        finish();
      }
      return;
    }
    if (inspectBytes < maxInspectBytes) {
      const take = Math.min(chunk.length, maxInspectBytes - inspectBytes);
      inspect.push(chunk.subarray(0, take));
      inspectBytes += take;
    } else if (!extraReasons.includes("too-large")) {
      extraReasons.push("too-large");
    }
    forward.write(chunk);
  });
  req.on("end", () => {
    forward.end();
    if (!requestRejected) finish();
  });
  req.on("error", (err) => {
    forward.destroy(err);
    if (!requestRejected) finish();
  });
  req.on("close", () => {
    if (!done && requestRejected) finish();
  });

  return { forward, finished };
}
