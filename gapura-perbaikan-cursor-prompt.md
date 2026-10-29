# 🔧 Prompt Perbaikan — Gapura v0.1.0 → v0.1.1 (hasil review kritis)

## 🚀 Cara pakai (30 detik)

1. Buka Cursor di **klon lokal repo `gapura`** (bukan folder baru).
2. Buat branch: `git switch -c fix/v0.1.1-review`. Pastikan `git status` bersih dan `git describe --tags` menunjuk `v0.1.0` atau commit sesudahnya.
3. Buka Agent. **Tempel seluruh file ini sebagai pesan pertama.**
4. Cursor **wajib menulis rencana perbaikan pendek dulu** (maks 1 halaman) dan **berhenti**. Baca rencananya.
5. Kalau rencana benar, balas **`lanjut`**. Kalau belum, tulis apa yang salah.
6. Cursor lalu mengerjakan P1 → P5 **berurutan**. Setelah tiap paket ia menjalankan typecheck, lint, tes, demo, melaporkan hasil, lalu menunggu `lanjut` lagi.

> Disiapkan 28 Okt 2026 (WIB) untuk Adinda Panca Mochamad. Dasar: review kritis `gapura-review-v0.1.md` (tag `v0.1.0` = commit `58d68fd`; CI hijau; 72/72 tes lulus di Node 20.19.2).
> Label **[tebakan]** = perkiraan. **[belum terverifikasi]** = belum dicek dari sumbernya. **[terbukti]** = sudah dijalankan dan dilihat hasilnya saat review. Cursor memakai label yang sama.

---

## 🎭 Peran

Kamu **engineer senior yang jujur dan menolak AI-slop**. Tugasmu **memperbaiki temuan review**, bukan menambah fitur. Kamu bekerja untuk Adinda (WIB).

- Jangan klaim sesuatu jalan sebelum kamu menjalankannya dan melihat hasilnya. Tempel **output asli** di `docs/EVIDENCE.md`.
- Kalau file ini bertentangan dengan hasil percobaanmu, **percaya hasil percobaan** dan catat di `docs/DECISIONS.md`.
- **Tulis tes merah dulu**: tes harus **gagal di kode v0.1.0**, lalu hijau setelah perbaikan. Buktikan merahnya (jalankan di `git worktree add ../gapura-v010 v0.1.0` atau commit tes lebih dulu).
- Nomor baris di bawah merujuk **`v0.1.0`**. Setelah kamu mengedit, nomor bergeser. Pakai `git show v0.1.0:<path>` untuk melihat versi asli.
- **Jangan** panggil API LLM sungguhan. **Jangan** pakai kunci API asli. **Jangan** `npm publish`. **Jangan** `git push` dan **jangan** buat tag. Adinda yang melakukannya.
- Semua data **sintetis**: NIK `3171010101010000`, HP `0800-0000-0001`, email `contoh@example.test`, kunci palsu `sk-FAKE-DO-NOT-USE`. Beri komentar `SINTETIS`.

---

## ✅ Konteks terverifikasi (ringkasan review)

**Vonis review:** dasarnya bagus, tapi **belum layak didemokan ke konsultan PDP**. Ada kebocoran privasi nyata, status `clean` yang bisa salah, dan laporan contoh yang menyesatkan.

**Yang sudah benar dan harus tetap benar (kontrak asli, jangan dilanggar):**
- Log hanya berisi **jenis dan jumlah** data pribadi. **Tanpa hash**, tanpa nilai, tanpa potongan, tanpa prompt, tanpa header, tanpa query, tanpa body respons.
- Gapura **mengamati saja**. Tidak mengubah, menahan, atau menyamarkan request. Fail-open: kalau Gapura error, aplikasi tetap jalan.
- Hanya satu dependensi runtime: `@adindamochamad/tirai` (versi dikunci). **Jangan ubah repo Tirai di sini** (lihat P1.7).
- Semua teks: **"Bukan nasihat hukum"**, tidak klaim kepatuhan.
- Berkas log `0600`, folder `0700` [terbukti].
- 6 mutasi kebocoran buatan tertangkap tes [terbukti]. Itu harus tetap begitu.

**Batas review (jangan diklaim lebih):** diuji Node 20.19.2; **tidak** diuji dengan SDK OpenAI/Anthropic asli; **tidak** di Windows; viewer **tidak** dibuka di browser; Pasal 161 dicocokkan ke sumber sekunder, bukan JDIH.

---

## 🧭 Aturan kerja

1. **Langkah 0 (15 menit, paling awal, commit sendiri):** beri label **"eksperimental, jangan dijalankan di jaringan bersama"** pada `gapura proxy` di README, `docs/BATASAN.md`, dan teks `--help`. Ini murah dan mencabut risiko terbesar dulu. Lalu rencanamu dimulai.
2. **Satu paket = satu atau beberapa commit kecil.** Tes merah dulu, perbaikan, tes hijau.
3. **Gerbang tiap paket (stop rule):** jalankan `npm run typecheck`, `npm run lint:forbidden`, `npm run lint:secrets`, `npx vitest run`, `npm run build`, `npm run demo`. Laporkan **hasil asli** (jumlah tes, durasi, ada yang gagal atau tidak). Lalu **berhenti dan tunggu `lanjut`**.
4. Kalau satu paket tidak bisa selesai, tandai **jujur** ("belum selesai: …, kenapa") di laporan dan `docs/BATASAN.md`. Jangan klaim selesai.
5. **Jangan menurunkan tes** (menghapus, melonggarkan batas) untuk membuat hijau. Kalau tes lama salah, jelaskan kenapa di DECISIONS.md.
6. Tulis sederhana: kalimat pendek, bahasa Indonesia awam. Istilah teknis dan kode boleh bahasa Inggris.

**Jalur potong kalau waktu habis [tebakan total 17–24 jam]:** urutan aman = Langkah 0 → P1 → P2 → P3 → P5 (butir 1–8, 12–13) → P4 penuh. Kalau P4 belum selesai, proxy **tetap berlabel eksperimental** dan itu sah. Yang **tidak pernah dipotong:** tes privasi, tes merah dulu, label jujur.

---

# 📦 PAKET KERJA

## P1 — Deteksi: tidak ada `clean` palsu; log ketat secara default
**Severity: TINGGI (T1 + T2).** Usaha **[tebakan]** 4–5 jam.

### Masalah (bukti, semua [terbukti] dengan NIK `3171010101010000`)

| Input | Status di v0.1.0 | Sebab |
|---|---|---|
| Teks biasa ≥200 karakter **tanpa tanda baca** + NIK | `clean` | Dianggap base64: `src/core/extract.ts:1-8` (spasi dibuang dulu, lalu cek `[A-Za-z0-9+/=]`) |
| 666 karakter tanpa tanda baca, lalu `, NIK …` | `clean` | `extract.ts:7` hanya periksa 512 karakter pertama; **satu string utuh dibuang** |
| `NIK 317… NIK 317…` berulang, tanpa koma | `clean` | Sebab sama |
| `{"nik":3171010101010000}` | `clean` | `extract.ts:16` membuang number |
| `{"3171010101010000":"x"}` | `clean` | `extract.ts:22` hanya baca `Object.values` |
| `3171 0101 0101 0000`, `3171-0101-0101-0000`, zero-width (`\u200b`) di antara digit, digit fullwidth `３１７１…`, digit Arab-Indic `١…` | `clean` | Tirai tidak mengenali bentuk itu (`countPiiInText` → `{}`) |
| `GET …/v1/x?nik=3171010101010000` | `clean` | `observe.ts:164-166` mengembalikan body `""`; query tidak dipindai |
| NIK di path `/users/3171010101010000/profile` | `clean` | Path tidak dipindai |
| `{"model":"Budi NIK 3171010101010000"}` | log memuat teks itu | `extract.ts:28-35` (string ≤128 lolos), `observe.ts:99` |
| `https://api.example.com/users/3171010101010000/chat?token=SECRETQ` | log memuat `"path":"/users/3171010101010000/chat"` | `observe.ts:32-34,91`: path ditulis apa adanya untuk host apa pun |
| `appendLogEntry({...entry, secret_prompt:"Budi 3171010101010000"})` | **kunci asing tertulis ke berkas** | `logger.ts:26` (`strictSchema ?? false`), `schema.ts:19-20` (lempar hanya kalau `strict`); allowlist hanya cek **nama** kunci (`schema.ts:13-23`) |
| `[NIK_1]` + NIK berspasi | `masked` | `classify.ts:12-14`: yang tak terdeteksi tidak dihitung |

