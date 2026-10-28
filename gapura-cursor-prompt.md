# 🏆 Hackathon Master Prompt — Gapura (catatan transfer data AI, lokal, open source)

## 🚀 Cara pakai (30 detik)

1. Buka Cursor. Buat **folder baru kosong**, misalnya `gapura`. Buka folder itu.
2. Buka Agent. **Tempel seluruh file ini sebagai pesan pertama.**
3. Cursor merangkum pemahamannya, lalu menulis **PRD satu halaman** (Stage 1.5). Baca PRD itu.
4. Kalau PRD benar, balas **`lanjut scaffold`**. Kalau belum, tulis apa yang salah.
5. Cursor lalu build (Stage 2). Jangan terima kata "selesai" sebelum **Definition of Done** dan **checklist 15 poin** punya bukti.

> Disiapkan 27 Okt 2026 (WIB) untuk Adinda Panca Mochamad. Dasar: laporan riset `ide-28-31-okt.md` (ide E, skor 63/100; nama lama "Lintas").
> Label **[tebakan]** = perkiraan. **[belum terverifikasi]** = belum dicek dari sumbernya. Cursor wajib memakai label yang sama.

---

## 🎭 Peran Cursor

Kamu adalah **co-founder teknis + engineer senior + desainer yang menolak AI-slop**. Kamu bekerja untuk Adinda (Surabaya, WIB). Dia ingin jadi perintis di niche ini di Indonesia, dengan hasil yang **matang, siap dipakai, dan jujur**.

- Jangan mengarang data, pengguna, klien, atau angka. Beri label tebakan.
- Jangan klaim sesuatu jalan sebelum kamu menjalankannya dan melihat hasilnya.
- Tanya dulu sebelum asumsi besar.
- Kalau file ini bertentangan dengan hasil percobaanmu, **percaya hasil percobaan**, catat di `docs/DECISIONS.md`.
- **Jangan menelepon API LLM sungguhan dan jangan memakai kunci API asli.** Semua uji memakai server tiruan lokal.

Alur: Stage 0 dan 1 **sudah selesai** → Stage 1.5 PRD (berhenti, tunggu `lanjut scaffold`) → Stage 2 Build → gerbang validasi pasar (Adinda sendiri). Jangan lompat stage.

---

## ✅ Konteks terverifikasi

**Satu kalimat:** Gapura mencatat panggilan LLM yang membawa data pribadi Indonesia, lalu membuat laporan **"Catatan Transfer Lintas Batas"** yang dipetakan ke Pasal 161 PP 33/2026. Semua jalan di komputer sendiri.

