# Audit Teknis Independen — Gapura v0.1.3

> **Tindak lanjut (29 Okt 2026):** temuan blocker di commit `ff9a47f` (viewer, M8, BATASAN, `mutation:patterns`) ditutup di **v0.1.4**. Jalankan ulang gerbang audit pada tag `v0.1.4` setelah push.

Diaudit 29 Okt 2026 ~14:20 WIB.

## Hash yang diaudit
| Ref | Commit (git rev-parse) |
|---|---|
| tag `v0.1.3` | `ff9a47ff7e606c31ea1486b9fe5e3a256a4da4b5` (sesuai `ff9a47f`) |
| `origin/fix/v0.1.1-review` | `ff9a47ff7e606c31ea1486b9fe5e3a256a4da4b5` (**identik dengan tag**) |
| `origin/main` | `a33b733537306ab637c586cc69fbc94d884c03ce` (masih v0.1.0, `package.json` 0.1.0; leluhur dari tag, **belum di-merge**) |

**Penting:** perbaikan yang disebut di brief (viewer sync, pola M8, `mutation:patterns` CI, `examples:check` + viewer) **tidak ada di remote**. Kalau sudah dibuat, berarti masih commit lokal yang belum di-push. Yang diaudit di sini hanya isi remote.

## Hasil pipeline (tag = branch)
| Langkah | Hasil |
|---|---|
| `npm ci` | OK |
| `npm run build` / `typecheck` | OK / OK |
| `npm test` | 23 file, **124/124 lulus** (13,9 s) |
| `lint:forbidden`, `lint:secrets` | OK |
| `examples:check` | "examples/sample-reports match deterministic demo." |
| `mutation:patterns` | **Script tidak ada** di package.json |
| `mutation:check` | 13/14 tertangkap. **M8 gagal: "pattern missing"** |
| `demo --deterministic` | OK (rc 0) |
| `npm pack` + `verify:pack` | `gapura-0.1.3.tgz`, 146 file, 64,3 kB, berisi dist/data/viewer/LICENSE/README saja. "verify-pack: ok" |
| Dependensi runtime | `npm ls --omit=dev` dan lockfile (paket non-dev) hanya berisi `@adindamochamad/tirai@0.2.0` ✔ |