Kenapa penting: laporan dan pitch bilang "jenis data apa". Pembaca mengira `clean` = kosong. `docs/PRD.md:46` sudah bilang `clean` "bukan jaminan", tapi kalimat itu **tidak muncul di laporan** (`src/report/theme.ts:35` hanya: "Tidak ada yang kebaca"). Dan "Writer menolak kunci di luar skema" (`PRD.md:24`) **tidak berlaku** secara default.

### Perilaku yang wajib setelah perbaikan

**P1.1 Kontrak status baru: `clean` hanya bila pemindaian lengkap.**
- Tambah ke skema log dua kunci allowlist: `coverage` (`"full"` | `"partial"`) dan `reasons` (array kode alasan, dari daftar tertutup di bawah; tanpa teks bebas).
- **`clean` hanya boleh bila `coverage = full`.** Kalau tidak ada PII terdeteksi **dan** pemindaian tidak lengkap → status **`unchecked`** + alasan.
- Kalau PII terdeteksi tapi pemindaian tidak lengkap → status tetap `raw`/`masked`/`mixed`, `coverage:"partial"`. Jumlahnya **batas bawah** (laporan menulis "≥N", lihat P5).
- Daftar kode alasan (enum tertutup, tes memastikan tak ada kode lain): `non-json`, `unsupported-content-type`, `compressed`, `multipart`, `stream-not-inspected`, `too-large`, `base64-skipped`, `number-precision-lost`, `time-budget`, `detector-error`, `too-dense`.
- Body POST kosong dan GET tanpa query: `clean` sah (tidak ada yang dipindai = tidak ada yang lolos).

**P1.2 Heuristik base64 diperbaiki (`extract.ts`).**
- String dianggap base64 **hanya jika**: tidak mengandung spasi/baris baru, panjang ≥ 200, dan **seluruh string** cocok `^[A-Za-z0-9+/_-]+={0,2}$` (bukan 512 pertama). Atau berawalan `data:…;base64,`.
- Teks biasa dengan spasi **tidak pernah** dilewati.
- Setiap string base64 yang dilewati → `reasons` memuat `base64-skipped`, `coverage:"partial"`. (Artinya panggilan yang isinya hanya gambar base64 akan `unchecked`. Itu jujur.)

**P1.3 Semua sumber teks dipindai.** Setiap daun JSON diperlakukan sebagai string untuk dipindai:
- string (nilai), **nama kunci objek**, **number** (`String(n)`; kalau `!Number.isSafeInteger(n)` untuk bilangan bulat besar → `number-precision-lost`, partial), boolean/null dilewati.
- **Query string** URL (kunci dan nilai, setelah decode). Query **dipindai** untuk dihitung, tetapi **tidak pernah disimpan** (kontrak lama tetap).
- **Segmen path** (setelah `decodeURIComponent` yang aman dari error).
- PII di query/path ikut masuk hitungan `pii` dan status (mis. GET tanpa body tapi NIK di query → `raw`).

**P1.4 Normalisasi sebelum deteksi (di Gapura, bukan di Tirai).** Buat `normalizeForScan(text)`:
1. `text.normalize("NFKC")` (fullwidth → ASCII).
2. Ubah digit Unicode kategori `\p{Nd}` (mis. Arab-Indic) ke `0-9`.
3. Buang karakter tak terlihat: `\u200B-\u200D \u2060 \uFEFF \u00AD`.
4. Varian kedua: gabungkan kelompok digit yang dipisah **satu** spasi, `-`, atau `.` (hanya antara kelompok ≥3 digit).

Pindai **teks asli dan varian ternormalisasi**. Hasil per jenis = **maksimum** dari keduanya (bukan jumlah), agar tidak menghitung dobel. **Wajib ada tes negatif** (bukan PII, harus tetap `clean`): `2026-10-28 12:30:45`, nomor invoice `INV-2026-0001234`, `versi 1.2.3.4`, 16 digit yang gagal validasi NIK, ID pesanan `ORD 1234 5678 9012`. Kalau ada yang berubah jadi `raw`, perketat aturan 4. Catat risiko false-positive di `docs/BATASAN.md`.

**P1.5 Field `model` divalidasi.** Hanya tulis `model` bila cocok `^[A-Za-z0-9._:/@-]{1,64}$`, **tanpa** deretan ≥6 digit, dan tanpa temuan PII. Kalau tidak → hilangkan (jangan ganti dengan nilai lain).

**P1.6 Field `path` dibersihkan sebelum ditulis**, untuk **semua** host (provider dikenal maupun tidak):
- Pisah per segmen. Segmen **dipertahankan** hanya bila cocok `^[A-Za-z0-9._:-]{1,40}$` **dan** tanpa deretan ≥6 digit, bukan UUID, bukan token panjang (≥20 karakter campuran huruf-angka), dan tanpa temuan PII. Selain itu diganti `:id`.
- Path Gemini harus tetap utuh: `/v1beta/models/gemini-2.0-flash:generateContent`. Path OpenAI/Anthropic juga: `/v1/chat/completions`, `/v1/messages`.
- Maks 128 karakter total. **Userinfo URL** (`http://user:pass@host`) tidak pernah ikut (cek: `host` hanya `URL.hostname`).
- Tidak pernah ada query.

**P1.7 Allowlist ketat secara default (`logger.ts`, `schema.ts`).**
- `strictSchema` jadi **default `true`**. Opsi baru `onUnknownKey: "drop" | "throw"`. Default **`drop`**: kunci asing dibuang, baris tetap ditulis, stderr hanya menyebut **nama kunci** (tanpa nilai). Tes memakai `"throw"` secara eksplisit.
- Validasi **nilai** per kunci, bukan hanya nama: `pii`/`tokens` = objek dengan kunci dari `PII_TYPES` dan nilai bilangan bulat ≥0; `status` ∈ 5 nilai; `provider`/`host` pola host; `label` (diisi aplikasi) ≤64 karakter, pola aman, tanpa temuan PII; dst.
- **Lapis pertahanan terakhir:** sebelum `appendFileSync`, writer memindai **string hasil serialisasi** dengan deteksi + normalisasi di P1.4. Kalau ada temuan, **buang field penyebabnya** dan catat nama field ke stderr. Tes: entri dengan NIK di `label` tidak pernah tertulis.
- **Jangan ubah Tirai.** Catat usulan perbaikan upstream di `docs/TIRAI-UPSTREAM.md` (deteksi NIK berspasi/berstrip/zero-width/fullwidth; `matches.push(...)` di `detect.js:37` memicu `RangeError` pada body padat). Adinda yang mengurus repo Tirai.

### Reproduksi yang **harus** ditangani (jadikan tes)
Semua lewat `observeHttpRequest({url, method, headers, bodyText, bodyBytes})` dengan `url = https://api.openai.com/v1/x` kecuali disebut lain. `FILL` = `"Mohon ringkas data pelanggan berikut ini agar tim layanan dapat menindaklanjuti keluhan dengan cepat dan tepat "`.

