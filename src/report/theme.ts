/** ATM: Untitled UI (Jordan Hughes) — header, badge, metrics, table, accordion. Bukan ungu merek. file://. */

export const CANDI_BENTAR_SVG = `<svg class="mark" viewBox="0 0 96 58" role="img" aria-label="Gapura candi bentar" focusable="false">
  <title>Gapura candi bentar</title>
  <path fill="currentColor" d="M4 56 L4 28 L18 8 L38 8 L38 56 L28 56 L28 30 L14 30 L14 56 Z"/>
  <path fill="currentColor" d="M92 56 L92 28 L78 8 L58 8 L58 56 L68 56 L68 30 L82 30 L82 56 Z"/>
</svg>`;

export function statusIcon(status: string): string {
  switch (status) {
    case "masked":
      return `<svg class="si" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3" width="12" height="10" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M2 8h12" stroke="currentColor" stroke-width="1.4"/></svg>`;
    case "raw":
      return `<svg class="si" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 V5 L8 2 L13 5 V13 Z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
    case "unchecked":
      return `<svg class="si" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2 2"/></svg>`;
    case "mixed":
      return `<svg class="si" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 14 L8 2 L14 14 Z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
    default:
      return `<svg class="si" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
  }
}

export function statusPhrase(status: string): string {
  switch (status) {
    case "raw":
      return "Ikut apa adanya";
    case "masked":
      return "Body kelihatan disamarkan";
    case "mixed":
      return "Campuran utuh & samar";
    case "unchecked":
      return "Lewat tanpa dicek";
    default:
      return "Tidak ada yang kebaca";
  }
}