## Tabel klaim
| # | Klaim | Status | Bukti |
|---|---|---|---|
| 1 | Body besar 4–5 MB → `unchecked`/`time-budget` < 3 s | **PASS (dengan nuansa)** | `src/core/scanPayload.ts:79-82,127-130`; tes `observer-budget.test.ts:20` "time-budget stops huge payload scan quickly" (<3000 ms, unchecked, partial). Pengukuran saya: 4,8 MB angka padat → 622 ms, `partial`+`time-budget` (status `raw` karena PII sudah ditemukan sebelum budget habis). 4,8 MB teks filler + NIK di akhir → dipindai **penuh dalam ~210 ms**, `raw/full`. Lewat wrapFetch end-to-end 214 ms. Tidak ada kasus "clean setelah puluhan detik". Catatan: `time-budget` hanya muncul pada konten yang mahal dipindai, jadi tidak setiap body 4–5 MB menjadi `unchecked`. |
| 2 | `timeout` terpisah dari `network_error` | **PASS** | `src/core/outcomeFromError.ts:13-17` (TimeoutError, ETIMEDOUT, UND_ERR_CONNECT_TIMEOUT); `wrapFetch.ts:74`; proxy `server.ts:271-276`. Tes `outcome-from-error.test.ts` (4 tes). Proxy 504 **tidak punya tes otomatis**. Saya uji manual (upstream diam, `timeoutMs:500`): HTTP 504, log `"outcome":"timeout","http_status":504`. |
| 3 | `--max-request-bytes`, default 64 MiB, 413 + `http_status` | **PASS** | `src/cli/proxyCmd.ts:33,54-55`; `types.ts:93` `64*1024*1024`; `server.ts:169-174,291-292`; tes `proxy-large-body.test.ts:62` (status 413 dan log berisi `"http_status":413`). |
| 4 | Ekstraksi form/multipart | **PASS (tes FormData tidak ada)** | `src/core/bodyExtract.ts:21` `extractTextsFromFormData`, dipakai di `wrap/bodyForObserve.ts:104-107`. Tes urlencoded dan multipart di `body-extract.test.ts:10,21,43`. Tidak ada tes FormData. Uji manual saya: field teks diekstrak, file part memberi `stream-not-inspected`; urlencoded `NIK+…` menjadi `raw`. |
| 5 | Base64 panjang ≥200 → `base64-partial`, NIK → raw/mixed | **PASS** | `src/core/extract.ts:28` (`<200 → false`), `:65`; tes `detect-gaps.test.ts:128,135`. Manual: base64 300 karakter berisi NIK → `raw`, `partial`, `["base64-partial"]`. |
| 6 | Base64 pendek <200 tidak di-decode, terdokumentasi di BATASAN | **FAIL (dokumentasi)** | Perilakunya benar: base64 36 karakter berisi NIK → `clean/full`. Tapi `docs/BATASAN.md` hanya menyebut "Base64 panjang" (baris 9). **Tidak ada** pernyataan bahwa base64 di bawah 200 karakter tidak di-decode dan bisa tercatat `clean`. |
| 7 | `examples:check` | **PASS** | Output "match deterministic demo". |
| 8 | Viewer ter-commit = `renderViewerPage()` | **FAIL (blocker)** | Output `renderViewerPage()` (dist) dibandingkan dengan `viewer/index.html`: **berbeda mulai byte 13480, baris 485**. File ter-commit tidak meng-escape `"` dan `'`, tidak punya `ALLOWED_STATUS`/`safeStatus`, dan memakai `esc(e.status)` langsung di atribut class. grep `ALLOWED_STATUS\|safeStatus\|&quot;\|&#39;`: file 0, render 6. **File rentan inilah yang masuk tarball** (`package/viewer/index.html`). `viewer.test.ts` hanya mengetes `renderViewerPage()`, tidak membandingkan dengan file. |
| 9 | Mutasi M8 menarget `bodyExtract.ts` | **FAIL** | `scripts/mutation-check.mjs:71-73` masih `file: "src/core/observe.ts"`, `find: "model = extractSafeModelField(parsed);"`. Kode sebenarnya ada di `src/core/bodyExtract.ts:125` `return extractSafeModelField(parsed);`. Hasil: M8 "pattern missing", jadi mutasi itu tidak benar-benar diuji. |
| 10 | Privasi log + fail-open | **PASS** | Tes `privacy.test.ts:34,70`, `stress.test.ts:34,154`. Manual: wrapFetch dengan `Authorization: Bearer sk-…`, query `api_key=SECRETQ`, prompt, dan NIK → log hanya berisi metadata (status, `pii:{"NIK":1}`, bytes, path tanpa query). Regex `SECRET|sk-|<NIK>|lorem|tolong|api_key` = tidak ada kecocokan. Log demo: 0 kecocokan untuk authorization/bearer/sk-/prompt/content/`?`. Fail-open: path log tidak valid → stderr "gapura: log write failed", request tetap diteruskan. |
| 11 | README jujur | **PARTIAL** | Ada "Belum ada di npm" (baris 5), `gapura-0.1.3.tgz` (baris 25), dan "Bukan pendapat hukum" (baris 7). Tidak ada kalimat eksplisit bahwa catatan bantu **bukan bukti kepatuhan**. `LEGAL_DISCLAIMER` juga hanya "Bukan pendapat hukum." Tidak ditemukan oversell (lint:forbidden lulus). |