| # | Input | Harapan |
|---|---|---|
| 1 | `{"messages":[{"role":"user","content":FILL.repeat(3)+"Budi Santoso NIK 3171010101010000"}]}` | `raw`, `pii.NIK=1` |
| 2 | `content: "a ".repeat(300)+", NIK 3171010101010000"` | `raw`, `NIK=1` |
| 3 | `content: FILL.repeat(6)+", NIK 3171010101010000"` | `raw` |
| 4 | `{"nik":3171010101010000}` | `raw` |
| 5 | `{"3171010101010000":"x"}` | `raw` |
| 6 | `{"m":"NIK 3171 0101 0101 0000"}`, dengan `-`, dengan `\u200b`, dengan fullwidth, dengan Arab-Indic | semuanya `raw`, `NIK=1` |
| 7 | `GET https://api.openai.com/v1/x?nik=3171010101010000`, body `""` | `raw`; log tidak memuat `nik=` atau angkanya |
| 8 | `https://api.example.com/users/3171010101010000/profile` + body `{"a":1}` | `raw` (PII di path); path di log = `/users/:id/profile` |
| 9 | `{"model":"Budi NIK 3171010101010000","messages":[]}` | `model` tidak ada di log |
| 10 | `{"m":"<base64 NIK>"}` dan `data:text/plain;base64,…` (≥200 karakter) | `unchecked`, alasan `base64-skipped` |
| 11 | `{"hp":628123456789}` | tidak crash. Kalau terdeteksi HP, `raw` |
| 12 | `appendLogEntry({...entry, secret_prompt:"Budi 3171010101010000"})` tanpa opsi | `secret_prompt` **tidak** ada di berkas |
| 13 | `[NIK_1]` + `NIK 3171 0101 0101 0000` | `mixed` (bukan `masked`) |
| 14 | JSON rusak / NDJSON / form-urlencoded / `text/plain` non-JSON | `unchecked` + alasan benar (`non-json` / `unsupported-content-type`) |

### Tes yang ditambah **dulu** (merah → hijau)
- `test/detect-gaps.test.ts` (tabel di atas) + tes negatif P1.4.
- `test/privacy.test.ts`: kasus 8, 9, 12 lewat `wrapFetch` ke mock; baca **semua berkas log** dan pastikan NIK, `SECRETQ`, `Budi` **tidak ada** di mana pun.
- `test/schema.test.ts`: default menolak/membuang kunci asing; nilai tidak valid ditolak; `onUnknownKey:"throw"` melempar.
- **Perbaiki privacy test #1** (`test/privacy.test.ts:39-66`): sekarang **lulus kosong** karena `strictSchema:true` membuat penulisan gagal lalu folder kosong. Tambah `expect(lines.length).toBeGreaterThan(0)` sebelum memindai, supaya tes **gagal** (bukan lulus) bila log tidak tertulis.

---

## P2 — Waktu observer dibatasi; tidak ada baris yang hilang; log setelah hasil diketahui
**Severity: TINGGI (T3).** Usaha **[tebakan]** 3–4 jam. Kerjakan setelah P1 selesai dan `lanjut`.

### Masalah (bukti [terbukti])
Waktu `observeHttpRequest` untuk body padat PII (di thread aplikasi, memblokir **seluruh** event loop):

| Body | Waktu |
|---|---|
| 0,88 MB, 40.000 NIK | 2,1 dtk |
| 0,97 MB, 60.000 alamat ("Jl. …") | 6,6 dtk |
| 0,61 MB, 80.000 email | 7,1 dtk |
| 2,4 MB, 150.000 alamat | 22,7 dtk, lalu `RangeError: Maximum call stack size exceeded` |
| 3,7 MB, 230.000 alamat | 64 dtk, lalu `RangeError` |

- `RangeError` berasal dari `matches.push(...)` di Tirai (`node_modules/@adindamochamad/tirai/dist/detect.js:37`).
- `wrapFetch.ts:52-55` menelan error lalu meneruskan request. **Tidak ada baris log**, bahkan tidak ada `unchecked`. Panggilan dengan PII terbanyak paling mungkin hilang.
- `docs/DECISIONS.md:26-29` bilang biaya ≈ min(ukuran body, batas). **Salah** untuk body padat. Gerbang 5 MB tidak melindungi.
- Log ditulis **sebelum** request dikirim (`wrapFetch.ts:51` lalu `:56`). Skema tak punya hasil. Probe `p12`: request yang dibatalkan (`AbortSignal` sudah aborted ke `http://127.0.0.1:9/v1/x`) dan request ke host tak terjangkau **tetap menghasilkan satu baris log** masing-masing, seolah terkirim.
- Kegagalan observer hanya ke stderr. Laporan tak punya penanda. `SECURITY.md:7` menyebut fail-open, tapi README dan `BATASAN.md` tidak.
- `readAllLogLines` (`logger.ts:49-60`) **melempar `SyntaxError`** kalau satu baris terpotong [terbukti, `p11`]. Satu crash saat menulis membuat `gapura report` gagal total.

### Perilaku yang wajib
**P2.1 Anggaran kerja.**
- Pemindaian dipecah per potongan (string > 16 KB dipotong; potongan di batas spasi bila ada, kalau tidak potong keras) dan **memberi giliran ke event loop** (`await` `setImmediate`) di antara potongan. Satu potongan sinkron harus selesai cepat. Ini juga menghindari `push(...)` besar di Tirai.
- Anggaran total per body: `maxScanMs` (default **500 ms** [tebakan]) dan `maxMatches` (default **5.000** [tebakan]) per body. Lewat batas → hentikan, `coverage:"partial"`, alasan `time-budget` atau `too-dense`. Jumlah yang sudah terhitung tetap dicatat sebagai batas bawah.
- Fungsi inti `scanPayload` tetap **deterministik dan sinkron-testable** (anggaran berdasarkan jumlah match/karakter); pembungkus async menambahkan jatah waktu dan yield.
- **Tes lag event loop:** saat memindai body padat 1–2 MB (lihat reproduksi), ukur lag `setInterval(…, 10)` maksimum. Ambang **< 150 ms** [tebakan; longgar agar CI tak flaky; catat angka asli lokal].
- Dokumentasikan batas "data yang kebetulan terbelah di batas potongan bisa terlewat" di `docs/BATASAN.md`.

**P2.2 Tidak ada kegagalan diam-diam.** Tangkap **semua** error pemindaian (termasuk `RangeError`). Jangan menelannya. Tulis **satu baris** `unchecked` dengan alasan `detector-error` (atau `time-budget`/`too-dense`). stderr hanya memuat **kode alasan dan nama kelas error**, tidak ada isi payload atau pesan error yang bisa memuat data.
- Kalau penulisan log sendiri gagal (disk penuh, izin), itu tetap ke stderr dengan hitungan; dokumentasikan bahwa itu satu-satunya jalur kehilangan baris.

**P2.3 Log ditulis SETELAH hasil diketahui.** Skema log naik ke **`v: 2`** dengan kunci allowlist baru: `outcome` (`"ok"` | `"http_error"` | `"network_error"` | `"aborted"`) dan `http_status` (bilangan atau tidak ada).
- `ok` = ada respons 2xx/3xx. `http_error` = respons ≥400. `network_error` = fetch menolak (DNS, koneksi). `aborted` = `signal` membatalkan.
- Entri `network_error`/`aborted`/`http_error` **tetap dicatat dengan hasilnya**. Jangan sebut "terkirim". Laporan menulis: "data mungkin sebagian terkirim; bukan transfer pasti".
- Penulisan log **tidak boleh menunda** pengembalian respons ke aplikasi (jalan di latar, tetapi memakai `appendFileSync` kecil dan tetap ditulis walau proses akan keluar; uji bahwa baris ada setelah `await` respons selesai + satu tick).
- Pembaca laporan menerima baris **v1** (tanpa `outcome` → tampil "tidak dicatat (v0.1)") dan **v2**.

**P2.4 Pembaca log tahan baris rusak.** `readAllLogLines` melewati baris yang gagal diparse dan **menghitungnya** (`corrupt_lines`). Laporan menampilkan: "N baris log rusak dilewati". Jangan crash.

