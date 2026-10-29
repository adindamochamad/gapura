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
