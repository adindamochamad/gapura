# Bukti — Gapura

Tanggal akses: **28 Okt 2026 (WIB)** kecuali dinyatakan lain.

## Verifikasi lokal — sesi penutupan temuan audit (28 Okt ~13:49 WIB)

```text
$ node -v
v26.8.2

$ npm run typecheck && npm test && npm run build && npm run demo
Test Files  9 passed (9)
Tests  72 passed (72)

$ npm run lint:forbidden && npm run lint:secrets
No forbidden marketing/compliance words found.
No suspicious secret patterns in scanned files.

$ node dist/cli/main.js proxy --help
Gapura proxy — HTTP lokal, observasi body request
```

### Folder bersih (rsync tanpa node_modules)

```text
$ rsync -a --exclude node_modules --exclude .git …/gapura/ /tmp/gapura/
$ cd /tmp/gapura && npm ci && npm run build && npm test && npm run demo
Tests  72 passed (72)
Mock LLM menerima 3 request.
```

### Lighthouse (accessibility, laporan contoh)

Server: `python3 -m http.server 8765` dari root repo. Skor: **100** — lihat `docs/lighthouse/laporan-contoh-a11y.json`.

### Screenshot

`docs/screenshot/laporan-desktop.png`, `laporan-mobile.png` — diambil dari `http://127.0.0.1:8766/examples/sample-reports/laporan-contoh.html` (tanpa font/URL eksternal di HTML).

## Nama paket dan repo

```text
$ npm view gapura name 2>&1
404 Not Found — nama `gapura` masih bebas

$ npm view @adindamochamad/tirai version
0.2.0
```

Repo GitHub: `https://github.com/adindamochamad/gapura` — dibuat pada push rilis v0.1.0 (lihat bagian CI di bawah setelah push).

## Tabel penyedia

Docs resmi dibaca 28 Okt 2026 untuk Anthropic, Gemini Paid, OpenAI (wilayah tunggal tidak dinyatakan), DeepSeek (tanpa wilayah). Detail kutipan: `docs/PENYEDIA.md`, `data/providers.json`.

## CI GitHub Actions

Workflow: `.github/workflows/ci.yml` — typecheck, 72 tes, build, demo, proxy `--help`, forbidden words, secret scan.

**Run hijau:** _(diisi URL run setelah push)_

## Perubahan inti v0.1 (temuan audit)

- Gerbang body 5 MB: `Content-Length` + baca stream terbatas (tanpa buffer penuh body besar).
- `gapura proxy` — observasi request, respons streaming.
- Tes: 51 kasus bentuk JSON/deteksi, stress 80 paralel, body-limit, proxy.
- Instrumen debug sesi audit dicabut.

## Pesaing (ulangan singkat)

Belum ketemu alat lokal OSS open source khusus Pasal 161 + observer LLM nyata. Lihat checkpoint lama di git history `docs/EVIDENCE.md` (28 Okt pagi).