**P2.5 Fail-open: sengaja, terdokumentasi.** Tulis di `docs/DECISIONS.md`, `BATASAN.md`, dan README: kalau Gapura error, aplikasi tetap jalan; panggilan itu tercatat `unchecked` dengan alasan; satu-satunya jalur baris hilang = penulisan log gagal. **Jangan** tambah saklar fail-closed. Itu bertentangan dengan "mengamati saja" dan di luar scope. (Cursor boleh mengusulkan alasannya di rencana kalau tidak setuju.)

### Reproduksi (jadikan tes)
- Body dense (tes mengecil ukuran bila perlu; **buktikan lebih dulu di v0.1.0 bahwa >1 dtk atau RangeError**): `{"messages":[{"role":"user","content":"NIK 3171010101010000 ".repeat(40000)}]}`; `"Jl. ".repeat(250000)`; `"a@b.cd ".repeat(80000)`; `"Jl. ".repeat(600000)` untuk memicu `RangeError` (~2,4 MB, 150.000 alamat) di v0.1.0.
- `wrapFetch(fetch,{logDir})("http://127.0.0.1:9/v1/x",{method:"POST",body:'{"a":1}',signal:abortedSignal})` → melempar `AbortError` **dan** satu baris `outcome:"aborted"`.
- `wrapFetch(...)("http://127.0.0.1:9/v1/y", …)` (port tertutup) → melempar **dan** satu baris `outcome:"network_error"`.
- Server mock yang membalas 500 → `outcome:"http_error"`, `http_status:500`.
- File log dengan satu baris terpotong `{"v":1,"id":"trunc` → laporan tetap jadi, `corrupt_lines:1`.

### Tes yang ditambah dulu
`test/observer-budget.test.ts` (lag, `too-dense`, `detector-error` memakai fungsi detektor yang disuntik melempar `RangeError`), `test/outcome.test.ts`, `test/logger-corrupt.test.ts`.

---

## P3 — `wrapFetch` transparan, tanpa buffer penuh
**Severity: TINGGI (T5).** Usaha **[tebakan]** 2–3 jam.

### Masalah (bukti [terbukti])
- **Opsi `init` hilang.** `wrapFetch.ts:17-25` membuat `Request`, lalu `baseFetch(request)` (`:56`). Probe `p2`: `fetch(url,{dispatcher, keepalive:true, …})` sampai ke fetch dasar sebagai `init = undefined`. `dispatcher` (undici `ProxyAgent`) hilang. Aplikasi di belakang proxy korporat bisa berhenti tersambung.
- **Upload stream dibuffer penuh.** `observe.ts:173-181` membaca `request.clone()` sampai habis; setelah lewat batas masih menguras sisa stream (`:128-135`). Probe `p4` (server lambat, upload 300 MB): `wrapFetch` → producer sudah menghasilkan **300 dari 300 MB**, RSS +305 MB. `fetch` biasa → producer 5 MB, RSS +4 MB. Ini **membantah** `docs/EVIDENCE.md:64` ("tanpa buffer penuh body besar") dan `DECISIONS.md:23-24`.
- **Stream tak berujung menggantung** sebelum request dikirim: setelah 2 dtk `baseFetch` belum dipanggil (`wrapFetch.ts:39-56`, observasi sebelum kirim).
- **Gerbang `Content-Length` hampir tak pernah aktif:** `new Request(url,{body:"…"}).headers.get("content-length")` = `null`. `test/body-limit.test.ts:14-22` mengisi header itu manual.
- `buildRequest` (`wrapFetch.ts:37`) di luar `try`.

### Perilaku yang wajib
**P3.1 Teruskan `(input, init)` apa adanya.** Fetch dasar menerima **argumen asli yang sama**, tidak dibungkus ulang, tidak dimodifikasi (`dispatcher`, `signal`, `keepalive`, `redirect`, `duplex`, `headers`, dll.). Tes dengan fetch dasar mata-mata: `Object.is(seenInput, input)` dan `Object.is(seenInit, init)`.

**P3.2 Tidak menyentuh body yang tak aman dibaca.**
- Body dibaca **hanya** bila mudah dan ukurannya diketahui: `string`, `Uint8Array`/`ArrayBuffer`/`DataView`, `URLSearchParams`. Ukuran = `byteLength` **sebenarnya** (bukan header).
- `ReadableStream`, `AsyncIterable`, `Blob`/`File`, `FormData` → **tidak dibaca**, status `unchecked`, alasan `stream-not-inspected` (`FormData` → `multipart`).
- Input berupa objek `Request` dengan body → default `unchecked` / `stream-not-inspected`. (Opsional: baca bounded lewat `clone()` dengan batas 5 MB lalu `cancel`, **hanya jika** tes memori membuktikan tidak ada buffer penuh. Kalau ragu, pilih `unchecked`.)
- Jangan pernah `clone()` + kuras. Hapus jalur lama.

**P3.3 Gerbang ukuran (default 5 MB, bisa diatur `maxBodyBytes`).** Body `string`/bytes di atas batas → **tidak dipindai sama sekali** (bukan sebagian), `unchecked`, alasan `too-large`. Tidak ada salinan tambahan. Dokumentasikan angkanya sebagai **[tebakan]**.

**P3.4 Observasi tidak boleh menahan pengiriman.** `baseFetch` dipanggil **segera**; observasi berjalan paralel (anggaran waktu P2). Tes: stream tak berujung → `baseFetch` terpanggil dalam <100 ms.

**P3.5 Respons dan stream dikembalikan apa adanya.** Objek `Response` dari fetch dasar dikembalikan **tanpa dibungkus, di-`clone`, atau dibaca**. SSE/streaming tidak rusak. Tes: server mock SSE mengirim chunk berselang 50 ms; klien menerima chunk pertama < 200 ms sebelum chunk terakhir dikirim.

**P3.6 `AbortSignal` dihormati.** `signal` ada di `init` asli jadi otomatis lewat. Tes: abort saat respons mengalir → promise baca menolak `AbortError`, dan `outcome:"aborted"` tercatat (P2.3).

**P3.7 Cakupan host.** `wrapFetch` mencatat semua fetch yang dibungkus (`wrapFetch.ts:42-51`, tanpa filter host). Tambah opsi `hosts` (daftar yang dicatat) dan `excludeHosts`. Default: catat semua (kompatibel), tapi **path sudah dibersihkan** (P1.6). Dokumentasikan: membungkus `globalThis.fetch` mencatat semua host.

**P3.8 `buildRequest`/observasi** seluruhnya di dalam `try`. Error apa pun → fail-open (P2.2).

### Tes yang ditambah dulu
`test/wrapfetch-transparent.test.ts`:
1. `init` dengan `dispatcher:{marker:"agent"}`, `keepalive:true` → objek yang sama sampai ke fetch dasar.
2. Upload stream 300 MB ke server lambat: producer maju ≤ ~10 MB [tebakan; samakan dengan `fetch` biasa +margin] dan RSS naik <50 MB. (Gunakan 100 MB di CI bila lambat; catat.) Jalankan sebagai proses anak supaya ukuran bersih.
3. Stream tak berujung → `baseFetch` terpanggil <100 ms.
4. `body:"x".repeat(6*1024*1024)` (string 6 MB, **tanpa** header manual) → `unchecked`/`too-large`.
5. SSE dan abort (P3.5, P3.6).
6. Update `body-limit.test.ts`: jangan lagi mengisi `Content-Length` manual.

---

## P4 — `gapura proxy`: label eksperimental, lalu diperkeras
**Severity: TINGGI (T4).** Usaha **[tebakan]** label 15 menit (Langkah 0), perbaikan penuh 4–6 jam. Kerjakan setelah P3.

