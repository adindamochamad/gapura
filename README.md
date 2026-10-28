# Gapura

Mencatat panggilan LLM yang membawa data pribadi Indonesia, lalu mencetak lampiran Pasal 161 PP 33/2026. Semua jalan di komputer Anda.

**Bukan pendapat hukum.** Tidak terkait PT Gapura Angkasa.

Pasangan penyamaran: [@adindamochamad/tirai](https://github.com/adindamochamad/tirai).

## Prasyarat

- Node.js **≥ 20** (dites di 22 / 26)
- npm

## Instal (dari repo)

```bash
git clone https://github.com/adindamochamad/gapura.git
cd gapura
npm ci
npm run build
```

## Demo satu perintah

Tanpa internet, tanpa kunci API:

```bash
npm run demo
```

Menulis log ke `examples/demo-logs/` dan laporan ke `examples/sample-reports/laporan-contoh.md` (+ `.html`). Penampil statis: buka `viewer/index.html` lalu pilih berkas `.jsonl` (tanpa unggah).

## wrapFetch

```ts
import { wrapFetch } from "gapura/wrap";
import { defaultLogDir } from "gapura";

const fetch = wrapFetch(globalThis.fetch, {
  logDir: defaultLogDir(),
  label: "Aplikasi Contoh",
});

await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ model: "gpt-4o-mini", messages: [] }),
});
```

OpenAI SDK: `new OpenAI({ fetch: wrapFetch(globalThis.fetch, { logDir: "..." }) })` — opsi `fetch` [terverifikasi di docs openai-node](https://github.com/openai/openai-node).

## Laporan

```bash
npx gapura report --log ./.gapura/logs --out ./.gapura/reports
```

PDF: buka `laporan.html` di browser → cetak (stylesheet `@media print`).

## gapura.config.json

Isi manual Pasal 161 c–d–f dan tanggal tinjau. Lihat `examples/gapura.config.json`.

## Batasan

Lihat [docs/BATASAN.md](docs/BATASAN.md).

## Lisensi

MIT