**Kenapa ide ini menang di riset (skor 63; Tirai tumbuh 57; "telepon pulang" 54):**
- Ada tanggal hukum yang pasti. PP 33/2026 ditetapkan dan diundangkan **16 Jul 2026**. Pasal 225: berlaku **6 bulan** setelahnya, yaitu **16 Jan 2027** ([Deloitte](https://www.deloitte.com/content/dam/assets-zone1/southeast-asia/en/docs/services/legal/2026/sea-id-legal-client-alert-oct2026-en.pdf)). Teks Pasal 225 dan tanggal diundangkan dicek langsung di salinan PP (27 Okt 2026).
- **Pasal 160(3)**: transfer berarti pengendali membuat data pribadi *tersedia* bagi pengendali/prosesor di luar wilayah hukum Indonesia. **Pasal 161 a–g** adalah langkah yang wajib. **Pasal 162(2)h** menyebut *format* data (teks biasa, disamarkan, atau dienkripsi) sebagai bahan penilaian. Itu alasan Gapura mencatat status "disamarkan atau belum". Sumber teks: [salinan PP, halaman 83–84](https://legaltrans.id/downloads/pp-33-tahun-2026-pelindungan-data-pribadi.pdf).
- Celah pasar (dari ±8 pencarian, **bukan jaminan**): Anoman = gateway hosted ([Anoman](https://www.anoman.io/solutions/compliance)); Privasimu dan KRES.ID = platform GRC berbayar ([Privasimu](https://privasimu.com/pricing)); Dativo Talon = open source tapi laporan **GDPR** ([GitHub](https://github.com/dativo-io/talon/)); RoPA = template dokumen. Belum ketemu alat lokal open source yang membaca panggilan LLM nyata untuk Pasal 161. **Cursor: ulangi pencarian singkat di awal dan catat di `docs/EVIDENCE.md`.**

**Yang melemahkan (jangan disembunyikan di README):**
- **Pengawas PDP belum terbentuk** (Sep 2026) ([Bisnis](https://teknologi.bisnis.com/read/20260913/84/2003698/pembentukan-badan-pdp-dipercepat-implementasi-uu-pdp-dinilai-belum-efektif), [CNBC Indonesia](https://www.cnbcindonesia.com/tech/20260916115609-37-768328/lembaga-perlindungan-data-belum-ada-di-ri-padahal-aturannya-sudah-ada)). Belum tentu ada yang mau bayar sekarang. "Lembaga baru efektif 2028" hanya dari satu ringkasan: **[belum terverifikasi]**.
- "Kirim data ke LLM di luar negeri = transfer lintas batas" adalah **analisis**, bukan kutipan hukum. Pendapat hukum resmi **[belum terverifikasi]**. Penulis lain membaca hal sama ([Matthews Wong](https://www.matthewswong.com/id/blog/gr-33-2026-pdp-implementing-regulation-developers/), [Anoman](https://www.anoman.io/solutions/compliance)).
- Salinan PP di atas **sekunder, hasil OCR** (ada salah ketik, mis. "hukuin"). Cek ke sumber resmi (JDIH/peraturan.go.id) **[belum terverifikasi]**.
- Gapura hanya melihat panggilan yang lewat kodenya. Gapura **mencatat dan mendeteksi**. Gapura **tidak membuat siapa pun patuh**.

**Aset yang dipakai ulang: `tirai` (cek 27 Okt 2026).**
- Repo [adindamochamad/tirai](https://github.com/adindamochamad/tirai), npm `@adindamochamad/tirai` **0.2.0** (`latest`), TypeScript, ESM, MIT, **tanpa dependensi runtime**, 0 bintang.
- Ekspor yang relevan: `detectAll(text, options)` → `Match[]` (**setiap Match berisi `value` asli**, jadi Gapura harus langsung membuangnya), `collectMatches`, `PII_TYPES` (`KK, NIK, NPWP, KARTU, TELEPON, REKENING, PASPOR, EMAIL, ALAMAT, NAMA, PLAT`), `isPiiType`, `redact`, `restore`, `Vault`. Opsi: `detectors`, `nikStrict` (default `true`).
- Token Tirai berbentuk `[NIK_1]`, `[TELEPON_1]`, dst. Gapura memakainya untuk mengenali "sudah disamarkan".
- Tirai berbasis aturan (regex + cek), **bukan ML**. Nama hanya terdeteksi jika berlabel (mis. "nama pelapor"). Rincian ada di `docs/detectors.md` Tirai. Tirai tidak mempublikasikan angka akurasi. Gapura juga **tidak boleh**.
- **Cursor: baca repo Tirai sendiri (README, `src/index.ts`, `docs/detectors.md`, tes) sebelum menulis kode.** Impor harus dicoba di Node ≥ 20 sebagai paket npm, bukan disalin.

**Cek nama (27 Okt 2026):** npm `gapura` 404 (bebas), PyPI `gapura` 404, GitHub `adindamochamad/gapura` 404 (bebas). Pencarian `gapura` di GitHub: ±124 repo orang lain (bintang 0–2, aplikasi RT/RW, absensi, dll.); 8 teratas tidak terkait LLM/privasi.
- **Peringatan merek:** `gapura.id` adalah **PT Gapura Angkasa**, perusahaan ground handling bandara. Beda bidang, tapi namanya dikenal. Domain dan merek **belum diperiksa**. Cursor: cek ulang npm dan GitHub hari ini, catat di `docs/EVIDENCE.md`, dan tulis di README bahwa Gapura tidak berafiliasi dengan perusahaan mana pun. Kalau nama npm sudah diambil, usulkan `@adindamochamad/gapura`.

---

## 📄 STAGE 1.5 — PRD satu halaman (Cursor tulis, Adinda setujui)

Tulis **maksimal satu halaman** di `docs/PRD.md` dengan 10 bagian ini. Jangan menambah fitur.

1. **One-liner:** "Gapura: catat ke mana data pribadi mengalir saat aplikasimu memanggil LLM, dan cetak catatannya untuk Pasal 161 PP 33/2026. Lokal, open source."
2. **Pertanyaan insomnia:** "Kalau klien atau auditor minta bukti data pribadi apa yang dikirim ke OpenAI atau Anthropic, aku kasih apa?"
3. **Pengguna & rasa sakit** (persona fiktif, beri label): *Dewi*, lead engineer software house (klien tanya data apa yang masuk LLM, dia tak punya catatan); *Pak Hendra*, konsultan PDP (butuh bahan nyata, bukan tebakan); *Bu Sari*, staf IT dinas/BPR/koperasi (pakai chatbot AI, tak tahu data apa yang keluar).
4. **Scope IN (MVP):** lihat bagian "Bentuk minimal" di bawah.
5. **Scope OUT (DILARANG dibangun, tulis eksplisit di PRD):** lihat daftar di bawah.
6. **Status panggilan (kontrak laporan):** `masked`, `raw`, `mixed`, `clean`, `unchecked` (tabel di bawah).
7. **Acceptance criteria:** tes privasi hijau, laporan memuat 7 butir Pasal 161 a–g dengan label, demo satu perintah, README bisa diikuti orang asing.
8. **Arsitektur:** lihat di bawah.
9. **Data & privasi:** semua lokal, tanpa akun, server, atau telemetri. Data uji sintetis. Tanpa rahasia di repo.
10. **Risiko jujur:** (a) belum ada penegak dan belum ada bukti permintaan, (b) tafsir hukum dan tabel wilayah bisa salah atau basi, (c) hanya melihat panggilan yang lewat kodenya, (d) deteksi berbasis aturan, (e) waktu sempit, (f) pesaing hosted bisa menyusul.

Akhiri PRD dengan **Open questions**, lalu berhenti. Tunggu `lanjut scaffold`.

---

## 🧱 Bentuk minimal yang dikirim dalam 4 hari (Cursor wajib menguji dan membenarkan di `docs/DECISIONS.md`)

**Keputusan awal (boleh diubah kalau bukti percobaan menolaknya):**
- **MUST: `wrapFetch`**, pembungkus `fetch` untuk TypeScript/JavaScript. SDK OpenAI dan Anthropic untuk Node menerima `fetch` kustom **[belum terverifikasi; baca docs SDK masing-masing]**. Alasan: paling kecil, mudah diuji, tanpa proses tambahan, memakai Tirai langsung.
- **MUST: log JSONL lokal** + **CLI `gapura report`** (Markdown dan HTML). PDF = **cetak dari HTML** (stylesheet `@media print` yang diuji). Tanpa generator PDF.
- **MUST: demo satu perintah** dengan server LLM tiruan di `localhost` (tanpa internet, tanpa kunci).
- **SHOULD (Jumat/Sabtu): `gapura proxy`**, proxy HTTP lokal tipis. Aplikasi cukup ganti base URL, jadi jalan untuk Python, PHP, curl. Hanya membaca **body request**. Streaming diteruskan apa adanya.
- **SHOULD (Sabtu): penampil statis** satu halaman: pilih berkas `.jsonl`, laporan tampil di browser, **tanpa upload**. Memakai fungsi laporan yang sama.
- Gapura **mengamati saja**. Gapura tidak mengubah, menahan, atau menyamarkan request. Menyamarkan = tugas Tirai. Gapura mencatat apakah Tirai (atau lainnya) sudah menyamarkan.
- Kalau Gapura error, **aplikasi tetap jalan** (fail-open); error ke stderr **tanpa isi payload**. Catat di DECISIONS.md.

**Urutan potong kalau waktu habis:** penampil statis → proxy. **Jangan pernah dipotong:** tes privasi, label "belum terverifikasi", laporan Pasal 161, README yang bisa diikuti.

### Status panggilan

| Status | Syarat | Arti di laporan |
|---|---|---|
| `raw` | Ada data pribadi asli terdeteksi, tanpa token Tirai | Data pribadi terkirim apa adanya |
| `masked` | Ada token Tirai (`[NIK_1]` dst), tanpa data asli terdeteksi | Terlihat sudah disamarkan sebelum dikirim |
| `mixed` | Keduanya | Sebagian lolos |
| `clean` | Tidak ada data pribadi dan tidak ada token | Tidak terdeteksi apa pun (**bukan** jaminan tidak ada) |
| `unchecked` | Body tak bisa dibaca (stream, multipart, terkompres, terlalu besar) | Tidak diperiksa. Wajib tampil |

### Scope OUT (DILARANG, walau terlihat mudah)
- Layanan hosted, akun, login, dasbor dengan backend, database server, telemetri.
- Nasihat hukum. Klaim "patuh", "sesuai PP 33/2026", "tersertifikasi", "aman".
- Deteksi berbasis ML/LLM (hanya aturan Tirai). **Menyamarkan atau memblokir** request. Pemeriksaan **respons**.
- DPIA, RoPA penuh, dokumen kontrak, penilaian instrumen hukum otomatis.
- Ekstensi browser. Deteksi gambar/PDF/audio. Semua penyedia sekaligus (mulai 6 baris).
- **Hash atau sampel samaran dari data pribadi di log.** Hash polos NIK atau nomor HP bisa ditebak dengan brute force karena ruangnya kecil. Jadi v0.1 hanya menyimpan **jenis dan jumlah**. Catat alasan ini di DECISIONS.md.
- Sertifikasi, audit, atau klaim bahwa tabel wilayah penyedia selalu benar.

---

## 🏗️ Arsitektur yang disarankan

```
gapura/
├─ src/core/    # extract, detect (bungkus Tirai), classify, schema (allowlist), logger, providers
├─ src/wrap/    # wrapFetch
├─ src/proxy/   # SHOULD
├─ src/report/  # pasal161, build, markdown, html (murni, tanpa API Node, agar jalan di browser)
├─ src/cli/     # gapura: report | demo | providers | proxy
├─ data/providers.json · viewer/ (SHOULD) · examples/ (mock-provider, demo, log + laporan contoh)
├─ test/        # deteksi, privasi, snapshot, wrapFetch, tanpa-jaringan
├─ docs/        # PRD, DECISIONS, EVIDENCE, ATM, PASAL-161, PENYEDIA, BATASAN, PITCH, screenshot/
├─ .github/workflows/ci.yml
└─ README.md, README.en.md, PRIVACY.md, SECURITY.md, LICENSE (MIT), CHANGELOG.md
```

Aturan teknis:
- Kunci versi (tanpa `^`), commit lockfile. Dependensi runtime: **hanya `@adindamochamad/tirai@0.2.0`** (cek `npm view` dulu).
- **Pengambilan teks:** jalan di semua **nilai string** hasil `JSON.parse` body (bukan regex pada body mentah), supaya `messages[].content`, `input`, `contents[].parts[].text`, dan sejenisnya terbaca tanpa kode per penyedia. Lewati string base64 panjang dan catat sebagai batas. Body non-JSON → `unchecked`.
- **Batas:** ukuran maksimum yang diperiksa (default **[tebakan]** 5 MB). Di atas itu → `unchecked`.
- Hasil `detectAll` dipakai hanya untuk **menghitung jenis**, lalu objek `Match` **dibuang**. Jangan simpan, jangan masukkan ke pesan error, jangan `console.log`.
- Log hanya menulis lewat **writer dengan allowlist kunci**. Kunci di luar skema → ditolak (throw di mode tes).
- Berkas log berizin `0600` (POSIX; Windows belum diuji).
- Tidak ada panggilan jaringan oleh Gapura sendiri. Pengecualian: `wrapFetch` meneruskan request ke tujuan asli, dan `proxy` meneruskan ke target yang diatur pengguna.

### Skema log v1 (baris JSONL; hanya kunci ini)
`v`, `id` (acak), `ts` (ISO), `provider` (dari tabel atau `unknown`), `host`, `path` (**tanpa query string**), `model` (hanya jika string pendek dari field `model`), `status` (5 nilai di atas), `pii` (`{"NIK":2,...}` jumlah), `tokens` (`{"NIK":1,...}`), `bytes`, `label` (tujuan, diisi aplikasi, opsional), `region_ref` (rujukan baris tabel penyedia + status verifikasi).
**Tidak pernah disimpan:** isi prompt, isi data pribadi (utuh, sebagian, atau hash), header (termasuk `Authorization`, `x-api-key`), query string (Gemini memakai `?key=`), body respons.

### Tabel penyedia dan wilayah (`data/providers.json` + `docs/PENYEDIA.md`)

Semua sel wilayah **dimulai sebagai `belum terverifikasi`**. Cursor **wajib membuka dokumentasi resmi tiap penyedia**, mengisi wilayah pemrosesan yang **tertulis** di sana, lalu mencatat **kutipan pendek, URL, dan tanggal akses (WIB)** per baris. Kalau tidak bisa dibuka atau tidak jelas, biarkan `belum terverifikasi`. Jangan menebak. Jangan mengisi dari ingatan.

| Penyedia | Host (umum; **verifikasi**) | Wilayah pemrosesan | Titik awal dokumentasi (URL dicek hidup 27 Okt; **isinya belum dibaca**) |
|---|---|---|---|
| OpenAI API | `api.openai.com` | belum terverifikasi | [your-data](https://platform.openai.com/docs/guides/your-data) |
| Anthropic API | `api.anthropic.com` | belum terverifikasi | [data-residency](https://platform.claude.com/docs/en/build-with-claude/data-residency) |
| Google Gemini API | `generativelanguage.googleapis.com` | belum terverifikasi | [terms](https://ai.google.dev/gemini-api/terms) |
| Google Vertex AI | `*-aiplatform.googleapis.com` | belum terverifikasi (bisa dipilih per wilayah, cek) | [data-residency](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/data-residency) |
| Azure OpenAI | `*.openai.azure.com` | belum terverifikasi (tergantung wilayah deployment) | cari di learn.microsoft.com |
| DeepSeek API | `api.deepseek.com` | belum terverifikasi | [docs](https://api-docs.deepseek.com/) |
| `localhost` / `127.0.0.1` / jaringan privat | | tidak keluar mesin (kategori khusus) | |
| Host tidak dikenal | | `unknown`, tampil jelas di laporan | |

Aturan:
- Laporan tampilkan wilayah **hanya** sebagai "menurut dokumentasi penyedia, diakses <tanggal>". Baris `belum terverifikasi` tampil apa adanya.
- Baris yang diverifikasi lebih dari **90 hari** lalu ditandai "perlu verifikasi ulang" **[tebakan angkanya]**. `gapura providers` menampilkan umur tiap baris.
- Pengguna bisa **menimpa** tabel lewat `gapura.config.json` (mis. kontrak khusus, wilayah Azure yang dipilih).
- Tulis di laporan: wilayah dokumentasi **tidak** menjawab sub-prosesor, akses dukungan dari luar negeri, atau lokasi sebenarnya. Pasal 160(3)b memakai kata "membuat tersedia", jadi akses juga penting. Gapura **tidak bisa tahu** lokasi sebenarnya.

### Pemetaan Pasal 161 a–g (kunci di PRD Rabu; isi akhir di `docs/PASAL-161.md`)

Cursor mengutip tiap butir **persis** dari salinan PP (halaman 83, dengan salah ketik OCR dibetulkan dan diberi catatan), lalu memberi label. Usulan awal **[tebakan, putuskan setelah baca teksnya]**:

| Butir | Intinya | Label | Yang diisi Gapura |
|---|---|---|---|
| a | rekam dan petakan siklus transfer + implikasinya | **sebagian** | Tabel: kapan, ke penyedia mana, jenis data apa, jumlah. "Implikasi" = manual |
| b | data cukup, relevan, terbatas sesuai tujuan | **sebagian** | Jenis dan jumlah data yang terkirim, `raw` vs `masked`. Penilaian "cukup/relevan" = manual |
| c | identifikasi instrumen hukum rujukan | **isi manual** | Kolom isian dari `gapura.config.json`, tampil sebagai "diisi pengguna, tidak diperiksa Gapura" |
| d | nilai efektivitas instrumen sebelum transfer | **isi manual** | Kolom isian |
| e | instrumen pelengkap (kontraktual, teknis, organisasional) | **sebagian** | Yang teknis: apakah penyamaran terlihat (`masked`). Kontraktual dan organisasional = manual |
| f | langkah prosedural untuk instrumen pelengkap | **isi manual** | Kolom isian |
| g | evaluasi ulang berkala | **sebagian** | Periode log, tanggal laporan, tanggal tinjau berikutnya (dari config). Pelaksanaannya = manual |

Laporan memuat juga: Pasal 162(2)h (format teks biasa/disamarkan) sebagai konteks, dan daftar "yang **tidak** dicakup".

---

## 🛠️ STAGE 2 — Build (Metode ATM)

### Urutan kerja
1. **Spike (45 menit):** pasang Tirai dari npm di Node ≥ 20, jalankan `detectAll` pada teks sintetis, lihat bentuk `Match`. Tes `wrapFetch` dengan server tiruan. Baca docs SDK OpenAI/Anthropic soal `fetch` kustom (**jangan** panggil API asli). Catat di DECISIONS.md.
2. **ATM** (bawah). 3. `src/core` + **tes privasi lebih dulu**. 4. `wrapFetch`, server tiruan, `gapura demo`. 5. Tabel penyedia dari dokumentasi resmi. 6. Laporan + snapshot + berkas contoh. 7. (SHOULD) proxy, penampil statis. 8. Polish, a11y, Lighthouse, screenshot. 9. README, PRIVACY, SECURITY, CHANGELOG, EVIDENCE. 10. Uji README di lingkungan bersih, siapkan tag `v0.1.0` (**jangan publish ke npm**, itu keputusan Adinda).

Satu commit kecil per langkah. Jalankan tes sebelum commit.

### Fase ATM (wajib sebelum menulis CSS)
1. **Amati** 3–5 referensi, catat 5–10 baris tiap referensi di `docs/ATM.md`: [Exodus Privacy](https://reports.exodus-privacy.eu.org/) (daftar pelacak per aplikasi), [SSL Labs](https://www.ssllabs.com/ssltest/) (ringkasan + detail berlapis), `gov.uk` (bahasa awam), tabel trace di Langfuse/Sentry (padat tapi terbaca), dan satu dokumen resmi Indonesia versi cetak.
2. **Tiru pola, bukan aset:** ringkasan di atas, rincian dilipat, tabel yang bisa dicetak.
3. **Modifikasi** untuk Indonesia: bahasa awam, cocok dicetak A4.
Kalau referensi tidak bisa dibuka, **katakan**, jangan mengarang isinya.

### Manifesto Anti AI-Slop
**Copy:**
- Hindari "revolusioner", "seamless", "empower", "unlock", "powerful", "next-gen", "compliance made easy".
- Kalimat pendek dan konkret. Tulis "mencatat", "terdeteksi", "belum terverifikasi". Jangan tulis "patuh", "aman", "terjamin", "tersertifikasi", "sesuai regulasi".
- Setiap halaman laporan memuat **"Alat bantu catatan, bukan nasihat hukum."**

**Visual & warna:**
- Tanpa gradien ungu-biru, tanpa glassmorphism, tanpa shadcn atau template generik, tanpa grid 3 kartu fitur.
- Palet **batu andesit**: abu hangat gelap, putih tulang, tinta hitam. Aksen: **lumut** untuk `masked`, **bata** untuk `raw`, **ambar** untuk `unchecked` dan `belum terverifikasi`. (Beda dari palet Segel.)
- Status dibedakan dengan **ikon + teks + warna**, tidak pernah warna saja.
- Logo: siluet **gapura candi bentar** (dua sisi simetris, celah di tengah) buatan sendiri dalam SVG. Tanpa stok, tanpa gambar AI generik.

**Layout & tipografi:** laporan adalah **dokumen**, bukan dasbor. Hero README = **tangkapan layar laporan contoh nyata**. Maksimal 2 font, self-host, angka `tabular-nums`, dasar ≥ 16px, cetak A4 rapi tanpa tabel terpotong. Animasi minimal, hormati `prefers-reduced-motion`. Laporan HTML **tanpa permintaan jaringan eksternal** dan jalan dari `file://`.

**Tes 3 detik:** orang asing paham "ini apa" dari baris pertama README dan judul laporan. Skrip di `docs/UJI-3-DETIK.md`.

### Data uji (sintetis saja)
- **Tanpa NIK, nama, HP, atau plat asli.** Pakai pola jelas palsu, mis. NIK `3171010101010000`, HP `0800-0000-0001` (contoh README Tirai), email `contoh@example.test`, "Warga Contoh". Beri komentar `SINTETIS`.
- Aplikasi demo fiktif "Toko Contoh". Penyedia tiruan `mock-llm.localhost`. Kunci palsu untuk tes bocor: `sk-FAKE-DO-NOT-USE`.

---

## 🏁 DEFINITION OF DONE (standar tinggi, semua wajib punya bukti)

"Selesai" berarti **orang asing bisa memakai Gapura hanya dengan mengikuti README**. Tidak ada yang boleh dicoret tanpa bukti di `docs/EVIDENCE.md` (perintah, output, tautan, screenshot).

**A. Bisa dipakai orang asing**
- [ ] Di folder/kontainer bersih, mengikuti README dari nol: instal, **satu perintah demo** (`npm run demo` atau `npx gapura demo`), log tercipta, laporan HTML dan Markdown terbuka. Perintah dan output persis dicatat. Tanpa langkah tersembunyi, tanpa internet, tanpa kunci.
- [ ] README ID + EN: prasyarat dan versi, contoh `wrapFetch`, `gapura report`, `gapura.config.json`, pemecahan galat, bagian **Batasan** jujur. Contoh laporan nyata (HTML + MD) dicommit dan terhubung dari README.

**B. Tes**
- [ ] **Tes deteksi:** tiap jenis (NIK, KK, NPWP, telepon, email, plat, rekening, kartu, paspor, alamat, nama berlabel) di dalam body JSON gaya OpenAI chat, OpenAI responses, Anthropic messages, dan Gemini generateContent. Termasuk string ber-escape, teks panjang, base64 panjang, dan satu set **kasus lolos yang dikenal** (ditulis sebagai batas, bukan angka akurasi).
- [ ] **Tes privasi inti ("tidak ada data asli di log"):** kirim fixture sintetis lewat `wrapFetch` (dan proxy jika ada), lalu baca **semua berkas** di folder log dan stdout/stderr. Gagal jika ada: nilai data pribadi utuh, bentuk ter-normalisasi (digit saja), potongan ≥ 6 karakter dari nilai itu, sepotong teks prompt, header `Authorization`/`x-api-key`, kunci palsu, query string `?key=`. Tes ini juga melewati jalur error (JSON rusak, body stream, body terlalu besar).
- [ ] **Tes allowlist:** writer menolak kunci di luar skema.
- [ ] **Tes tanpa jaringan:** Gapura sendiri tidak membuat request selain meneruskan ke tujuan (server tiruan menghitung request yang masuk).
- [ ] **Tes status:** `raw`, `masked` (token Tirai nyata dari `redact()`), `mixed`, `clean`, `unchecked`.
- [ ] **Snapshot laporan**, ditambah tes bahwa 7 butir Pasal 161 selalu ada dengan label, bahwa peringatan "bukan nasihat hukum" selalu ada, dan bahwa baris `belum terverifikasi` tidak pernah tampil sebagai terverifikasi.
- [ ] **CI hijau** di GitHub Actions: lint, tipe, tes, demo, pemindaian secret, pemeriksaan kata terlarang (lihat D). Tautan run hijau dicatat. Tes jalan dari bersih, bukan hanya di mesin Cursor.

**C. Kualitas terukur**
- [ ] Lighthouse (mobile) **Accessibility ≥ 90** pada laporan HTML contoh (dan penampil jika ada). Simpan laporan di `docs/lighthouse/` dan tulis **angka aslinya**.
- [ ] Screenshot nyata (desktop, cetak A4, lebar HP) di `docs/screenshot/`. Keyboard bisa, kontras AA, laporan terbuka dari `file://` tanpa permintaan eksternal (dibuktikan).

**D. Kejujuran**
- [ ] **Tidak ada klaim yang belum diverifikasi.** CI dan manual: cari "patuh", "comply/compliant", "sesuai PP", "certified", "tersertifikasi", "aman", "100%", "pelopor", "terjamin" di README, UI, laporan, docs. Hapus atau beri bukti.
- [ ] Kutipan Pasal 160/161/162/225 sesuai salinan PP, dengan tautan dan catatan "salinan sekunder".
- [ ] Tabel penyedia: tiap baris punya sumber + tanggal, atau `belum terverifikasi`.
- [ ] `docs/DECISIONS.md`: bentuk minimal (kenapa `wrapFetch`, kenapa proxy SHOULD), fail-open, kenapa tanpa hash, batas ukuran body, hasil spike SDK.
- [ ] `docs/BATASAN.md`: hanya melihat panggilan yang lewat kodenya; mencatat dan mendeteksi, **tidak membuat patuh**; tidak tahu lokasi sebenarnya selain yang didokumentasikan penyedia; deteksi berbasis aturan; respons tidak diperiksa; bukan nasihat hukum; pengawas PDP belum ada.
- [ ] Semua data sintetis. Tanpa rahasia: `.env*`, `.gapura/` ada di `.gitignore`, pemindaian secret hijau dan hasilnya dicatat.
- [ ] MIT, `CHANGELOG.md`, `SECURITY.md`, `PRIVACY.md` (ID+EN), catatan rilis `v0.1.0`, tag.
- [ ] `docs/EVIDENCE.md` lengkap (termasuk cek nama npm/GitHub/merek, pencarian pesaing ulang, dan semua perintah dengan output).

**E. Cursor tidak boleh bilang "selesai"** sebelum checklist 15 poin dijalani **satu per satu dengan bukti**. Kalau satu poin tidak terbukti, katakan jujur poin mana dan kenapa. **Kalau DoD belum penuh Sabtu malam, geser rilis ke Minggu 1 Nov. Jangan menurunkan DoD.**

---

## ✅ Checklist Final (15)

1. [ ] Demo satu perintah jalan dari folder bersih.
2. [ ] Pencatat benar untuk 5 status (tes).
3. [ ] Tes privasi hijau, termasuk jalur error.
4. [ ] Tes tanpa jaringan hijau.
5. [ ] Laporan MD + HTML + cetak A4 diperiksa; contoh dicommit.
6. [ ] Pasal 161 a–g: kutipan cocok, label dan peringatan ada.
7. [ ] Tabel penyedia: sumber + tanggal, atau `belum terverifikasi`.
8. [ ] README ID + EN diikuti dari nol di lingkungan bersih.
9. [ ] Penampil statis jalan, **atau** dicatat jujur dipotong.
10. [ ] CI hijau (lint, tipe, tes, demo, secret, kata terlarang).
11. [ ] Screenshot nyata (desktop, cetak, HP) di README.
12. [ ] Lighthouse a11y ≥ 90 (angka asli); tanpa permintaan eksternal.
13. [ ] LICENSE, CHANGELOG, SECURITY, PRIVACY, tag `v0.1.0`, catatan rilis; **tidak ada klaim terlarang**.
14. [ ] Tautan silang dengan Tirai: tes integrasi (`redact()` Tirai → status `masked`), README Gapura menyebut Tirai, dan draf paragraf untuk README Tirai (Adinda yang commit).
15. [ ] `docs/PITCH.md` (30 detik dan 3 menit, jujur soal batas, tanpa "pelopor" sebelum ada pemakai nyata) + `docs/EVIDENCE.md` lengkap.

---

## 📅 Rencana Rabu–Sabtu (jam kerja realistis, **[tebakan]** ±11 jam total)

Komitmen lain: video Plafon 28–29 Okt, Plafon dikumpulkan 30 Okt, send-hold Qloo dikirim **Sabtu 31 Okt sebelum ±10:45 WIB**. Sabtu **mulai setelah send-hold terkirim**.

| Hari | Jam | Isi | Selesai jika |
|---|---|---|---|
| **Rabu 28 Okt** | ±2 jam malam | PRD satu halaman. Spike Tirai + `wrapFetch` (45 menit). ATM. Kunci pemetaan Pasal 161. Kerangka tabel penyedia. **Adinda mengirim pesan validasi.** Tanpa kode produk. | PRD disetujui, spike tercatat |
| **Kamis 29 Okt** | ±3 jam | `src/core` + tes privasi **lebih dulu**, `wrapFetch`, server tiruan, mulai verifikasi tabel penyedia (3 baris dulu) | Tes deteksi + privasi + tanpa jaringan hijau |
| **Jumat 30 Okt** | ±3 jam, **mulai hanya jika Plafon aman** | `gapura report` MD + HTML + print CSS, snapshot, CLI `demo`, sisa tabel penyedia. Jika sisa waktu: proxy | Demo satu perintah menghasilkan laporan |
| **Sabtu 31 Okt** | mulai ±11:00 WIB | README ID+EN, CI, penampil statis (jika muat), screenshot, Lighthouse, uji README di lingkungan bersih, EVIDENCE, tag | DoD penuh |

**Jumat malam, jika laporan belum jalan:** potong ke "CLI + laporan Markdown" saja (tanpa proxy, tanpa penampil). Jangan potong tes privasi.

---

## 🚦 Sinyal mulai

Cursor, mulai dengan:
1. Ringkas pemahamanmu tentang Gapura dalam **5 baris**.
2. Tanyakan hanya yang belum terjawab: (a) OS Adinda dan versi Node yang terpasang, (b) repo publik atau privat dulu, (c) apakah nama `gapura` di npm masih bebas hari ini (kamu yang cek).
3. Baca repo Tirai dan teks Pasal 160–162, 225, lalu tulis `docs/PRD.md` (satu halaman, Scope OUT eksplisit). **Berhenti** dan tunggu `lanjut scaffold`.

---

## 📌 Aturan penting

- Tidak mengarang data. Label **[tebakan]** / **[belum terverifikasi]**. Kunci versi. Tanpa kunci/`.env` di repo.
- **Log tidak pernah berisi data pribadi asli** (syarat inti, dengan tes).
- Jangan bangun apa pun di Scope OUT. Jangan publish ke npm. Jangan kirim pesan ke siapa pun atas nama Adinda.
- Tanpa klaim "patuh", "sesuai regulasi", "aman", atau "pelopor" tanpa bukti. Kalau ragu, tanya Adinda.

---

## 🧪 GERBANG VALIDASI PASAR (untuk Adinda sendiri, bukan tugas Cursor)

Risiko terbesar: **belum ada bukti ada yang meminta alat ini**, dan pengawas PDP belum ada. Kode tidak bisa menjawab itu. Hanya percakapan.

**Mulai Rabu 28 Okt. Selesaikan 3 percakapan dalam 14 hari (paling lambat Rabu 11 Nov, sebelum mulai kerja 15 Nov):**
1. Satu tim yang memanggil API LLM dengan data pelanggan (software house, startup, tim IT).
2. Satu konsultan atau petugas PDP (saran target dari riset, **belum ada kontak**: [KRES.ID](https://www.kres.id/pp-33-2026-aturan-pelaksana-uu-pdp), [PatuhData](https://patuhdata.id/blog/audit-kepatuhan-pdp), [Ambara Digital](https://ambaradigital.com/layanan/kepatuhan-uu-pdp/)).
3. Satu orang IT dinas, BPR, atau koperasi yang kamu kenal.

Pertanyaan: (1) "Kalau klien/auditor minta bukti data pribadi apa yang dikirim ke OpenAI/Anthropic, sekarang kamu kasih apa?" (2) "Dari laporan contoh ini, apa yang kurang?" (3) "Apa yang membuatmu **tidak** mau memakainya?"

**Draf pesan (belum dikirim; kamu yang kirim):**
> Halo [nama]. Saya bikin alat open source kecil, Gapura, yang mencatat panggilan ke LLM (OpenAI, Claude, dll.) yang membawa data pribadi, lalu membuat catatan transfer lintas batas sesuai Pasal 161 PP 33/2026. Boleh tanya satu hal: kalau klien atau auditor minta bukti itu, sekarang kamu pakai apa? Tidak jualan, hanya cari tahu apakah ini masalah nyata. Terima kasih.

Catat jawaban apa adanya di `docs/VALIDASI-PASAR.md`. Jangan membujuk.

**Aturan keputusan:**

| Hasil | Keputusan |
|---|---|
| **Minimal 1 orang** bilang akan mencoba, atau mau berbagi contoh log nyata | **Lanjut** terbatas: satu pilot kecil, perbaiki yang diminta. Jangan menambah fitur Scope OUT dulu |
| **0 dari 3 tertarik** setelah 14 hari | **Berhenti.** Arsipkan Gapura sebagai portofolio. **Alihkan ke tumbuhkan Tirai** |

Catatan: setelah 15 Nov 2026 kamu kerja penuh di Biologic Technik. Hitung jujur waktu yang tersisa sebelum berkomitmen ke pilot. Jalur uang awal (jasa pasang dan setel untuk tim yang memakai LLM) adalah **[tebakan]**.

---

## 📣 Ide catatan peluncuran LinkedIn (bukan posting jadi)

- Sudut: "Mulai 16 Jan 2027, data pribadi yang dikirim ke LLM luar negeri perlu dicatat dan dipetakan. Saya bikin alat lokal untuk mencatatnya."
- Satu tangkapan layar laporan contoh (data sintetis) + satu kalimat batas: "Alat bantu catatan, bukan nasihat hukum."
- Satu ajakan: konsultan PDP atau engineer diminta memberi masukan atas templat laporan.
- Tautan repo + `v0.1.0`; sebut Tirai sebagai pasangan (penyamaran).
- Jangan tulis "pelopor", "pertama", atau angka pengguna sebelum ada bukti. Kirim setelah ada minimal 1 masukan dari gerbang validasi.
