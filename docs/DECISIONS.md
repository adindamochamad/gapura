# Keputusan teknis Gapura

## Fail-open (v0.1.1)

- Kalau observasi gagal, request asli tetap diteruskan.
- Satu baris `unchecked` + `reasons` bila memungkinkan; stderr tanpa isi payload.

## Skema log v2

- `outcome` + `http_status` ditulis setelah hasil fetch/proxy diketahui.
- Nilai `outcome`: `ok`, `http_error`, `network_error`, `timeout`, `aborted`.
- `clean` hanya dengan `coverage: full`.

## Base64 dan normalisasi

- Base64 panjang: decode sampel terbatas (~16 KiB) + alasan `base64-partial`; gagal decode → `base64-skipped`.
- `normalizeForScan` di Gapura (NFKC, digit Unicode, zero-width, gabung digit).

## Anggaran pemindaian

- Potongan 16 KB, `maxMatches` 5000, `maxScanMs` 500 (async wrapper).
- `too-dense`, `time-budget`, `detector-error` → partial / unchecked.

## wrapFetch v0.1.1

- `baseFetch(input, init)` identik; body hanya string/bytes/`URLSearchParams`.
- Stream/Request/`FormData` → `unchecked` tanpa clone+kuras.

## Logger

- `strictSchema` default true; `onUnknownKey: drop`.
- Scan string serialisasi sebelum tulis berkas.

## Proxy

- Satu `--target`; path klien divalidasi; relay `http.request` + pipeline (byte utuh).

## Tanpa hash PII di log

- Log hanya jenis dan jumlah.

## Batas body

- Default 5 MB **[tebakan]**; di atas → `unchecked` / `too-large`.

## File log

- Izin `0600` di POSIX; Windows belum diuji.
