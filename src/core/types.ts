import type { Coverage, CoverageReason } from "./reasons.js";

export type CallStatus = "raw" | "masked" | "mixed" | "clean" | "unchecked";

export type PiiCounts = Partial<Record<string, number>>;
export type TokenCounts = Partial<Record<string, number>>;

export interface RegionRef {
  provider_id: string;
  processing_region: string;
  verification: string;
  docs_url: string | null;
  verified_at: string | null;
}

export interface LogEntryV1 {
  v: 1;
  id: string;
  ts: string;
  provider: string;
  host: string;
  path: string;
  model?: string;
  status: CallStatus;
  pii: PiiCounts;
  tokens: TokenCounts;
  bytes: number;
  coverage: Coverage;
  reasons?: CoverageReason[];
  label?: string;
  region_ref: RegionRef;
}

export const LOG_SCHEMA_KEYS = [
  "v",
  "id",
  "ts",
  "provider",
  "host",
  "path",
  "model",
  "status",
  "pii",
  "tokens",
  "bytes",
  "coverage",
  "reasons",
  "label",
  "region_ref",
] as const;

export type LogSchemaKey = (typeof LOG_SCHEMA_KEYS)[number];

export type LogOutcome =
  | "ok"
  | "http_error"
  | "network_error"
  | "aborted";

export interface LogEntryV2 extends Omit<LogEntryV1, "v"> {
  v: 2;
  outcome?: LogOutcome;
  http_status?: number;
}

export type LogEntry = LogEntryV1 | LogEntryV2;

export const LOG_SCHEMA_KEYS_V2 = [
  ...LOG_SCHEMA_KEYS,
  "outcome",
  "http_status",
] as const;

export interface GapuraConfig {
  log_dir?: string;
  label?: string;
  pasal161_manual?: {
    instrumen_hukum?: string;
    efektivitas_instrumen?: string;
    langkah_prosedural?: string;
  };
  next_review_date?: string;
  provider_overrides?: Record<
    string,
    { processing_region?: string; verified_at?: string; source_note?: string }
  >;
}

export const DEFAULT_MAX_BODY_BYTES = 5 * 1024 * 1024;
