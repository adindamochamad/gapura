import {
  appendFileSync,
  chmodSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import { dirname } from "node:path";
import type { LogEntryV1 } from "./types.js";
import { serializeLogEntry, validateLogEntry } from "./schema.js";

export interface LoggerOptions {
  logDir: string;
  strictSchema?: boolean;
}

export function ensureLogDir(logDir: string): void {
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true, mode: 0o700 });
  }
}

export function appendLogEntry(entry: LogEntryV1, options: LoggerOptions): void {
  ensureLogDir(options.logDir);
  validateLogEntry(entry, options.strictSchema ?? false);
  const day = entry.ts.slice(0, 10);
  const file = `${options.logDir}/gapura-${day}.jsonl`;
  if (!existsSync(file)) {
    appendFileSync(file, "", { encoding: "utf8", mode: 0o600 });
    try {
      chmodSync(file, 0o600);
    } catch {
      /* Windows belum diuji */
    }
  }
  appendFileSync(file, serializeLogEntry(entry), { encoding: "utf8" });
  try {
    chmodSync(file, 0o600);
  } catch {
    /* Windows belum diuji */
  }
}

export function defaultLogDir(cwd = process.cwd()): string {
  return `${cwd}/.gapura/logs`;
}

export function readAllLogLines(logDir: string): LogEntryV1[] {
  if (!existsSync(logDir)) return [];
  const files = readdirSync(logDir).filter((f) => f.endsWith(".jsonl"));
  const entries: LogEntryV1[] = [];
  for (const file of files.sort()) {
    const content = readFileSync(`${logDir}/${file}`, "utf8");
    for (const line of content.split("\n")) {
      if (!line.trim()) continue;
      entries.push(JSON.parse(line) as LogEntryV1);
    }
  }
  return entries;
}