## Selisih tag vs branch vs main
- Tag dan `fix/v0.1.1-review` identik di `ff9a47f`. Tidak ada perbaikan yang hanya ada di branch.
- `main` tertinggal di v0.1.0 (`a33b733`). Halaman repo default menampilkan README/kode lama, jadi perlu di-fast-forward.
- Perbaikan viewer, M8, dan `mutation:patterns` yang disebut di brief tidak ada di remote mana pun.

## Blocker vs non-blocker
**Blocker (rilis GitHub):**
1. `viewer/index.html` yang ter-commit dan ikut di tarball tidak sinkron dengan `renderViewerPage()` dan tidak punya hardening XSS (klaim 8).
2. M8 tidak teruji, padahal ini disebut sebagai bukti kualitas tes (klaim 9).
3. `main` belum memuat v0.1.3.

**Non-blocker (sebaiknya diperbaiki sebelum rilis):**
- BATASAN belum menyebut base64 pendek (klaim 6). Ini mudah, tapi kalau CHANGELOG/README sudah mengklaimnya, perlakukan sebagai blocker kejujuran.
- README belum menyebut "bukan bukti kepatuhan".
- Belum ada tes otomatis proxy 504 dan tes FormData.
- Belum ada script `mutation:patterns` atau langkah CI yang menggagalkan build kalau pola mutasi hilang.

## Verdict
**(1) GitHub Release v0.1.3: BELUM SIAP (NO-GO)** untuk commit `ff9a47f`. Tarball membawa viewer tanpa hardening XSS dan M8 gagal. Setelah perbaikan di bawah selesai, buat tag baru (mis. `v0.1.4`). Jangan memindahkan tag publik `v0.1.3`.

**(2) Demo konsultan PDP: GO BERSYARAT.** Fungsi inti (deteksi, timeout, 413, privasi log, laporan deterministik) terbukti jalan. Hindari membuka `viewer/index.html` dengan log dari pihak lain, atau jalankan viewer hasil `renderViewerPage()`. Batasan yang perlu disampaikan lisan:
- Ini catatan bantu, bukan bukti kepatuhan dan bukan pendapat hukum. Kutipan Pasal 161 berasal dari OCR dan belum dicocokkan ke JDIH.
- Base64 di bawah 200 karakter tidak di-decode, jadi bisa tercatat `clean`.
- Body yang mahal dipindai bisa berhenti karena `time-budget` (coverage `partial`). Body terkompres, gambar, PDF, file, dan stream tidak diperiksa (`unchecked`).
- NIK tanpa konteks dengan tanggal lahir tidak valid bisa tidak terdeteksi. Dalam uji saya, `3201011234560001` polos tercatat `clean`, tapi dengan kata "NIK" tercatat `raw`.
- Region penyedia berstatus "belum terverifikasi".
- Alat ini belum ada di npm dan masih versi 0.1.x.

## Daftar perbaikan konkret
1. Regenerasi `viewer/index.html` dari `renderViewerPage()`, lalu tambahkan tes yang membandingkan byte-for-byte (`readFileSync('viewer/index.html') === renderViewerPage()`). Masukkan juga ke `examples:check` atau `verify:pack`.
2. Ubah `scripts/mutation-check.mjs` M8 menjadi `file: "src/core/bodyExtract.ts"`, `find: "return extractSafeModelField(parsed);"`. Jadikan "pattern missing" sebagai kegagalan (exit ≠ 0) dan tambahkan `mutation:patterns` ke CI.
3. Tambahkan ke `docs/BATASAN.md`: "Base64 < 200 karakter tidak di-decode; isinya bisa tercatat `clean`."
4. README: tambahkan "Catatan bantu bukan bukti kepatuhan."
5. Tambahkan tes proxy 504 (upstream diam, `timeoutMs` kecil) dan tes FormData di wrapFetch.
6. Push, merge/fast-forward ke `main`, naikkan versi ke 0.1.4, buat tag dan tarball baru, lalu jalankan ulang audit ini pada hash baru.

Skrip uji manual: `m2.mjs`, `m3.mjs`, `m4.mjs`, `p.mjs` di folder ini. Remote tidak diubah.