### Masalah (bukti [terbukti] dengan server lokal, `p5` dan `p6`)
1. **Satu request mematikan proses.** `GET // HTTP/1.1` → `new URL("//", base)` melempar `TypeError`. Panggilan di `src/proxy/server.ts:81`, **di luar `try`**. Output: `TypeError: Invalid URL … ERR_INVALID_URL`, proses keluar `exit=1`.
2. **Relay terbuka (SSRF).** `buildTargetUrl` (`server.ts:41-48`) memakai `new URL(req.url, base)`. `GET //127.0.0.1:PORT/steal` dan absolute-form `GET http://127.0.0.1:PORT/abs` membuat proxy mengambil **host lain**, dengan header `Authorization` klien ikut diteruskan. Tidak ada cek `Host`/`Origin`. `proxyCmd.ts:12-21` menerima host listen apa pun (termasuk `0.0.0.0`) tanpa peringatan.
3. **Respons gzip rusak.** Upstream `content-encoding: gzip`; `fetch` (undici) mendekompres, tetapi proxy menyalin `content-encoding` dan `content-length` asli (`HOP_BY_HOP`, `server.ts:12-22`, tak memuatnya). Klien: status 200 lalu `BODY ERR terminated`. Banyak klien (Python `requests`) mengirim `Accept-Encoding: gzip`, jadi ini mematahkan cerita README "Python, curl".
4. **Body request tanpa batas.** `src/proxy/body.ts:27,31` membaca semua chunk ke memori. Gerbang 5 MB hanya memengaruhi pemindaian, bukan memori. (Angka 200 MB → ~1 GB RSS di probe adalah **[tebakan kasar]** karena satu proses dengan klien.)
5. **Redirect diikuti diam-diam.** `server.ts:117` memakai `fetch` tanpa `redirect:"manual"`. Upstream 302 → klien melihat 200, host kedua **tidak tercatat**. Untuk 307/308 body dikirim ulang ke host lain.
6. **Abort tidak diteruskan.** Klien membatalkan SSE, koneksi upstream tetap terbuka (`slowAborted=false`). Tak ada timeout/`AbortController` (`server.ts:117-142`). `res.write` (`:139`) mengabaikan backpressure.
7. Hanya 2 tes proxy (`test/proxy.test.ts:50-91`): jalur normal dan log gagal.

### Perilaku yang wajib
**P4.1 Label eksperimental** (Langkah 0) tetap sampai semua P4.x di bawah **lulus tes**. Setelah lulus, ubah label jadi "beta, hanya loopback" dan jangan klaim "aman".

**P4.2 Satu target tetap.** `--target <origin>` wajib, satu saja (http/https, tanpa userinfo). **Tidak pernah** ada pemilihan host per request.
- Bangun URL upstream dari `target.origin` + `pathname` + `search` hasil parse `req.url` terhadap placeholder, **lalu cek** `result.origin === target.origin`. Selain itu → 400.
- Tolak `req.url` yang bukan diawali tepat satu `/` (`//host`, `//`, `/\host`, absolute-form `http://…`, `*`, authority-form `CONNECT`). → **400**, tanpa meneruskan.
- Bungkus **seluruh handler** dengan `try/catch`. Error → 400/502 generik **tanpa stack dan tanpa isi**. Proses **tidak pernah mati** karena input klien. (Jangan pakai `process.on("uncaughtException")` sebagai tambalan.)
- `Upgrade`/WebSocket dan `CONNECT` → 501. URL > 8 KB → 414.

**P4.3 Hanya loopback.**
- Default listen `127.0.0.1`. `--listen` selain loopback (`127.0.0.0/8`, `::1`, `localhost`) **ditolak** kecuali ada flag eksplisit `--allow-non-loopback`, yang menulis peringatan keras ke stderr.
- Cek `Host` header: hanya `127.0.0.1:PORT`, `localhost:PORT`, `[::1]:PORT` (anti DNS rebinding). Ada `Origin` header → **403** (halaman web di browser tidak boleh memakai proxy ini).
- Peringatan jika `--target` bukan host di tabel penyedia atau loopback (tetap boleh; hostnya akan berlabel `unknown`).

**P4.4 Streaming murni, ganti `fetch` dengan `http.request`/`https.request` + `stream.pipeline`.**
- Body respons diteruskan **byte demi byte tanpa diubah**: `content-encoding` dan `content-length` tetap benar karena isinya tidak didekompres. Tes gzip: klien `Accept-Encoding: gzip` menerima respons yang bisa didekompres dengan benar.
- Header hop-by-hop dibuang di kedua arah: `connection`, `keep-alive`, `proxy-authenticate`, `proxy-authorization`, `te`, `trailer`, `transfer-encoding`, `upgrade`, plus nama yang tercantum di `Connection`. `Host` diganti ke host target.
- Backpressure ditangani `pipeline`. Body request **tidak dikumpulkan penuh**: salin chunk ke buffer pemindai **hanya sampai 5 MB** (`maxBodyBytes`), lalu berhenti mengumpulkan (status `unchecked`/`too-large`) tetapi terus meneruskan. Memori proses tetap terbatas.
- Request body bergzip (`Content-Encoding` di request) → `unchecked`/`compressed`.

**P4.5 Redirect tidak diikuti.** Respons 3xx diteruskan apa adanya ke klien. Log mencatat `http_status` 3xx. **Jangan** pernah mencatat header `Location`. BATASAN: panggilan klien berikutnya ke host lain tidak lewat proxy, jadi tidak terlihat.

**P4.6 Abort dan timeout.**
- Klien memutus (`res.on("close")` tanpa `finish`) → `upstreamReq.destroy()` **segera**; `outcome:"aborted"`.
- Timeout menunggu header respons: default **60 dtk** [tebakan], `--timeout-ms`. Timeout idle socket untuk SSE: default **120 dtk** [tebakan]. Timeout → 504, `outcome:"network_error"`.
- Log ditulis **setelah** hasil diketahui (P2.3).

**P4.7 Privasi di proxy.** Tidak pernah mencatat header (Authorization, `x-api-key`, `Location`) dan query. Path dibersihkan (P1.6). Tes: kirim `Authorization: Bearer sk-FAKE-DO-NOT-USE`, `?key=SECRETQ`, `/users/3171010101010000/chat`; baca semua berkas log dan stdout/stderr proxy; tidak ada satu pun.

### Reproduksi (jadikan tes; semua di loopback, tanpa internet)
1. Soket mentah: `GET // HTTP/1.1` → balasan **400**, lalu `GET /alive` masih **200** (proses hidup).
2. `GET //127.0.0.1:<port server lain>/steal` dengan `Authorization: Bearer client-secret` dan `GET http://127.0.0.1:<port lain>/abs` → **400**; server "EVIL" **tidak menerima hit** sama sekali.
3. Upstream mengirim `gzip` (`"hello hello hello hello"`, `content-encoding: gzip`); klien `fetch` dengan `accept-encoding: gzip` → teks benar.
4. Upstream `302 → http://127.0.0.1:<lain>/redirected`; klien `redirect:"manual"` melihat **302**; server lain **tidak kena**; log punya `http_status:302`.
5. Upstream SSE (`write("data: x\n\n")` tiap 50 ms). Klien abort setelah chunk pertama → server mendeteksi koneksi tertutup dalam < 1 dtk.
6. POST 100–200 MB lewat proxy yang dijalankan **sebagai proses anak** (`gapura proxy`) dengan klien **generator stream** (klien tidak membuffer). RSS **anak** (baca via `ps -o rss= -p <pid>`, lewati tes di non-Linux dengan pesan jelas) naik **< 100 MB** [tebakan].
7. `--listen 0.0.0.0` tanpa flag → keluar dengan pesan jelas. `Host: evil.example` → 400. `Origin: http://evil.example` → 403.

### Tes yang ditambah dulu
`test/proxy-hardening.test.ts` (7 kasus di atas), tambah ke `test/privacy.test.ts` (P4.7).

---

## P5 — Laporan contoh, copy, instalasi, repo
**Severity: SEDANG–TINGGI (S1–S8; wajib sebelum demo ke konsultan).** Usaha **[tebakan]** 3–4 jam.

