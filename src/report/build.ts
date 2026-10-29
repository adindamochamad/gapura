import type { GapuraConfig, LogEntry } from "../core/types.js";
import { loadProviders } from "../core/providers.js";

export interface ReportSummary {
  generated_at: string;
  entry_count: number;
  period: { from: string; to: string } | null;
  by_status: Record<string, number>;
  by_provider: Record<string, number>;
  pii_totals: Record<string, number>;
  entries: LogEntry[];
  config: GapuraConfig;
  not_covered: string[];
  corrupt_lines?: number;
}

export function buildReportSummary(
  entries: LogEntry[],
  config: GapuraConfig = {},
  corrupt_lines = 0,
): ReportSummary {
  const by_status: Record<string, number> = {};
  const by_provider: Record<string, number> = {};
  const pii_totals: Record<string, number> = {};

  for (const e of entries) {
    by_status[e.status] = (by_status[e.status] ?? 0) + 1;
    by_provider[e.provider] = (by_provider[e.provider] ?? 0) + 1;
    for (const [k, v] of Object.entries(e.pii)) {
      pii_totals[k] = (pii_totals[k] ?? 0) + (v ?? 0);
    }
  }

  let period: ReportSummary["period"] = null;
  if (entries.length > 0) {
    const sorted = [...entries].sort((a, b) => a.ts.localeCompare(b.ts));
    period = { from: sorted[0]!.ts, to: sorted[sorted.length - 1]!.ts };
  }

  const not_covered = [
    "Sub-prosesor dan vendor di balik penyedia LLM",
    "Lokasi proses data di lapangan (bukan yang tertulis di dokumen)",
    "Akses tim dukungan dari luar negeri",
    "Teks prompt dan respons API",
    "Klaim sertifikasi PDP pihak ketiga",
  ];

  return {
    generated_at: new Date().toISOString(),
    entry_count: entries.length,
    period,
    by_status,
    by_provider,
    pii_totals,
    entries,
    config,
    not_covered,
    corrupt_lines: corrupt_lines > 0 ? corrupt_lines : undefined,
  };
}

export function providerName(id: string): string {
  const row = loadProviders().find((p) => p.id === id);
  return row?.name ?? id;
}
