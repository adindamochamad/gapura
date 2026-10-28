import { renderMarkdown } from "./markdown.js";
import {
  LEGAL_DISCLAIMER,
  PASAL161_SECTIONS,
  PASAL162_H_NOTE,
  PP_SOURCE_NOTE,
} from "./pasal161.js";
import type { GapuraConfig, LogEntryV1 } from "../core/types.js";
import { buildReportSummary, providerName } from "./build.js";
import {
  CANDI_BENTAR_SVG,
  REPORT_CSS,
  statusIcon,
  statusPhrase,
} from "./theme.js";

function formatTs(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(d);
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function labelClass(label: string): string {
  return label === "isi manual" ? "tag manual" : "tag partial";
}

function manualFor(id: string, config: GapuraConfig): string | undefined {
  const m = config.pasal161_manual;
  if (id === "c") return m?.instrumen_hukum;
  if (id === "d") return m?.efektivitas_instrumen;
  if (id === "f") return m?.langkah_prosedural;
  if (id === "g") {
    return config.next_review_date
      ? `Revisi berikutnya ${config.next_review_date}`
      : undefined;
  }
  return undefined;
}

export function renderHtml(
  entries: LogEntryV1[],
  config: GapuraConfig = {},
): string {
  const s = buildReportSummary(entries, config);
  const mdFallback = renderMarkdown(entries, config);
  const statuses = ["raw", "masked", "mixed", "clean", "unchecked"] as const;

  const badgeClass: Record<(typeof statuses)[number], string> = {
    raw: "bad",
    masked: "ok",
    mixed: "mix",
    clean: "idle",
    unchecked: "warn",
  };

  const metrics = statuses
    .map((st) => {
      const n = s.by_status[st] ?? 0;
      return `<article class="metric ${st}">
        <p class="label">${statusIcon(st)} ${esc(st)}</p>
        <b>${n}</b>
        <p class="hint">${esc(statusPhrase(st))}</p>
      </article>`;
    })
    .join("");

  const calls = s.entries
    .map((e) => {
      const pii = Object.entries(e.pii)
        .map(([k, v]) => `${k}×${v}`)
        .join(", ");
      return `<tr>
        <td>
          <span class="badge ${badgeClass[e.status as keyof typeof badgeClass] ?? ""} pill status-${esc(e.status)}">
            <span class="dot"></span>${statusIcon(e.status)} ${esc(e.status)}
          </span>
        </td>
        <td>
          <p class="where">${esc(providerName(e.provider))}</p>
          <p class="muted">${esc(e.host)}${esc(e.path)}</p>
        </td>
        <td>
          <p class="muted">${esc(pii || "—")}</p>
          <p class="muted">${esc(e.region_ref.processing_region)}</p>
        </td>
        <td><time datetime="${esc(e.ts)}">${esc(formatTs(e.ts))}</time></td>
      </tr>`;
    })
    .join("\n");

  const pasalBlocks = PASAL161_SECTIONS.map((sec, i) => {
    const extra = manualFor(sec.id, config);
    return `
    <details class="pasal" ${i === 0 ? "open" : ""}>
      <summary>
        <span class="letter">(${esc(sec.id)})</span>
        <span>${esc(sec.title)}</span>
        <span class="${labelClass(sec.label)}">${esc(sec.label)}</span>
      </summary>
      <div class="body">
        <blockquote>${esc(sec.quote)}</blockquote>
        <p>${esc(sec.gapura_fills)}</p>
        ${extra ? `<p class="manual">${esc(extra)}</p>` : ""}
      </div>
    </details>`;
  }).join("\n");

  const period = s.period
    ? `${formatTs(s.period.from)} — ${formatTs(s.period.to)}`
    : "Belum ada entri";

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Transfer ke luar negeri — Gapura</title>
  <style>${REPORT_CSS}</style>
</head>
<body>
  <header class="nav">
    <div class="nav-inner">
      <div class="brand">
        <span class="feat">${CANDI_BENTAR_SVG}</span>
        <div>
          <p class="brand-name">Gapura</p>
          <p class="brand-sub">Transfer lintas batas</p>
        </div>
      </div>
      <div class="nav-meta">
        <strong>${s.entry_count} permintaan</strong>
        ${esc(formatTs(s.generated_at))}<br>
        ${esc(period)}
      </div>
    </div>
  </header>
  <main class="shell">
    <header class="page-header">
      <span class="badge warn"><span class="dot"></span>${esc(LEGAL_DISCLAIMER)}</span>
      <h1>Transfer ke luar negeri</h1>
      <p class="lede">Panggilan LLM yang kena data pribadi Indonesia. Nama Gapura di sini tidak ada hubungannya dengan PT Gapura Angkasa.</p>
    </header>
    <div class="metrics" aria-label="Ringkasan status">${metrics}</div>
    <div class="spread">
      <section class="card" aria-labelledby="col-hukum">
        <div class="card-head">
          <div>
            <h2 id="col-hukum">Pasal 161</h2>
            <p>Sebagian terisi dari log; c, d, dan f nunggu isian config.</p>
          </div>
        </div>
        ${pasalBlocks}
        <div class="card-head"><h2>Pasal 162 (2) h — format data</h2></div>
        <p class="note">${esc(PASAL162_H_NOTE)}</p>
      </section>
      <section class="card" aria-labelledby="col-lewat">
        <div class="card-head">
          <div>
            <h2 id="col-lewat">Permintaan</h2>
            <p>Hanya jenis dan hitungan — nilai asli tidak masuk log.</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="calls">
            <thead>
              <tr><th>Status</th><th>Tujuan</th><th>Jenis data</th><th>Waktu</th></tr>
            </thead>
            <tbody>
              ${calls || `<tr><td colspan="4">Kosong.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>
    </div>
    <footer class="foot card">
      <div class="card-head"><h2>Luar lingkup laporan</h2></div>
      <ul class="out">${s.not_covered.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      <p class="note">${esc(PP_SOURCE_NOTE)}</p>
    </footer>
  </main>
  <pre class="md-fallback">${esc(mdFallback)}</pre>
  <script>
    window.addEventListener("beforeprint", function () {
      document.querySelectorAll("details").forEach(function (d) { d.setAttribute("open", ""); });
    });
  </script>
</body>
</html>`;
}
