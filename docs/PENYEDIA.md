# Penyedia LLM — wilayah pemrosesan

Data utama: [`data/providers.json`](../data/providers.json).

Aturan:

- Wilayah ditampilkan hanya sebagai “menurut dokumentasi penyedia, diakses &lt;tanggal&gt;” atau **`belum terverifikasi`**.
- Baris diverifikasi &gt;90 hari **[tebakan]** → “perlu verifikasi ulang”.
- Pengguna bisa menimpa lewat `gapura.config.json` → `provider_overrides`.
- Gapura **tidak** menjawab sub-prosesor, akses dukungan luar negeri, atau lokasi sebenarnya.

Cursor wajib mengisi baris dari docs resmi sebelum klaim terverifikasi; scaffold 28 Okt 2026: **mayoritas belum dibaca**.
