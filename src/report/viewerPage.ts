import { REPORT_CSS, CANDI_BENTAR_SVG, statusIcon, statusPhrase } from "./theme.js";
import { LEGAL_DISCLAIMER } from "./pasal161.js";

export function renderViewerPage(): string {
  const statuses = ["raw", "masked", "mixed", "clean", "unchecked"] as const;
  const icons: Record<string, string> = {};
  const phrases: Record<string, string> = {};
  for (const st of statuses) {
    icons[st] = statusIcon(st);
    phrases[st] = statusPhrase(st);
  }

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Buka log — Gapura</title>
  <style>${REPORT_CSS}</style>
</head>
<body>
  <header class="nav">
    <div class="nav-inner">
      <div class="brand">
        <span class="feat">${CANDI_BENTAR_SVG}</span>
        <div>
          <p class="brand-name">Gapura</p>
          <p class="brand-sub">Log di mesin ini</p>
        </div>
      </div>
      <div class="nav-meta"><strong>Lokal</strong>Cuma di browser ini</div>
    </div>
  </header>
  <main class="shell">
    <header class="page-header">
      <span class="badge warn"><span class="dot"></span>${LEGAL_DISCLAIMER}</span>
      <h1>Buka log</h1>
      <p class="lede">File JSONL dari folder log Gapura.</p>
    </header>
    <label class="drop" id="drop">
      <input id="file" class="drop-input" type="file" accept=".jsonl,application/jsonl,text/plain" />
      <span class="drop-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>
          <path d="M14 3v5h5"/>
          <path d="M8 13h8M8 17h5"/>
        </svg>
      </span>
      <span class="drop-title">Log JSONL</span>
      <span class="drop-hint" id="file-name">Seret file ke sini, atau klik Pilih berkas.</span>
      <span class="drop-btn">Pilih berkas</span>
    </label>
    <p class="drop-error" id="file-error" hidden></p>
    <div id="out"></div>
  </main>
  <script>
    const ICONS = ${JSON.stringify(icons)};
    const PHRASE = ${JSON.stringify(phrases)};
    const BADGE = { raw: "bad", masked: "ok", mixed: "mix", clean: "idle", unchecked: "warn" };
    function esc(s) {
      return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }
    const drop = document.getElementById("drop");
    const fileInput = document.getElementById("file");
    const fileName = document.getElementById("file-name");
    const fileError = document.getElementById("file-error");
    ["dragenter", "dragover"].forEach((ev) => {
      drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("is-over"); });
    });
    ["dragleave", "drop"].forEach((ev) => {
      drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("is-over"); });
    });
    drop.addEventListener("drop", (e) => {
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f) return;
      const dt = new DataTransfer();
      dt.items.add(f);
      fileInput.files = dt.files;
      fileInput.dispatchEvent(new Event("change"));
    });
    fileInput.addEventListener("change", async (ev) => {
      const f = ev.target.files && ev.target.files[0];
      if (!f) return;
      drop.classList.add("has-file");
      fileName.textContent = f.name;
      fileError.hidden = true;
      let text;
      try {
        text = await f.text();
      } catch (err) {
        fileError.hidden = false;
        fileError.textContent = "Filenya tidak kebaca.";
        return;
      }
      let entries;
      try {
        entries = text.split("\\n").filter(Boolean).map((line) => JSON.parse(line));
      } catch (err) {
        fileError.hidden = false;
        fileError.textContent = "Bukan format log Gapura.";
        document.getElementById("out").innerHTML = "";
        return;
      }
      const by = { raw:0, masked:0, mixed:0, clean:0, unchecked:0 };
      for (const e of entries) by[e.status] = (by[e.status] || 0) + 1;
      const metrics = ["raw","masked","mixed","clean","unchecked"].map((st) =>
        '<article class="metric ' + st + '"><p class="label">' + (ICONS[st]||"") + " " + st +
        "</p><b>" + (by[st]||0) + '</b><p class="hint">' + PHRASE[st] + "</p></article>"
      ).join("");
      const rows = entries.map((e) => {
        const pii = Object.entries(e.pii || {}).map(([k,v]) => k + "×" + v).join(", ") || "—";
        const region = (e.region_ref && e.region_ref.processing_region) || "—";
        return "<tr><td><span class=\\"badge " + (BADGE[e.status]||"") + " pill status-" + esc(e.status) +
          '\\"><span class="dot"></span>' + (ICONS[e.status]||"") + " " + esc(e.status) +
          "</span></td><td><p class=where>" + esc(e.provider) + '</p><p class=muted>' +
          esc(e.host) + esc(e.path) + "</p></td><td><p class=muted>" + esc(pii) +
          "</p><p class=muted>" + esc(region) + "</p></td></tr>";
      }).join("");
      document.getElementById("out").innerHTML =
        '<div class="metrics">' + metrics + '</div><section class="card"><div class="card-head"><h2>Permintaan</h2></div>' +
        '<div class="table-wrap"><table class="calls"><thead><tr><th>Status</th><th>Tujuan</th><th>Jenis data</th></tr></thead><tbody>' +
        (rows || "<tr><td colspan=3>Kosong.</td></tr>") + "</tbody></table></div></section>";
    });
  </script>
</body>
</html>`;
}