Bukti ada di bagian "Masalah laporan contoh" dan "Copy". Kerjakan butir 1–8 **urut**, lalu butir 9–16.

### Delapan perbaikan laporan contoh (urut, dari yang tercepat)
1. **Judul netral.** Hapus "Transfer ke luar negeri" (H1 Markdown `markdown.ts`, H1 HTML `html.ts:152`) dan lede "Panggilan LLM yang kena data pribadi Indonesia" (`html.ts:153`). Pakai **"Catatan panggilan LLM"** + subjudul **"Catatan bantu, bukan bukti kepatuhan."** Tambah satu baris: **"Panggilan ke host lokal atau jaringan privat bukan transfer lintas batas dari sisi Gapura."** (Saat ini ketiga baris contoh semuanya `127.0.0.1`, jadi contoh **tidak berisi satu pun transfer lintas batas**.)
2. **Contoh dengan host penyedia nyata di log, tetap tanpa jaringan.** `gapura demo` memakai `wrapFetch` dengan **fetch dasar kustom** yang mengalihkan pengiriman ke mock lokal, sedangkan URL yang diamati adalah `https://api.openai.com/...`, `https://api.anthropic.com/...`, `https://generativelanguage.googleapis.com/...`. Baris minimal: OpenAI `raw`; Anthropic `masked` (token Tirai nyata dari `redact()`); Gemini dengan `?key=SECRETQ` di query (terbukti tidak masuk log); satu `unchecked` ber-alasan (`compressed`); satu host `unknown` (`llm.contoh-internal.example.test`); satu `localhost` dengan keterangan "bukan lintas batas". Tambah satu baris `network_error`/`aborted` agar `outcome` terlihat.
3. **Kolom token dan jumlah.** Tampilkan "PII: NIK 1 / Token: NIK 1, TELEPON 1". Baris `masked` tidak boleh lagi tampil "—" (`markdown.ts:77-88`, `html.ts:81-96`). Pemindaian parsial: "≥N". Tampilkan `reasons` untuk `unchecked` (S2: `skippedReason` dibuang di `observe.ts:102`, sekarang masuk log lewat P1.1).
4. **Perbaiki label wilayah.** Untuk `local`, `unknown`, dan override pengguna, **jangan** pakai "menurut dokumentasi penyedia, diakses …" (`providers.ts:68-77`; probe `p7`: region "Singapura" dari config tampil berlabel dokumentasi). Pakai "diatur pengguna di gapura.config.json" untuk override dan "tidak ada dokumentasi penyedia" untuk lokal. Hapus teks dobel "belum terverifikasi (belum terverifikasi)". Hapus catatan pengembang "Tampil jelas di laporan." yang bocor ke laporan. `local` juga mencocokkan jaringan privat (`10/8`, `172.16/12`, `192.168/16`, `127/8`, `::1`, `*.localhost`); sekarang `192.168.1.10` jadi `unknown` [terbukti]. Tambah keterangan: "Gateway lokal yang meneruskan ke luar tidak terlihat oleh Gapura."
5. **Satu kalimat di bawah status.** `clean` = "tidak terdeteksi, **bukan jaminan**" (salin dari `PRD.md:46`). Tampil di laporan HTML **dan** Markdown, juga untuk `unchecked` dengan alasannya.
6. **Config contoh netral.** `examples/gapura.config.json`: ganti "SCC klausul transfer (contoh)" dengan `"[diisi tim Anda]"`; ganti "Belum dinilai", "Belum ditulis" dan tanggal tinjau "2027-01-16" (sama dengan tanggal berlaku PP) dengan placeholder jelas `"[YYYY-MM-DD, diisi tim Anda]"`. Alasan: SCC istilah GDPR; menurut sumber sekunder ([ppc.land], **[belum terverifikasi]**) Pasal 169 menyebut klausul standar yang **ditetapkan lembaga pengawas**, yang belum ada.
7. **Keluaran contoh deterministik.** Tambah opsi internal `clock` dan `idFactory` (waktu dan UUID tetap, rentang periode sintetis beberapa hari dan **berlabel "data sintetis"**, bukan 21 ms). Contoh di-commit; tes membuktikan menjalankan ulang menghasilkan **berkas identik**.
8. **Halaman "Cara membaca laporan ini"** (untuk konsultan): apa yang dicatat, apa yang **tidak**, arti 5 status + alasan, dan 5 pertanyaan: (1) kolom apa yang kurang untuk Pasal 161? (2) istilah mana yang membingungkan atau berlebihan? (3) apakah label "sebagian / isi manual" masuk akal? (4) apa yang membuat kamu tidak mau memakai ini? (5) data apa lagi yang perlu dicatat? Tanpa klaim hukum.

### Butir tambahan (S3–S8, tes, repo)
9. **`gapura demo` tidak mengubah berkas ber-track** [terbukti: 3 berkas berubah tiap jalan; `demo.ts:17-20` menulis ke `examples/`, menghapus `examples/demo-logs`, menimpa `viewer/index.html` `:61-63`; dari paket terpasang menulis ke `node_modules`]. Baru: `gapura demo --out <dir>` dengan default `./gapura-demo-out/` (relatif cwd, masuk `.gitignore`). `npm run demo` memakai folder sementara. Contoh yang di-commit dibuat lewat `npm run examples:update` (deterministik, butir 7). Tes/CI: setelah `npm run demo`, `git status --porcelain` **kosong**. Tambah langkah CI "contoh yang di-commit == hasil `examples:update`".
10. **Copy: hapus overclaim.**
    - `docs/PITCH.md:7` "PP 33/2026 **menuntut** pencatatan transfer…" → netral: "Pasal 161 PP 33/2026 mengatur langkah untuk transfer data pribadi ke luar wilayah. Gapura membantu mencatat panggilan LLM sebagai bahan, bukan memenuhinya." Ganti semua "**lampiran** Pasal 161" (`README.md:3`, `PITCH.md:7`) menjadi **"catatan bantu"** (tidak ditemukan format lampiran resmi, **[tebakan]**). Cek juga `README.en.md`.
    - `src/report/build.ts:43` "Pasal 165": repo tak punya kutipannya (`docs/PASAL-161.md` hanya 160, 161, 162, 225). Kalau kamu bisa membuka **sumber resmi** (JDIH/peraturan.go.id), kutip persis dengan tautan dan tanggal akses. Kalau tidak, **hapus rujukannya**.
    - `README.md:53,55` "terverifikasi di docs openai-node / anthropic-sdk" → "dibaca di docs SDK, **belum diuji dengan SDK asli**".
    - `README.md:11` "dites di 22 / 26": CI hanya Node 22 (`ci.yml:13-15`); review menjalankan Node 20.19.2 [terbukti]. Tulis hanya yang ada bukti CI/EVIDENCE. Kalau `engines` memperbolehkan Node 20, tambah 20 ke matriks CI. Jangan klaim Node 26 tanpa bukti. Windows: "belum diuji".
    - `BATASAN.md:9` menunjuk "README lengkap" untuk sumber pers pengawas PDP, teks itu tidak ada. Pindahkan tautan Bisnis dan CNBC Indonesia (dari prompt asli) langsung ke `BATASAN.md`.
    - `scripts/check-forbidden-words.mjs:3-12`: `\bpatuh\b` tidak menangkap "kepatuhan"; "aman" dan "100%" tidak diperiksa; `PRD.md` dan `gapura-cursor-prompt.md` dikecualikan (`:17-20`). Perkuat daftar (`patuh`, `kepatuhan`, `comply`, `compliant`, `sesuai PP`, `tersertifikasi`, `aman`, `100%`, `pelopor`, `terjamin`, `pertama`, `menuntut`). Izinkan **kalimat negasi** lewat daftar putih per baris yang eksplisit (mis. "bukan bukti kepatuhan", "tidak klaim kepatuhan"). Hapus pengecualian berkas yang sudah dihapus (butir 12).