export const REPORT_CSS = `
:root {
  --gray-25: #fcfcfd;
  --gray-50: #f9fafb;
  --gray-100: #f2f4f7;
  --gray-200: #eaecf0;
  --gray-300: #d0d5dd;
  --gray-400: #98a2b3;
  --gray-500: #667085;
  --gray-600: #475467;
  --gray-700: #344054;
  --gray-900: #101828;
  --white: #ffffff;
  --success-50: #ecfdf3;
  --success-200: #abefc6;
  --success-700: #067647;
  --error-50: #fef3f2;
  --error-200: #fecdca;
  --error-700: #b42318;
  --warning-50: #fffaeb;
  --warning-200: #fedf89;
  --warning-700: #b54708;
  --blue-50: #eff8ff;
  --blue-200: #b2ddff;
  --blue-700: #175cd3;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --shadow-xs: 0 1px 2px rgba(16, 24, 40, 0.05);
  --shadow-sm: 0 1px 3px rgba(16, 24, 40, 0.1), 0 1px 2px rgba(16, 24, 40, 0.06);
  --sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}
*, *::before, *::after { box-sizing: border-box; }
html { color-scheme: light; }
body {
  margin: 0;
  background: var(--gray-50);
  color: var(--gray-900);
  font-family: var(--sans);
  font-size: 16px;
  line-height: 1.5;
}
.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
}
.nav-inner {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
}
.feat {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-200);
  background: var(--gray-50);
  display: grid;
  place-items: center;
  color: var(--gray-900);
  flex: none;
}
.mark { width: 1.35rem; height: 0.82rem; display: block; }
.brand-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.brand-sub {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--gray-500);
}
.nav-meta {
  margin-left: auto;
  text-align: right;
  font-size: 0.8125rem;
  color: var(--gray-500);
  font-variant-numeric: tabular-nums;
}
.nav-meta strong {
  display: block;
  color: var(--gray-700);
  font-weight: 600;
}
.shell {
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 2rem 4rem;
}
.page-header { margin-bottom: 1.5rem; }
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.25;
  padding: 0.125rem 0.5rem 0.125rem 0.375rem;
  border-radius: 999px;
  border: 1px solid var(--gray-200);
  background: var(--white);
  color: var(--gray-700);
  box-shadow: var(--shadow-xs);
}
.badge .dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: var(--gray-400);
  flex: none;
}
.badge.warn { background: var(--warning-50); border-color: var(--warning-200); color: var(--warning-700); }
.badge.warn .dot { background: var(--warning-700); }
.badge.ok { background: var(--success-50); border-color: var(--success-200); color: var(--success-700); }
.badge.ok .dot { background: var(--success-700); }
.badge.bad { background: var(--error-50); border-color: var(--error-200); color: var(--error-700); }
.badge.bad .dot { background: var(--error-700); }
.badge.mix { background: var(--error-50); border-color: var(--error-200); color: var(--error-700); }
.badge.mix .dot { background: var(--error-700); }
.badge.idle { background: var(--blue-50); border-color: var(--blue-200); color: var(--blue-700); }
.badge.idle .dot { background: var(--blue-700); }
h1 {
  margin: 0.75rem 0 0.5rem;
  font-size: 2.25rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.2;
}
.lede {
  margin: 0;
  max-width: 42rem;
  color: var(--gray-600);
  font-size: 1rem;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1rem;
  margin: 0 0 1.5rem;
}
.metric {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
  padding: 1.25rem 1.25rem 1.125rem;
  min-width: 0;
}
.metric .label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-600);
  margin: 0 0 0.5rem;
}
.metric b {
  display: block;
  font-size: 1.875rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}
.metric .hint {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: var(--gray-500);
}
.spread {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.2fr);
  gap: 1.5rem;
  align-items: start;
}
.card {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.25rem 0.75rem;
}
.card-head h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.card-head p {
  margin: 0.2rem 0 0;
  font-size: 0.875rem;
  color: var(--gray-500);
}
.quote {
  margin: 0 1.25rem 1rem;
  padding: 0.875rem 1rem;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  color: var(--gray-700);
  font-size: 0.875rem;
}
.pasal {
  border-top: 1px solid var(--gray-200);
}
.pasal summary {
  list-style: none;
  cursor: pointer;
  display: grid;
  grid-template-columns: 2.25rem minmax(0, 1fr) auto;
  gap: 0.5rem;
  align-items: center;
  padding: 0.875rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
}
.pasal summary::-webkit-details-marker { display: none; }
.pasal summary .letter {
  color: var(--gray-500);
  font-variant-numeric: tabular-nums;
  font-size: 0.8125rem;
  font-weight: 500;
}
.pasal .body {
  padding: 0 1.25rem 1.1rem 3.75rem;
  color: var(--gray-600);
  font-size: 0.875rem;
}
.pasal .body .manual {
  margin-top: 0.5rem;
  padding-left: 0.75rem;
  border-left: 2px solid var(--gray-200);
  color: var(--gray-700);
}
.pasal blockquote {
  margin: 0 0 0.5rem;
  color: var(--gray-700);
}
.tag {
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 999px;
  padding: 0.125rem 0.5rem;
  border: 1px solid var(--gray-200);
  background: var(--gray-50);
  color: var(--gray-700);
  white-space: nowrap;
}
.tag.manual {
  background: var(--warning-50);
  border-color: var(--warning-200);
  color: var(--warning-700);
}
.tag.partial {
  background: var(--success-50);
  border-color: var(--success-200);
  color: var(--success-700);
}
.table-wrap { overflow-x: auto; }
table.calls {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
table.calls th {
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gray-500);
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
  padding: 0.75rem 1.25rem;
}
table.calls td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--gray-200);
  vertical-align: top;
  color: var(--gray-600);
}
table.calls tr:last-child td { border-bottom: none; }
table.calls .where {
  margin: 0;
  color: var(--gray-900);
  font-weight: 500;
}
table.calls .muted { margin: 0.15rem 0 0; font-size: 0.8125rem; }
.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  font-weight: 500;
}
.si { width: 12px; height: 12px; flex: none; }
.status-raw, .metric.raw b { color: var(--error-700); }
.status-masked, .metric.masked b { color: var(--success-700); }
.status-mixed, .metric.mixed b { color: var(--error-700); }
.status-clean, .metric.clean b { color: var(--gray-700); }
.status-unchecked, .metric.unchecked b { color: var(--warning-700); }
.note {
  margin: 0;
  padding: 0 1.25rem 1.25rem;
  font-size: 0.875rem;
  color: var(--gray-600);
}
.foot {
  margin-top: 1.5rem;
}
.foot .card-head { padding-bottom: 0; }
.out {
  margin: 0;
  padding: 0 1.25rem 1.25rem 2.6rem;
  color: var(--gray-600);
  font-size: 0.875rem;
}
.out li { margin: 0.35rem 0; }
.drop {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  border: 1px dashed var(--gray-300);
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 2.25rem 1.5rem;
  text-align: center;
  margin: 0 0 1.5rem;
  box-shadow: var(--shadow-xs);
  cursor: pointer;
}
.drop:hover, .drop.is-over {
  border-color: var(--gray-400);
  background: var(--gray-25);
}
.drop:focus-within {
  outline: 2px solid var(--gray-900);
  outline-offset: 2px;
}
.drop-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.drop-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-200);
  background: var(--gray-50);
  display: grid;
  place-items: center;
  color: var(--gray-700);
}
.drop-icon svg { width: 1.25rem; height: 1.25rem; }
.drop-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--gray-900);
}
.drop-hint {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-500);
  max-width: 22rem;
}
.drop-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.25rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
}
.drop.has-file .drop-title { color: var(--gray-900); }
.drop-error {
  margin: -0.75rem 0 1.5rem;
  font-size: 0.875rem;
  color: var(--error-700);
}
pre.md-fallback { display: none; }
code { font-family: ui-monospace, "Segoe UI Mono", monospace; font-size: 0.92em; }
@media (max-width: 960px) {
  .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .spread { grid-template-columns: 1fr; }
  .nav-inner, .shell { padding-left: 1rem; padding-right: 1rem; }
  h1 { font-size: 1.75rem; }
}
@media print {
  @page { size: A4; margin: 12mm; }
  body { background: white; }
  .nav { position: static; }
  .drop { display: none; }
  .card { break-inside: avoid; box-shadow: none; }
  .pasal .body { display: block !important; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
`;
