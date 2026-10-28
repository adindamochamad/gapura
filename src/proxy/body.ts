import type { IncomingMessage } from "node:http";
import { DEFAULT_MAX_BODY_BYTES } from "../core/types.js";

export interface BufferedBody {
  bodyBytes: number;
  bodyText: string | null;
  forwardBody: Buffer;
}

function parseContentLength(
  headers: IncomingMessage["headers"],
): number | null {
  const raw = headers["content-length"];
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === undefined || v === "") return null;
  const n = Number.parseInt(String(v), 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export async function bufferIncomingMessageBody(
  req: IncomingMessage,
  maxInspectBytes = DEFAULT_MAX_BODY_BYTES,
): Promise<BufferedBody> {
  const cl = parseContentLength(req.headers);
  if (cl !== null && cl > maxInspectBytes) {
    const forwardBody = await readAllChunks(req);
    return { bodyBytes: cl, bodyText: null, forwardBody };
  }

  const forwardBody = await readAllChunks(req);
  const bodyBytes = forwardBody.byteLength;
  if (bodyBytes > maxInspectBytes) {
    return { bodyBytes, bodyText: null, forwardBody };
  }
  const bodyText =
    bodyBytes === 0 ? "" : forwardBody.toString("utf8");
  return { bodyBytes, bodyText, forwardBody };
}

function readAllChunks(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
