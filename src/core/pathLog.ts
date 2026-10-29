import { countPiiInTextPair } from "./detect.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SEGMENT_OK = /^[A-Za-z0-9._:-]{1,40}$/;

function segmentLooksSensitive(segment: string): boolean {
  if (!SEGMENT_OK.test(segment)) return true;
  if (/\d{6,}/.test(segment)) return true;
  if (UUID_RE.test(segment)) return true;
  if (segment.length >= 20 && /[A-Za-z]/.test(segment) && /\d/.test(segment)) {
    return true;
  }
  const pii = countPiiInTextPair(segment);
  return Object.keys(pii).length > 0;
}

/** Sanitasi path untuk log — tanpa query, maks 128 karakter. */
export function sanitizePathForLog(pathname: string): string {
  const parts = pathname.split("/");
  const out: string[] = [];
  for (const part of parts) {
    if (part === "") {
      out.push("");
      continue;
    }
    let seg = part;
    try {
      seg = decodeURIComponent(part);
    } catch {
      out.push(":id");
      continue;
    }
    out.push(segmentLooksSensitive(seg) ? ":id" : seg);
  }
  let joined = out.join("/") || "/";
  if (!joined.startsWith("/")) joined = `/${joined}`;
  if (joined.length > 128) joined = `${joined.slice(0, 127)}…`;
  return joined;
}
