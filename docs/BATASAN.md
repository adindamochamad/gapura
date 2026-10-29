# Batasan Gapura

- **`gapura proxy` beta, hanya loopback** — jangan di jaringan bersama.
- Hanya melihat panggilan HTTP yang lewat **`wrapFetch`** (atau **`gapura proxy`** jika ada).
- Query dan path **dipindai** untuk hitungan PII, tetapi **tidak disimpan** di log. Hanya body **JSON UTF-8** (atau teks yang bisa diparse JSON) yang dipindai penuh.
- **`clean`** = tidak terdeteksi pada cakupan penuh, **bukan jaminan**. **`unchecked`** + `reasons` = bagian request tidak dipindai atau error deteksi.
- Log mencatat percobaan **beserta hasilnya** (`outcome`). Baris hilang hanya jika **penulisan log gagal** (fail-open sengaja).
- Pemindaian per potongan bisa melewatkan data yang terbelah di batas potongan.
- Base64 panjang, gambar, PDF, audio, body terkompres, stream: **`unchecked`**.
- Gateway lokal bisa meneruskan ke luar; Gapura tidak melihat lompatan berikutnya.
- Normalisasi digit/spasi bisa false-positive — lihat tes negatif.
- Tidak ada rotasi log (hapus berkas manual).
- **Belum diuji:** SDK OpenAI/Anthropic asli, Windows, viewer di browser, JDIH, Node di luar matriks CI.

**Bukan nasihat hukum.** Pengawas PDP belum terbentuk ([Bisnis](https://teknologi.bisnis.com/read/20260913/84/2003698/pembentukan-badan-pdp-dipercepat-implementasi-uu-pdp-dinilai-belum-efektif), [CNBC Indonesia](https://www.cnbcindonesia.com/tech/20260916115609-37-768328/lembaga-perlindungan-data-belum-ada-di-ri-padahal-aturannya-sudah-ada)).
