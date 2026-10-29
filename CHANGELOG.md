## 0.1.3 — 2026-10-29

### Fixed

- Log `outcome`: **`timeout`** terpisah dari `network_error` (proxy 504 + klasifikasi error fetch)
- Base64 panjang: decode sampel (~16 KiB) + alasan `base64-partial` — NIK ter-encode tidak lagi invisible
- Viewer HTML: escape `"`/`'`, whitelist `status`; laporan Markdown escape `|` di tabel
- Proxy: **`--max-request-bytes`** (default 64 MiB) → 413 + log; relay stream besar tetap bounded memory (tes)

### Added

- Pemindaian terbatas **urlencoded**, **FormData** (field teks), **multipart** (part teks di buffer)
- Modul [`bodyExtract`](src/core/bodyExtract.ts), tes `body-extract`, `report-escape`, `privacy-no-network`, `proxy-large-body`
- Demo **`--deterministic`**, `npm run examples:update` / `examples:check`, laporan contoh = hash demo deterministik

### Changed

- [`observeHooks`](src/core/observeHooks.ts) untuk id/timestamp tetap pada demo contoh

### Known limitations

- Pemindaian sinkron body besar masih bisa ~700 ms (`time-budget`); multipart file/binary tetap partial; enkripsi TLS tidak dianalisis

## 0.1.2 — 2026-10-29

### Fixed

- Pemindaian body besar: anggaran waktu 500 ms di `scanPayload`/`observe` — tidak lagi memblokir puluhan detik; melebihi anggaran → `unchecked` + `time-budget`, bukan `clean` palsu
- Laporan contoh (`laporan-contoh.md`/`.html`) diselaraskan dengan output demo saat ini; kolom token menampilkan jumlah data disamarkan

### Added

- Tes anggaran observer (`observer-budget.test.ts`) dan kontrak statis laporan contoh (`sample-report-static.test.ts`)

### Known limitations (unchanged from 0.1.1)

- Timeout masih tercatat sebagai error jaringan; multipart/form body tidak dipindai (`unchecked`); NIK dalam base64 dapat lolos; proxy masih meneruskan body sangat besar; viewer HTML belum escape tanda kutip

## 0.1.1 — 2026-10-29

### Fixed

- Deteksi: `clean` hanya bila `coverage: full`; normalisasi NIK; scan query/path; skema log ketat
- Observer: anggaran pemindaian, `detector-error`, log **v2** dengan `outcome` / `http_status`
- `wrapFetch`: teruskan `(input, init)`, tanpa buffer stream penuh
- Proxy loopback: cegah SSRF, relay byte utuh (gzip), handler tidak mati pada URL invalid
- Laporan contoh: judul netral, kolom token, demo ke `--out`, README jujur (belum npm)

### Changed

- Skema log v2; `strictSchema` default true; kunci asing dibuang (`onUnknownKey: drop`)

## 0.1.0 — 2026-10-28
