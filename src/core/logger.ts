import {
  appendFileSync,
  chmodSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import type { LogEntry } from "./types.js";
import {
  sanitizeSerializedLine,
  serializeLogEntry,
  validateLogEntry,
  type ValidateOptions,
} from "./schema.js";

export interface LoggerOptions extends ValidateOptions {
  logDir: string;
}

export function ensureLogDir(logDir: string): void {
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true, mode: 0o700 });
  }
}

export function appendLogEntry(entry: LogEntry, options: LoggerOptions): void {
  ensureLogDir(options.logDir);
  const cleaned = validateLogEntry(entry, {
    strictSchema: options.strictSchema ?? true,
    onUnknownKey: options.onUnknownKey ?? "drop",
  });
  const day = cleaned.ts.slice(0, 10);
  const file = `${options.logDir}/gapura-${day}.jsonl`;
  if (!existsSync(file)) {
    appendFileSync(file, "", { encoding: "utf8", mode: 0o600 });
    try {
      chmodSync(file, 0o600);
    } catch {
      /* Windows belum diuji */
    }
  }
  let line = serializeLogEntry(cleaned).trimEnd();
  line = sanitizeSerializedLine(line);
  appendFileSync(file, line, { encoding: "utf8" });
  try {
    chmodSync(file, 0o600);
  } catch {
    /* Windows belum diuji */
  }
}

export function defaultLogDir(cwd = process.cwd()): string {
  return `${cwd}/.gapura/logs`;
}

export interface ReadLogResult {
  entries: LogEntry[];
  corrupt_lines: number;
}

export function readAllLogLines(logDir: string): LogEntry[] {
  return readAllLogLinesWithStats(logDir).entries;
}

export function readAllLogLinesWithStats(logDir: string): ReadLogResult {
  if (!existsSync(logDir)) return { entries: [], corrupt_lines: 0 };
  const files = readdirSync(logDir).filter((f) => f.endsWith(".jsonl"));
  const entries: LogEntry[] = [];
  let corrupt_lines = 0;
  for (const file of files.sort()) {
    const content = readFileSync(`${logDir}/${file}`, "utf8");
    for (const line of content.split("\n")) {
      if (!line.trim()) continue;
      try {
        entries.push(JSON.parse(line) as LogEntry);
      } catch {
        corrupt_lines += 1;
      }
    }
  }
  return { entries, corrupt_lines };
}
