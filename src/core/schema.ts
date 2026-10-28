import type { LogEntryV1, LogSchemaKey } from "./types.js";
import { LOG_SCHEMA_KEYS } from "./types.js";

const KEY_SET = new Set<string>(LOG_SCHEMA_KEYS);

export class SchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchemaError";
  }
}

export function assertAllowlistedKeys(
  obj: Record<string, unknown>,
  strict: boolean,
): void {
  for (const key of Object.keys(obj)) {
    if (!KEY_SET.has(key)) {
      const msg = `Log key not allowed: ${key}`;
      if (strict) throw new SchemaError(msg);
    }
  }
}

export function validateLogEntry(
  entry: LogEntryV1,
  strict = false,
): LogEntryV1 {
  assertAllowlistedKeys(entry as unknown as Record<string, unknown>, strict);
  if (entry.v !== 1) throw new SchemaError("v must be 1");
  return entry;
}

export function serializeLogEntry(entry: LogEntryV1): string {
  return `${JSON.stringify(entry)}\n`;
}
