# Keputusan teknis Gapura

## wrapFetch sebagai integrasi utama

- **Keputusan:** MUST `wrapFetch` untuk TypeScript/JavaScript.
- **Alasan:** Permukaan paling kecil; tanpa proses tambahan; langsung pakai Tirai di core.
- **OpenAI Node SDK:** opsi `fetch` kustom **terverifikasi** (README/configuration openai-node, diakses 28 Okt 2026).
- **Anthropic Node SDK:** **[belum terverifikasi]** di spike ini; asumsi pola serupa — cek docs resmi sebelum contoh README.

## Fail-open

- Kalau observasi gagal, request asli tetap diteruskan.
- `console.error("gapura: observation failed")` tanpa isi payload.

## Tanpa hash PII di log

- Hash NIK/HP ruang kecil → bisa ditebak brute force.
- Log hanya **jenis dan jumlah** (`pii`, `tokens`).

## Batas body

- Default **5 MB** **[tebakan]**; di atas → status `unchecked`.

## Spike Tirai (28 Okt 2026)

- `@adindamochamad/tirai@0.2.0` dari npm, Node v26.
- `detectAll` mengembalikan `Match` dengan `value`; Gapura hanya menghitung jenis lalu membuang objek.

## Proxy dan penampil

- **SHOULD**, boleh dipotong: urutan potong penampil → proxy (belum diimplementasi v0.1 scaffold).

## File log

- Izin `0600` di POSIX; Windows belum diuji.