11. **Instalasi yang benar-benar jalan** [terbukti: tanpa `prepare`, `dist/` di `.gitignore`; `import "gapura/wrap"` dari proyek lain → `ERR_MODULE_NOT_FOUND`; `npx gapura` di luar repo mencari paket di npm → 404, dan kalau nama diambil orang lain README menjalankan kode orang itu].
    - README tulis tegas: **"Belum ada di npm."** Cara pasang: `git clone …`, `npm ci`, `npm run build`, lalu `npm pack` + `npm install ./gapura-0.1.1.tgz` di proyek lain (atau `npm link`). Hapus `npx gapura …` kecuali di dalam folder repo, atau ganti dengan `node dist/cli/index.js`/perintah `gapura` setelah link.
    - Tambah `scripts/verify-pack.mjs` + langkah CI: `npm pack`, pasang tarball di folder sementara, `import "gapura/wrap"` berhasil, dan `gapura demo --out <tmp>` jalan. Pastikan `files` di `package.json` memuat `dist`, `data`, `viewer`.
12. **Hapus `gapura-cursor-prompt.md` dari repo** (30 KB, memuat skor ide, nama pesaing, calon konsultan KRES.ID/PatuhData/Ambara Digital, rencana jadwal). `git rm`, tambahkan ke `.gitignore`. Beri tahu Adinda bahwa **riwayat git publik masih memuatnya** dan pilihan membersihkan riwayat (`git filter-repo`) ada di tangannya. **Jangan** jalankan itu sendiri. Cek juga `docs/` (PRD, DECISIONS) untuk bahan internal yang sama sebelum dikirim ke konsultan; laporkan, jangan hapus tanpa bilang.
13. **Perbaiki tes tautologis dan lemah.**
    - `test/report.test.ts:38`: pola `not.toMatch(/terverifikasi.*OpenAI.*setara/i)` mustahil cocok dan tes tidak merender baris OpenAI. Ganti: render laporan dengan baris OpenAI `belum terverifikasi`, assert teks itu **ada** dan tidak ada tanggal "diakses" untuk baris itu.
    - `test/privacy.test.ts:96-110` ("tanpa jaringan") hanya menghitung request ke mock. Ganti: spy `net.Socket.prototype.connect` dan `dns.lookup` selama tes, catat semua tujuan, assert **hanya** `127.0.0.1:<port mock>`.
    - Hapus `md.length > 500` sebagai satu-satunya cek; tambah **snapshot** laporan (`toMatchFileSnapshot`) dari contoh deterministik.
    - Tes "Tirai redact → masked" menguji Tirai, bukan Gapura. Biarkan, tapi beri nama jujur.
    - `stress.test.ts` memakai batas longgar `>= 88` dan `>= 1`. Rapatkan ke angka tepat.
14. **Escape HTML.** Laporan HTML sudah aman [terbukti: `<script>`, `<img onerror>`, kutip tidak lolos; `html.ts:27-33` meng-escape `& < > "`]. **Tambah tes regresi** yang memasukkan `<script>`, `<img onerror=…>`, `"`/`'`, dan `</td>` ke `label`, `host`, `model`, `reasons`, `region_ref` lalu memastikan tidak ada elemen/atribut baru di HTML. **Viewer** (`src/report/viewerPage.ts:60-62`) hanya meng-escape `& < >`, sedangkan `esc(e.status)` dipakai di dalam `class="…status-"` (`:113`) → [dibaca, tidak diuji di browser]. Perbaiki: escape juga `"` dan `'`, dan **whitelist** `status`/`outcome` ke nilai yang dikenal sebelum masuk atribut. Tes jsdom atau string-level untuk viewer. Escape `|` di tabel Markdown (`markdown.ts:85-87`).
15. **Waktu.** Markdown menampilkan ISO UTC mentah, HTML menampilkan WIB (`markdown.ts:28-31`). Tampilkan keduanya konsisten: "WIB (UTC+7)" dan ISO UTC di tanda kurung. Nama berkas log tetap tanggal UTC; tulis itu di README.
16. **Rotasi/retensi log** tidak ada → cukup dicatat di `BATASAN.md` ("tidak ada rotasi; hapus berkas manual"). Jangan bangun.

### Tes yang ditambah dulu
`test/report-contract.test.ts` (judul netral, kolom token, "bukan jaminan", tidak ada "menurut dokumentasi penyedia" untuk local/unknown/override, tidak ada "SCC", tidak ada "Pasal 165" tanpa kutipan), `test/report-escape.test.ts`, `test/demo-clean-tree.test.ts`, `test/privacy-no-network.test.ts`.

---

# 🧪 Penutup: mutasi, dokumen, rilis lokal

**Q1 Uji mutasi diulang.** Buat `scripts/mutation-check.mjs`: **salin** repo ke folder sementara (jangan ubah working tree), terapkan satu mutasi, jalankan `npx vitest run`, dan **harapannya gagal**. Mutasi:

| ID | Mutasi |
|---|---|
| M1 | Tambah kunci `preview` berisi body ke entri log |
| M2 | Isi `label` dengan 200 karakter body |
| M3 | Tempel header `Authorization` ke `path` |
| M4 | Tempel query string ke `path` |
| M5 | Nama kunci `pii` berisi nilai asli |
| M6 | `model` diisi potongan pesan |
| M7 (baru) | Matikan sanitasi path (NIK di path lolos) |
| M8 (baru) | Matikan validasi `model` |
| M9 (baru) | `onUnknownKey` default jadi menulis kunci asing |
| M10 (baru) | Kembalikan heuristik base64 lama (512 karakter pertama) |
| M11 (baru) | Matikan normalisasi (spasi/zero-width/fullwidth) |
| M12 (baru) | Kembalikan `clone()` + kuras di `wrapFetch` |
| M13 (baru) | Hapus penanganan `RangeError`/error observer (ditelan lagi) |
| M14 (baru) | Proxy: kembalikan `new URL(req.url, base)` tanpa cek origin |

Semua harus **tertangkap**. Yang tidak tertangkap = tes kurang; tambah tes, jangan hapus mutasi. Tempel tabel hasil asli di `docs/EVIDENCE.md`.

**Q2 Coverage.** Pasang `@vitest/coverage-v8` (versi dikunci, setara vitest), tambah `npm run test:coverage`. Tulis angka aslinya di EVIDENCE.md **tanpa** menjadikannya klaim kualitas. (Review: coverage sebelumnya tidak bisa diukur.) Catat `npm audit --omit=dev` dan `npm audit` (6 celah dev di v0.1.0: 3 sedang, 1 tinggi, 2 kritis, kemungkinan vitest/vite/esbuild [tebakan]). **Jangan** `npm audit fix --force`; catat saja.

**Q3 Dokumen, hanya klaim terverifikasi.**
- `docs/BATASAN.md`: tambahkan (a) **query dan path** dipindai tapi tidak disimpan, dan hanya body **JSON UTF-8** yang dipindai; (b) `clean` = tidak terdeteksi, bukan jaminan; `unchecked` + alasan; (c) log mencatat percobaan **dengan hasilnya**, kemungkinan baris hilang hanya bila penulisan log gagal; (d) fail-open sengaja; (e) pemindaian per potongan bisa melewatkan data yang terbelah di batas; (f) base64, gambar, PDF, audio, body terkompres: `unchecked`; (g) gateway lokal berlabel "tidak keluar mesin" padahal bisa meneruskan ke luar; (h) risiko false-positive normalisasi; (i) proxy: status label, redirect tidak diikuti, tidak ada rotasi log; (j) bagian "belum diuji": SDK asli, Windows, browser viewer, JDIH, tabel wilayah selain Anthropic/Gemini, Node 22/26 selain yang ada di CI.
- `README.md` (dan `README.en.md`): hapus overclaim (P5.10); jelaskan status; "Belum di npm". README EN saat ini 24 baris yang menunjuk ke README ID. **Jangan** klaim "ID dan EN lengkap". Kalau tidak diperluas, tulis jujur.
- `docs/EVIDENCE.md`: **koreksi** klaim yang dibantah review: baris 64 ("tanpa buffer penuh", dulu salah); `DECISIONS.md:23-24` dan `:26-29`; klaim README EN lengkap; screenshot cetak A4 (hanya desktop dan mobile ada); klaim `file://` tanpa permintaan eksternal (bukti hanya Lighthouse via `http.server` + regex; tulis persis itu); "Node 26" (tidak terverifikasi); klaim CI "lint" (tidak ada linter kode; tulis tepat apa yang jalan). Tempel **output asli** semua perintah.
- `docs/DECISIONS.md`: keputusan base64, normalisasi, anggaran waktu, skema v2, fail-open, `onUnknownKey`, Request-object `unchecked`, proxy `http.request`.
- `CHANGELOG.md` entri **v0.1.1** (Diperbaiki/Diubah/Ditambah; sebut skema log v2 dan perubahan perilaku `clean`).
- `package.json` version → **0.1.1**. **Jangan** `npm publish`, **jangan** buat tag, **jangan** push. Siapkan **perintah** yang akan Adinda jalankan: `git tag -a v0.1.1 -m "…"` dan `git push origin fix/v0.1.1-review --follow-tags`, dan tulis di laporan akhir.

