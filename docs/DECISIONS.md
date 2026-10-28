# Keputusan teknis Gapura

## wrapFetch sebagai integrasi utama

- **Keputusan:** MUST `wrapFetch` untuk TypeScript/JavaScript.
- **Alasan:** Permukaan paling kecil; tanpa proses tambahan; langsung pakai Tirai di core.
- **OpenAI Node SDK:** opsi `fetch` kustom **terverifikasi** (README/configuration openai-node, diakses 28 Okt 2026).
- **Anthropic Node SDK:** opsi `fetch` kustom **terverifikasi** ([ClientOptions.fetch](https://github.com/anthropics/anthropic-sdk-typescript/blob/main/src/client.ts), diakses 28 Okt 2026).

## Fail-open

- Kalau observasi gagal, request asli tetap diteruskan.
- `console.error("gapura: observation failed")` tanpa isi payload.

## Tanpa hash PII di log

- Hash NIK/HP ruang kecil → bisa ditebak brute force.
- Log hanya **jenis dan jumlah** (`pii`, `tokens`).

## Batas body

- Default **5 MB** **[tebakan]**; di atas → status `unchecked`.
- `Content-Length` > batas: body **tidak** dibaca ke memori (hanya metadata).
- Tanpa header: clone request dibaca stream dengan cap; jika melebihi batas, baca dihentikan dan `bodyText` null (request asli tetap utuh untuk upstream).

## Latensi wrapFetch

- Observasi jalan **sebelum** `baseFetch(request)`; biaya ≈ min(ukuran body, batas) + deteksi Tirai pada JSON yang terbaca.
- Respons API **tidak** diperiksa. Streaming respons diteruskan apa adaya (proxy/wrapFetch).

## Proxy dan penampil

- **`gapura proxy`**: SHOULD → diimplementasi v0.1 (HTTP lokal, ganti base URL).
- Penampil statis: `viewer/index.html`.

## Spike Tirai (28 Okt 2026)

- `@adindamochamad/tirai@0.2.0` dari npm, Node v26.
- `detectAll` mengembalikan `Match` dengan `value`; Gapura hanya menghitung jenis lalu membuang objek.

## File log

- Izin `0600` di POSIX; Windows belum diuji.
