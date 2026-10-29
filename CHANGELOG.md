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
