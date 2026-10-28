# Bukti — Gapura

Tanggal akses: **28 Okt 2026 (WIB)** kecuali dinyatakan lain.

## Perintah lokal (28 Okt 2026, pagi — baseline awal)

```text
$ npm install && npm run build && npm test
Test Files  4 passed (4)
Tests  10 passed (10)
```

Lihat **Checkpoint — 28 Okt 2026 (~13:32 WIB)** di bawah untuk angka terbaru (12 tes).

```text
$ npm run demo
Log: examples/demo-logs (3 baris)
Laporan: examples/sample-reports/laporan-contoh.md (+ .html)
Mock LLM menerima 3 request.

$ npm run lint:forbidden
No forbidden marketing/compliance words found.
```

## Nama paket dan repo

```text
$ node -v
v26.8.2

$ npm view gapura name 2>&1
404 Not Found — nama `gapura` masih bebas

$ npm view @adindamochamad/gapura name 2>&1
404 Not Found

$ npm view @adindamochamad/tirai version
0.2.0
```

GitHub `https://github.com/adindamochamad/gapura` → **404** (28 Okt 2026).

**Merek:** `gapura.id` = PT Gapura Angkasa (ground handling). Gapura (proyek ini) **tidak berafiliasi** — domain/merek lengkap **[belum terverifikasi]**.

## Pesaing (ulangan singkat, bukan jaminan)

| Produk | Catatan |
| --- | --- |
| [Anoman](https://www.anoman.io/platform/governance) | Gateway hosted, masking egress |
| Privasimu / KRES.ID | Platform GRC berbayar |
| [Dativo Talon](https://github.com/dativo-io/talon/) | OSS self-host; laporan GDPR/EU AI Act; egress fail-closed |
| RoPA template | Dokumen, bukan observer LLM |

Belum ketemu alat lokal OSS open source yang membaca panggilan LLM nyata khusus Pasal 161 PP 33/2026.

## CI GitHub Actions

Workflow: `.github/workflows/ci.yml` — **[belum terverifikasi]** run hijau setelah push ke GitHub.

---

## Checkpoint — 28 Okt 2026 (~13:32 WIB)

Titik henti sesi Cursor setelah UI + copy. Folder **`/Users/mac/Development/Gapura`** belum `git init` (28 Okt 2026).

### Sudah jalan

| Area | Keadaan |
| --- | --- |
| Core | `wrapFetch`, skema JSONL v1, Tirai `0.2.0`, klasifikasi status, fail-open |
| CLI | `gapura demo`, `gapura report` → MD + HTML (print CSS) |
| Penampil | `viewer/index.html` — pilih/seret `.jsonl`, tanpa jaringan |
| UI laporan | Pola **Untitled UI** (abu, kartu, metrik, tabel, accordion); bukan dasbor ungu Vanta |
| Copy UI | Bahasa lebih natural; disclaimer **Bukan pendapat hukum.** |
| Upload UI | Input file disembunyikan; zona seret + tombol **Pilih berkas** |
| Dokumen | `docs/PRD.md`, `ATM.md`, `DECISIONS`, `BATASAN`, README ID/EN |
| Tes | `npm test` → **12** lulus; `lint:forbidden` bersih |
| Contoh | `examples/demo-logs`, `sample-reports/laporan-contoh.{md,html}`, `gapura.config.json` |

### Verifikasi lokal (checkpoint)

```text
$ npm run build && npm test && npm run lint:forbidden && npm run demo
Test Files  5 passed (5)
Tests  12 passed (12)
No forbidden marketing/compliance words found.
Penampil: viewer/index.html
```

Pratinjau (jika `python3 -m http.server 8765` dari root repo):  
`/examples/sample-reports/laporan-contoh.html`, `/viewer/index.html`

### Belum / lanjut Stage 2

- `git init`, push ke GitHub public, CI hijau di remote  
- `gapura proxy` (SHOULD)  
- Verifikasi fetch OpenAI/Anthropic di `docs/PENYEDIA.md`  
- Fixture deteksi lengkap, Lighthouse, screenshot di docs  
- Tag `v0.1.0`, README clean-machine, checklist DoD 15 poin (`gapura-cursor-prompt.md`)  
- Validasi pasar = Adinda, bukan Cursor  

### Keputusan UI (ringkas)

- Referensi visual: [Untitled UI v8](https://www.untitledui.com/) — pola saja, tanpa ungu merek kit.  
- Ditinggalkan: layout cetak Kelman (Dribbble); dasbor Vanta (Mobbin).  
- ATM terdokumentasi di `docs/ATM.md`.

