import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readAllLogLinesWithStats, defaultLogDir } from "../core/logger.js";
import { loadGapuraConfig } from "../core/config.js";
import { renderHtml } from "../report/html.js";
import { renderMarkdown } from "../report/markdown.js";

export interface ReportCliOptions {
  logDir?: string;
  outDir: string;
  format: "md" | "html" | "both";
  cwd?: string;
}

export function runReport(options: ReportCliOptions): void {
  const cwd = options.cwd ?? process.cwd();
  const logDir = options.logDir ?? defaultLogDir(cwd);
  const config = loadGapuraConfig(cwd);
  const { entries, corrupt_lines } = readAllLogLinesWithStats(logDir);
  mkdirSync(options.outDir, { recursive: true });

  if (options.format === "md" || options.format === "both") {
    writeFileSync(
      join(options.outDir, "laporan.md"),
      renderMarkdown(entries, config, corrupt_lines),
      "utf8",
    );
  }
  if (options.format === "html" || options.format === "both") {
    writeFileSync(
      join(options.outDir, "laporan.html"),
      renderHtml(entries, config, corrupt_lines),
      "utf8",
    );
  }
  console.log(`Dari ${logDir}: ${entries.length} entri → ${options.outDir}`);
  if (corrupt_lines > 0) {
    console.log(`${corrupt_lines} baris log rusak dilewati`);
  }
}
