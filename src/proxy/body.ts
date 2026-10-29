import type { CoverageReason } from "../core/reasons.js";
import type { IncomingMessage } from "node:http";
import { PassThrough } from "node:stream";
import { once } from "node:events";
import { DEFAULT_MAX_BODY_BYTES } from "../core/types.js";

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

export interface BodyBridge {
  forward: PassThrough;
  finished: Promise<{ bodyBytes: number; bodyText: string | null; extraReasons: CoverageReason[] }>;
}

export function createRequestBodyBridge(
  req: IncomingMessage,
  maxInspectBytes = DEFAULT_MAX_BODY_BYTES,
): BodyBridge {
  const forward = new PassThrough();
  const inspect: Buffer[] = [];
  let bodyBytes = 0;
  let inspectBytes = 0;
  const extraReasons: CoverageReason[] = [];

  if (req.headers["content-encoding"]) {
    extraReasons.push("compressed");
  }

  req.on("data", (chunk: Buffer) => {
    bodyBytes += chunk.length;
    if (inspectBytes < maxInspectBytes) {
      const take = Math.min(chunk.length, maxInspectBytes - inspectBytes);
      inspect.push(chunk.subarray(0, take));
      inspectBytes += take;
    } else if (!extraReasons.includes("too-large")) {
      extraReasons.push("too-large");
    }
    forward.write(chunk);
  });
  req.on("end", () => forward.end());
  req.on("error", (err) => forward.destroy(err));

  const finished = once(req, "end").then(() => {
    const bodyText =
      bodyBytes === 0
        ? ""
        : extraReasons.includes("too-large") ||
            extraReasons.includes("compressed")
          ? null
          : Buffer.concat(inspect).toString("utf8");
    return { bodyBytes, bodyText, extraReasons };
  });

  return { forward, finished };
}
