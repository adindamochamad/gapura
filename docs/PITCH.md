# Pitch — Gapura (draf)

Alat bantu catatan, bukan nasihat hukum. Persona fiktif. Tanpa klaim positioning “pertama di pasar” atau angka pengguna.

## 30 detik

Mulai 16 Jan 2027, PP 33/2026 menuntut pencatatan transfer data pribadi lintas batas. Gapura adalah alat open source lokal yang **mencatat** panggilan ke API LLM: ke penyedia mana, jenis data apa (bukan isinya), dan apakah terlihat disamarkan. Output: lampiran Pasal 161 a–g untuk diisi tim Anda. Gapura **tidak** menjamin kepatuhan organisasi dan **bukan** pendapat hukum.

## 3 menit

**Masalah:** Engineer sering tidak punya catatan saat klien atau auditor bertanya: data pribadi apa yang masuk ke OpenAI/Claude/Gemini?

**Gapura:** Bungkus `fetch` atau arahkan lewat proxy lokal. Setiap request JSON ke LLM → baris log metadata + laporan Markdown/HTML. Deteksi jenis PII pakai Tirai (aturan, bukan ML). Log **tidak** menyimpan prompt, NIK/HP asli, atau kunci API.

**Batas jujur:** Hanya panggilan yang lewat integrasi Gapura; respons tidak diperiksa; wilayah penyedia dari docs (banyak baris masih `belum terverifikasi`); pengawas PDP belum terbentuk **[sumber pers belum terverifikasi]**; belum ada bukti pasar membayar untuk ini.

**Pasangan:** Tirai untuk menyamarkan sebelum kirim; Gapura untuk catatan transfer.

**Ajakan:** Konsultan PDP atau engineer diminta meninjau templat laporan contoh di repo — apa yang kurang?
