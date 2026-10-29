# Batasan Gapura

- **`gapura proxy` beta, hanya loopback** — jangan di jaringan bersama.
- Hanya melihat panggilan HTTP yang lewat **`wrapFetch`** (atau **`gapura proxy`** jika ada).
- Query dan path **dipindai** untuk hitungan PII, tetapi **tidak disimpan** di log. Body JSON UTF-8, **urlencoded**, field teks FormData, dan part teks multipart (dalam anggaran inspect) ikut dipindai; file/binary/stream tetap partial.
- **`clean`** = tidak terdeteksi pada cakupan penuh, **bukan jaminan**. **`unchecked`** + `reasons` = bagian request tidak dipindai atau error deteksi.
- Log mencatat percobaan **beserta hasilnya** (`outcome`). Baris hilang hanya jika **penulisan log gagal** (fail-open sengaja).
- Pemindaian per potongan bisa melewatkan data yang terbelah di batas potongan.
- Base64 panjang: sampel decode + `base64-partial`; gagal decode → `base64-skipped`. Gambar/PDF/audio, body terkompres, stream/file: partial atau **`unchecked`**.
- **`gapura proxy`**: default relay body request **64 MiB** (`--max-request-bytes`); pemindaian body tetap **5 MiB**.
- Gateway lokal bisa meneruskan ke luar; Gapura tidak melihat lompatan berikutnya.
- Normalisasi digit/spasi bisa false-positive — lihat tes negatif.
- Tidak ada rotasi log (hapus berkas manual).
- **Belum diuji:** SDK OpenAI/Anthropic asli, Windows, viewer di browser, JDIH, Node di luar matriks CI.

**Bukan nasihat hukum.** Pengawas PDP belum terbentuk ([Bisnis](https://teknologi.bisnis.com/read/20260913/84/2003698/pembentukan-badan-pdp-dipercepat-implementasi-uu-pdp-dinilai-belum-efektif), [CNBC Indonesia](https://www.cnbcindonesia.com/tech/20260916115609-37-768328/lembaga-perlindungan-data-belum-ada-di-ri-padahal-aturannya-sudah-ada)).
