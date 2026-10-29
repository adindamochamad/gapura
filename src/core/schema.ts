import type { LogEntry, LogEntryV1, LogEntryV2 } from "./types.js";
import { LOG_SCHEMA_KEYS, LOG_SCHEMA_KEYS_V2 } from "./types.js";
import { COVERAGE_REASONS } from "./reasons.js";
import { PII_TYPES } from "@adindamochamad/tirai";
import { countPiiInTextPair } from "./detect.js";
import { normalizeForScan } from "./normalize.js";

const KEY_SET = new Set<string>(LOG_SCHEMA_KEYS_V2);
const STATUS_SET = new Set([
  "raw",
  "masked",
  "mixed",
  "clean",
  "unchecked",
]);
const COVERAGE_SET = new Set(["full", "partial"]);
const REASON_SET = new Set<string>(COVERAGE_REASONS);
const PII_SET = new Set<string>(PII_TYPES);
const OUTCOME_SET = new Set([
  "ok",
  "http_error",
  "network_error",
  "timeout",
  "aborted",
]);

export class SchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchemaError";
  }
}

export interface ValidateOptions {
  strictSchema?: boolean;
  onUnknownKey?: "drop" | "throw";
}

function scanStringForPii(s: string): boolean {
  return Object.keys(countPiiInTextPair(s)).length > 0;
}

function validateCounts(obj: unknown, label: string): void {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    throw new SchemaError(`${label} must be object`);
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (!PII_SET.has(k)) throw new SchemaError(`${label} key not allowed: ${k}`);
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0) {
      throw new SchemaError(`${label}.${k} must be int >= 0`);
    }
  }
}

function validateEntryValues(entry: LogEntry): void {
  if (entry.v !== 1 && entry.v !== 2) throw new SchemaError("v must be 1 or 2");
  if (typeof entry.id !== "string" || !entry.id) throw new SchemaError("id");
  if (typeof entry.ts !== "string") throw new SchemaError("ts");
  if (typeof entry.provider !== "string") throw new SchemaError("provider");
  if (typeof entry.host !== "string" || !/^[a-z0-9.-]+$/i.test(entry.host)) {
    throw new SchemaError("host");
  }
  if (typeof entry.path !== "string" || entry.path.includes("?")) {
    throw new SchemaError("path");
  }
  if (!STATUS_SET.has(entry.status)) throw new SchemaError("status");
  if (!COVERAGE_SET.has(entry.coverage)) throw new SchemaError("coverage");
  validateCounts(entry.pii, "pii");
  validateCounts(entry.tokens, "tokens");
  if (typeof entry.bytes !== "number" || entry.bytes < 0) {
    throw new SchemaError("bytes");
  }
  if (entry.reasons) {
    if (!Array.isArray(entry.reasons)) throw new SchemaError("reasons");
    for (const r of entry.reasons) {
      if (!REASON_SET.has(r)) throw new SchemaError(`reason: ${r}`);
    }
  }
  if (entry.v === 2) {
    const e2 = entry as LogEntryV2;
    if (e2.outcome !== undefined && !OUTCOME_SET.has(e2.outcome)) {
      throw new SchemaError("outcome");
    }
    if (
      e2.http_status !== undefined &&
      (typeof e2.http_status !== "number" || e2.http_status < 0)
    ) {
      throw new SchemaError("http_status");
    }
  }
  if (entry.model !== undefined) {
    if (typeof entry.model !== "string") throw new SchemaError("model");
    if (scanStringForPii(entry.model)) throw new SchemaError("model has pii");
  }
  if (entry.label !== undefined) {
    if (typeof entry.label !== "string" || entry.label.length > 64) {
      throw new SchemaError("label");
    }
    if (scanStringForPii(entry.label)) throw new SchemaError("label has pii");
  }
  if (entry.region_ref === null || typeof entry.region_ref !== "object") {
    throw new SchemaError("region_ref");
  }
}

export function dropUnknownKeys(
  entry: LogEntry,
  options: ValidateOptions,
): LogEntry {
  const strict = options.strictSchema ?? true;
  const mode = options.onUnknownKey ?? "drop";
  const raw = entry as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  const dropped: string[] = [];
  for (const key of Object.keys(raw)) {
    if (KEY_SET.has(key)) out[key] = raw[key];
    else {
      if (mode === "throw" && strict) {
        throw new SchemaError(`Log key not allowed: ${key}`);
      }
      dropped.push(key);
    }
  }
  if (dropped.length && mode === "drop") {
    for (const k of dropped) {
      console.error(`gapura: dropped log key: ${k}`);
    }
  }
  return out as unknown as LogEntry;
}

export function validateLogEntry(
  entry: LogEntry,
  options: ValidateOptions = {},
): LogEntry {
  const strict = options.strictSchema ?? true;
  const cleaned = dropUnknownKeys(entry, options);
  if (strict) validateEntryValues(cleaned);
  return cleaned;
}

function scrubPiiFromJson(obj: Record<string, unknown>): string[] {
  const droppedFields: string[] = [];
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === "string") {
      const pair = `${val}${normalizeForScan(val)}`;
      if (scanStringForPii(pair)) {
        delete obj[key];
        droppedFields.push(key);
      }
    } else if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      droppedFields.push(...scrubPiiFromJson(val as Record<string, unknown>));
    }
  }
  return droppedFields;
}

export function sanitizeSerializedLine(jsonLine: string): string {
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(jsonLine) as Record<string, unknown>;
  } catch {
    return `${jsonLine}\n`;
  }
  const droppedFields = scrubPiiFromJson(obj);
  for (const f of droppedFields) {
    console.error(`gapura: dropped log field after scan: ${f}`);
  }
  return `${JSON.stringify(obj)}\n`;
}

export function serializeLogEntry(entry: LogEntry): string {
  return `${JSON.stringify(entry)}\n`;
}

export type { LogSchemaKey } from "./types.js";