---

# 🏁 DEFINITION OF DONE (semua wajib punya bukti di `docs/EVIDENCE.md`)

Tempel **perintah dan output asli**. Poin yang belum terbukti: tulis jujur poin mana dan kenapa.

- [ ] **P1:** 14 kasus reproduksi hijau, **merahnya di v0.1.0 dibuktikan**. `clean` tidak pernah muncul bila `coverage:"partial"` (tes properti: 30 input acak sintetis dengan satu NIK tersembunyi, tidak pernah `clean`). Tes negatif normalisasi hijau. NIK di path/query/`model`/`label`/kunci asing tidak ada di **satu pun** berkas log, stdout, stderr (tes membaca semuanya, **termasuk potongan ≥6 karakter dan bentuk digit saja**). `strictSchema` default; privacy test #1 gagal bila log kosong.
- [ ] **P2:** lag event loop < ambang tertulis (angka asli). Tidak ada `RangeError` ditelan; selalu ada baris `unchecked` ber-alasan. Abort, host tak terjangkau, HTTP 500 tercatat dengan `outcome` benar. Baris rusak tidak merusak `gapura report`.
- [ ] **P3:** `(input, init)` sampai sebagai objek yang sama (`Object.is`). Upload besar tidak dibuffer penuh (angka producer dan RSS asli). Stream tak berujung tidak menggantung. Body >5 MB `unchecked/too-large` tanpa header manual. SSE dan abort lolos.
- [ ] **P4:** 7 kasus proxy hijau; `GET //` tidak mematikan proses; tidak ada hit ke host kedua; gzip utuh; redirect tidak diikuti; abort diteruskan; RSS proses anak terbatas. Label proxy sesuai hasil.
- [ ] **P5:** 8 perbaikan laporan selesai; MD contoh dibaca ulang manual (tempel di EVIDENCE.md); HTML dibuka di browser dan Lighthouse a11y diukur ulang (angka asli). `npm run demo` meninggalkan `git status --porcelain` **kosong**. `npm pack` + instal tarball di folder bersih + `import "gapura/wrap"` berhasil. `gapura-cursor-prompt.md` tidak ada di `git ls-files`. `lint:forbidden` baru hijau.
- [ ] **Penutup:** M1–M14 **semua tertangkap** (tabel asli). Semua perintah gerbang hijau dari **klon bersih**; jumlah tes sebelum (72) dan sesudah dicatat. Coverage dan `npm audit` dicatat. Dokumen diperbarui, versi 0.1.1, **tanpa** publish/tag/push. Tidak ada data pribadi asli atau kunci asli di repo.

---

# 🚫 Jangan lakukan

- **Jangan** tambah fitur: tanpa menyamarkan/memblokir request, tanpa pemeriksaan respons, tanpa ML, tanpa layanan hosted/akun/telemetri/dasbor, tanpa deteksi gambar/PDF, tanpa penyedia baru, tanpa saklar fail-closed, tanpa rotasi log.
- **Jangan** simpan hash, sampel, atau potongan data pribadi di log. **Jangan** simpan header atau query.
- **Jangan** ubah repo Tirai. Catat usulan di `docs/TIRAI-UPSTREAM.md`.
- **Jangan** tulis klaim hukum atau kepatuhan: tidak ada "patuh", "sesuai PP 33/2026", "tersertifikasi", "aman", "terjamin", "100%", "pelopor", "pertama", "menuntut". Selalu "Bukan nasihat hukum".
- **Jangan** menurunkan, menghapus, atau melonggarkan tes agar hijau. **Jangan** klaim selesai tanpa bukti. **Jangan** menebak isi sumber hukum atau dokumentasi penyedia.
- **Jangan** `npm publish`, `git push`, `git tag`, `git push --force`, `git filter-repo`, atau `npm audit fix --force`.
- **Jangan** panggil API LLM sungguhan atau pakai kunci asli. **Jangan** kirim pesan ke siapa pun atas nama Adinda.

---

# 🔭 Setelah ini (bukan tugas Cursor, kecuali disebut)

**Re-review (saya, setelah paket selesai):** ulang probe review terhadap build baru, ulang M1–M14 dari klon bersih, baca ulang laporan contoh/README/BATASAN/PITCH, cek `npm pack` dan `git ls-files`.

**Masih belum terverifikasi setelah v0.1.1 (jangan klaim):**
- Uji dengan **SDK OpenAI/Anthropic asli** (`fetch` kustom).
- **Windows** (izin berkas `0600`, path, `ps` RSS).
- **Viewer di browser** (tes string-level bukan pengganti).
- **Cek Pasal 161 (dan 160, 162, 225) ke sumber resmi JDIH/peraturan.go.id.** Saat ini salinan OCR sekunder.
- **Verifikasi wilayah penyedia:** OpenAI, Vertex, Azure, DeepSeek masih `belum terverifikasi`. Anthropic cocok dengan halaman data-residency; kutipan Gemini benar secara teks tapi soal log pelanggaran, bukan lokasi inferensi.
- Perubahan di **Tirai** untuk bentuk berspasi/berstrip/zero-width/fullwidth dan `push(...)`.

**Gerbang validasi pasar (BUKAN tugas Cursor; Adinda sendiri):** 3 percakapan dalam 14 hari (paling lambat Rabu 11 Nov 2026): (1) satu tim yang memanggil API LLM dengan data pelanggan, (2) satu konsultan atau petugas PDP, (3) satu orang IT dinas/BPR/koperasi. Kirim ke konsultan **hanya setelah** P1–P3 dan P5 selesai: pesannya "ini templat catatan, mohon komentar atas kolom dan istilahnya", **tanpa klaim hukum**. Jangan kirim `docs/` yang memuat PRD atau bahan internal tanpa disaring. Catat jawaban apa adanya di `docs/VALIDASI-PASAR.md`. Kalau 0 dari 3 tertarik setelah 14 hari: berhenti dan alihkan ke Tirai.

---

# 🚦 Mulai sekarang

Cursor, lakukan ini, lalu **berhenti**:
1. Konfirmasi bahwa kamu di branch `fix/v0.1.1-review` dan `git status` bersih. Jalankan `npm ci`, `npm run typecheck`, `npx vitest run`, lalu laporkan **baseline** (harus 72 lulus).
2. Buat `git worktree` ke tag `v0.1.0` untuk membuktikan tes merah.
3. Tulis **rencana perbaikan maksimal 1 halaman**: Langkah 0, P1–P5, urutan commit, risiko, pertanyaan terbuka (mis. versi Node, apakah `engines` mengizinkan Node 20, apakah kamu setuju `Request`-object jadi `unchecked`).
4. **Berhenti** dan tunggu `lanjut`.
