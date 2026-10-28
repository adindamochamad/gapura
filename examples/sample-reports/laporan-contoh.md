# Transfer ke luar negeri

**Bukan pendapat hukum.**

Dibuat: 2026-10-28T06:31:40.453Z
Periode log: 2026-10-28T06:31:40.432Z — 2026-10-28T06:31:40.451Z
Jumlah permintaan: 3

Kutip Pasal 161 dari OCR legaltrans.id; belum dicocokkan ke JDIH resmi.

## Ringkasan status

| Status | Jumlah |
| --- | ---: |
| clean | 1 |
| masked | 1 |
| raw | 1 |

## Pasal 161 PP 33/2026

### (a) Perekaman dan pemetaan siklus transfer

> melakukan perekaman dan pemetaan siklus transfer Data Pribadi dan implikasinya

- **Label:** sebagian
- Log mencatat kapan, ke penyedia mana, jenis data apa, dan berapa kali muncul. Implikasi transfer tetap Anda yang tulis.

### (b) Cukup, relevan, terbatas

> memastikan bahwa Data Pribadi yang ditransfer cukup, relevan, dan terbatas sesuai dengan tujuan transfer Data Pribadi

- **Label:** sebagian
- Yang otomatis: jenis, jumlah, plus indikasi penyamaran di body request. Apakah sudah cukup dan relevan — bukan ranah Gapura.

### (c) Instrumen hukum rujukan

> mengidentifikasi instrumen hukum yang digunakan sebagai rujukan untuk proses transfer Data Pribadi

- **Label:** isi manual
- Isi dari config; Gapura menampilkan teks itu tanpa mengecek kebenarannya.
- Config: SCC klausul transfer (contoh)

### (d) Penilaian efektivitas instrumen

> melakukan penilaian efektivitas instrumen hukum yang digunakan untuk proses transfer Data Pribadi yang akan dilakukan sebelum melakukan transfer Data Pribadi

- **Label:** isi manual
- Sama seperti (c): kolom config, tanpa penilaian dari alat ini.
- Config: Belum dinilai

### (e) Instrumen pelengkap

> menggunakan instrumen pelengkap apabila dibutuhkan, baik berupa instrumen kontraktual, teknis, dan/ atau organisasional

- **Label:** sebagian
- Kalau request terlihat disamarkan, itu tercatat. Kontrak, SOP, dan langkah organisasi — manual.

### (f) Langkah prosedural instrumen pelengkap

> menerapkan langkah prosedural yang dapat ditempuh jika akan menggunakan instrumen pelengkap

- **Label:** isi manual
- Prosedur internal: isi config, Gapura tidak memvalidasi.
- Config: Belum ditulis

### (g) Evaluasi ulang berkala

> mengevaluasi ulang secara berkala dalam kurun waktu yang memadai

- **Label:** sebagian
- Rentang waktu log plus tanggal tinjau berikutnya (config). Pelaksanaan tinjauannya di luar alat ini.
- Revisi berikutnya 2027-01-16

## Pasal 162 (2) h

Butir h membahas format data yang dikirim — plain text, disamarkan, atau terenkripsi. Gapura hanya memberi status panggilan (raw, masked, mixed, clean, unchecked). Itu beda hal dengan enkripsi di koneksi.

## Permintaan

| Waktu | Penyedia | Host | Path | Status | PII (jenis×jumlah) | Wilayah (dok.) |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-28T06:31:40.432Z | localhost / jaringan privat | 127.0.0.1 | /v1/chat/completions | raw | NIK: 1, TELEPON: 1, EMAIL: 1 | tidak keluar mesin (kategori khusus) (menurut dokumentasi penyedia, diakses 2026-10-28) |
| 2026-10-28T06:31:40.448Z | localhost / jaringan privat | 127.0.0.1 | /v1/chat/completions | masked | — | tidak keluar mesin (kategori khusus) (menurut dokumentasi penyedia, diakses 2026-10-28) |
| 2026-10-28T06:31:40.451Z | localhost / jaringan privat | 127.0.0.1 | /v1/chat/completions | clean | — | tidak keluar mesin (kategori khusus) (menurut dokumentasi penyedia, diakses 2026-10-28) |

## Luar lingkup laporan

- Sub-prosesor dan vendor di balik penyedia LLM
- Lokasi proses data di lapangan (bukan yang tertulis di dokumen)
- Akses tim dukungan dari luar negeri
- Teks prompt dan respons API
- Putusan soal instrumen transfer (Pasal 165)
- Klaim sertifikasi atau status kepatuhan

Wilayah di dokumen penyedia tidak menjawab sub-prosesor, akses support dari luar negeri, atau lokasi proses yang sebenarnya.