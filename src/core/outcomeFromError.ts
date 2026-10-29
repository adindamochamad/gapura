import type { LogOutcome } from "./types.js";

function hasCode(err: unknown, code: string): boolean {
  if (err === null || typeof err !== "object") return false;
  const e = err as { code?: string; cause?: unknown };
  if (e.code === code) return true;
  if (e.cause !== undefined) return hasCode(e.cause, code);
  return false;
}

/** Map fetch/network errors to log outcome (after abort is ruled out). */
export function outcomeFromFetchError(err: unknown): LogOutcome {
  if (err instanceof DOMException && err.name === "TimeoutError") {
    return "timeout";
  }
  if (hasCode(err, "ETIMEDOUT") || hasCode(err, "UND_ERR_CONNECT_TIMEOUT")) {
    return "timeout";
  }
  return "network_error";
}

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}
