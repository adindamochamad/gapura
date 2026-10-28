# PRD — Gapura v0.1

Alat bantu catatan, bukan nasihat hukum. Disetujui Stage 1.5, 28 Okt 2026 (WIB). Kutipan PP dari [salinan sekunder OCR](https://legaltrans.id/downloads/pp-33-tahun-2026-pelindungan-data-pribadi.pdf); JDIH [belum terverifikasi].

## 1. One-liner

Gapura: catat ke mana data pribadi mengalir saat aplikasimu memanggil LLM, dan cetak catatannya untuk Pasal 161 PP 33/2026. Lokal, open source.

## 2. Pertanyaan insomnia

Kalau klien atau auditor minta bukti data pribadi apa yang dikirim ke OpenAI atau Anthropic, aku kasih apa?

## 3. Pengguna & rasa sakit

Persona fiktif, bukan pengguna nyata.

- **Dewi** — lead engineer software house: klien tanya data apa yang masuk LLM; dia tak punya catatan.
- **Pak Hendra** — konsultan PDP: butuh bahan nyata dari panggilan, bukan tebakan.
- **Bu Sari** — staf IT dinas / BPR / koperasi: pakai chatbot AI, tak tahu data apa yang keluar.

## 4. Scope IN (MVP MUST)

- `wrapFetch`: pembungkus `fetch` TypeScript/JavaScript. Mengamati saja; tidak mengubah, menahan, atau menyamarkan request. Menyamarkan = tugas Tirai (`@adindamochamad/tirai@0.2.0`).
- Log JSONL lokal, skema v1 allowlist: `v`, `id`, `ts`, `provider`, `host`, `path` (tanpa query), `model` (string pendek), `status`, `pii` (jenis→jumlah), `tokens` (jenis→jumlah), `bytes`, `label` (opsional), `region_ref`. Writer menolak kunci di luar skema.
- **Tidak pernah di log:** isi prompt, nilai PII (utuh, sebagian, atau hash), header (termasuk `Authorization` / `x-api-key`), query string, body respons. Hasil `detectAll` hanya untuk hitung jenis; objek `Match` dibuang.
- CLI `gapura report` → Markdown dan HTML. PDF = cetak dari HTML (`@media print`). Tanpa generator PDF.
- Demo satu perintah ke server LLM tiruan di `localhost` (tanpa internet, tanpa kunci).
- Fail-open: kalau Gapura error, aplikasi tetap jalan; error ke stderr tanpa isi payload.
- File log `0600` (POSIX; Windows belum diuji). Batas body yang diperiksa **[tebakan] 5 MB**; di atas itu → `unchecked`. Teks dari semua nilai string hasil `JSON.parse` (bukan regex body mentah); string base64 panjang dilewati.

**SHOULD (boleh dipotong, urutan: penampil dulu lalu proxy):** `gapura proxy` (baca body request saja; streaming diteruskan); penampil statis satu halaman (pilih `.jsonl` lokal, tanpa upload).

**Pasal 161 a–g (kunci; kutipan penuh di `docs/PASAL-161.md` saat build):** a sebagian (tabel kapan / penyedia / jenis / jumlah; implikasi = manual); b sebagian (jenis+jumlah, `raw` vs `masked`; “cukup/relevan” = manual); c isi manual; d isi manual; e sebagian (sinyal teknis `masked` saja); f isi manual; g sebagian (periode log, tanggal laporan, tanggal tinjau dari config). Konteks Pasal 162(2)h: format teks biasa / disamarkan / dienkripsi. Kolom manual dari `gapura.config.json`, tampil sebagai “diisi pengguna, tidak diperiksa Gapura”.

## 5. Scope OUT (DILARANG)

Layanan hosted, akun, login, dasbor ber-backend, database server, telemetri. Nasihat hukum. Klaim “patuh”, “sesuai PP 33/2026”, “tersertifikasi”, “aman”. Deteksi ML/LLM. Menyamarkan atau memblokir request. Pemeriksaan respons. DPIA, RoPA penuh, dokumen kontrak, penilaian instrumen hukum otomatis. Ekstensi browser. Deteksi gambar/PDF/audio. Semua penyedia sekaligus. Hash atau sampel samaran dari data pribadi di log. Sertifikasi, audit, atau klaim bahwa tabel wilayah penyedia selalu benar.

## 6. Status panggilan

| Status | Syarat | Arti di laporan |
|---|---|---|
| `raw` | Ada data pribadi asli terdeteksi, tanpa token Tirai | Data pribadi terkirim apa adanya |
| `masked` | Ada token Tirai (`[NIK_1]` dst.), tanpa data asli terdeteksi | Terlihat sudah disamarkan sebelum dikirim |
| `mixed` | Keduanya | Sebagian lolos |
| `clean` | Tidak ada data pribadi dan tidak ada token | Tidak terdeteksi apa pun (**bukan** jaminan tidak ada) |
| `unchecked` | Body tak bisa dibaca (stream, multipart, terkompres, terlalu besar) | Tidak diperiksa. Wajib tampil |

## 7. Acceptance criteria

Tes privasi hijau (tidak ada nilai asli / potongan / prompt / header / kunci / query di log, stdout, stderr, termasuk jalur error). Laporan memuat 7 butir Pasal 161 a–g dengan label, plus peringatan “bukan nasihat hukum”; baris `belum terverifikasi` tidak tampil sebagai terverifikasi. Demo satu perintah menghasilkan log + laporan MD/HTML. README ID+EN bisa diikuti orang asing dari nol, tanpa internet dan tanpa kunci.

## 8. Arsitektur

`src/core` (extract, detect bungkus Tirai, classify, schema allowlist, logger, providers) · `src/wrap` (`wrapFetch`) · `src/proxy` (SHOULD) · `src/report` (pasal161, build, markdown, html — murni, jalan di browser) · `src/cli` (`report` \| `demo` \| `providers` \| `proxy`) · `data/providers.json` · `test/` · `docs/`. Dependensi runtime: hanya `@adindamochamad/tirai@0.2.0` (versi dikunci). Gapura tidak membuat request jaringan sendiri kecuali `wrapFetch` / `proxy` meneruskan ke tujuan yang diatur pengguna. Wilayah penyedia hanya “menurut dokumentasi, diakses \<tanggal\>” atau `belum terverifikasi`.

## 9. Data & privasi

Semua lokal. Tanpa akun, server, atau telemetri. Data uji sintetis saja (NIK `3171010101010000`, HP `0800-0000-0001`, email `contoh@example.test`; komentar `SINTETIS`). Tanpa rahasia di repo (`.env*`, `.gapura/` di gitignore). Bukan afiliasi PT Gapura Angkasa.

## 10. Risiko jujur

(a) Pengawas PDP belum terbentuk; belum ada bukti permintaan pasar. (b) Tafsir “kirim ke LLM luar negeri = transfer” adalah analisis, bukan kutipan; tabel wilayah bisa salah atau basi. (c) Hanya melihat panggilan yang lewat kodenya. (d) Deteksi berbasis aturan Tirai, bukan ML; nama tanpa label lolos. (e) Waktu sempit (Rabu–Sabtu). (f) Pesaing hosted (Anoman, GRC) dan Talon (OSS, GDPR, fail-closed) bisa menyusul. Gapura mencatat dan mendeteksi; tidak menjamin kepatuhan organisasi.

## Open questions

- SDK OpenAI/Anthropic Node: opsi `fetch` kustom **[belum terverifikasi]** sampai spike baca docs resmi (jangan panggil API asli).
- Nama paket: npm `gapura` masih 404 per 28 Okt 2026; scoped `@adindamochamad/gapura` juga bebas. Merek PT Gapura Angkasa tetap risiko. Domain/merek [belum terverifikasi].
- Teks pasal: salinan OCR sekunder; sumber JDIH/peraturan.go.id belum dibuka.
- Gerbang validasi pasar (3 percakapan) adalah tugas Adinda, bukan Cursor.

**Berhenti di sini.** Scaffold dimulai hanya setelah balasan `lanjut scaffold`.
