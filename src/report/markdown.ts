import {
  LEGAL_DISCLAIMER,
  PASAL161_SECTIONS,
  PASAL162_H_NOTE,
  PP_SOURCE_NOTE,
} from "./pasal161.js";
import { buildReportSummary, providerName, type ReportSummary } from "./build.js";
import type { GapuraConfig, LogEntry } from "../core/types.js";

function statusNote(entry: import("../core/types.js").LogEntry): string {
  if (entry.status === "clean") {
    return "tidak terdeteksi, bukan jaminan";
  }
  if (entry.status === "unchecked" && entry.reasons?.length) {
    return `unchecked: ${entry.reasons.join(", ")}`;
  }
  return entry.status;
}

function formatCounts(
  counts: Partial<Record<string, number>>,
  partial: boolean,
): string {
  const parts = Object.entries(counts)
    .filter(([, v]) => (v ?? 0) > 0)
    .map(([k, v]) => `${k}${partial ? "≥" : ""}:${v}`);
  return parts.length ? parts.join(", ") : "—";
}

export function renderMarkdown(
  entries: LogEntry[],
  config: GapuraConfig = {},
  corrupt_lines = 0,
): string {
  const s = buildReportSummary(entries, config, corrupt_lines);
  const lines: string[] = [];

  lines.push("# Catatan panggilan LLM");
  lines.push("");
  lines.push("**Catatan bantu, bukan bukti kepatuhan.**");
  lines.push("");
  lines.push(
    "Panggilan ke host lokal atau jaringan privat bukan transfer lintas batas dari sisi Gapura.",
  );
  lines.push("");
  lines.push(`**${LEGAL_DISCLAIMER}**`);
  lines.push("");
  lines.push(`Dibuat: ${s.generated_at}`);
  if (s.period) {
    lines.push(`Periode log: ${s.period.from} — ${s.period.to}`);
  }
  lines.push(`Jumlah permintaan: ${s.entry_count}`);
  if (s.corrupt_lines) {
    lines.push(`${s.corrupt_lines} baris log rusak dilewati`);
  }
  lines.push("");
  lines.push(PP_SOURCE_NOTE);
  lines.push("");

  lines.push("## Ringkasan status");
  lines.push("");
  lines.push("| Status | Jumlah |");
  lines.push("| --- | ---: |");
  for (const [st, n] of Object.entries(s.by_status).sort()) {
    lines.push(`| ${st} | ${n} |`);
  }
  lines.push("");

  lines.push("## Pasal 161 PP 33/2026");
  lines.push("");
  for (const sec of PASAL161_SECTIONS) {
    lines.push(`### (${sec.id}) ${sec.title}`);
    lines.push("");
    lines.push(`> ${sec.quote}`);
    lines.push("");
    lines.push(`- **Label:** ${sec.label}`);
    lines.push(`- ${sec.gapura_fills}`);
    if (sec.id === "c" && config.pasal161_manual?.instrumen_hukum) {
      lines.push(`- Config: ${config.pasal161_manual.instrumen_hukum}`);
    }
    if (sec.id === "d" && config.pasal161_manual?.efektivitas_instrumen) {
      lines.push(`- Config: ${config.pasal161_manual.efektivitas_instrumen}`);
    }
    if (sec.id === "f" && config.pasal161_manual?.langkah_prosedural) {
      lines.push(`- Config: ${config.pasal161_manual.langkah_prosedural}`);
    }
    if (sec.id === "g" && config.next_review_date) {
      lines.push(`- Revisi berikutnya ${config.next_review_date}`);
    }
    lines.push("");
  }

  lines.push("## Pasal 162 (2) h");
  lines.push("");
  lines.push(PASAL162_H_NOTE);
  lines.push("");

  lines.push("## Permintaan");
  lines.push("");
  lines.push("| Waktu (UTC) | Penyedia | Host | Path | Status | PII | Token | Wilayah |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const e of s.entries) {
    const region = e.region_ref.processing_region;
    const ver = e.region_ref.verification;
    const partial = e.coverage === "partial";
    lines.push(
      `| ${e.ts} | ${providerName(e.provider)} | ${e.host} | ${e.path} | ${e.status} (${statusNote(e)}) | ${formatCounts(e.pii, partial)} | ${formatCounts(e.tokens, partial)} | ${region} — ${ver} |`,
    );
  }
  lines.push("");

  lines.push("## Luar lingkup laporan");
  lines.push("");
  for (const item of s.not_covered) {
    lines.push(`- ${item}`);
  }
  lines.push("");

  lines.push(
    "Wilayah di dokumen penyedia tidak menjawab sub-prosesor, akses support dari luar negeri, atau lokasi proses yang sebenarnya.",
  );

  return lines.join("\n");
}

export { buildReportSummary, type ReportSummary };
