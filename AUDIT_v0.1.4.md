# Audit Tindak Lanjut — Gapura v0.1.4

Diaudit 29 Okt 2026 ~14:40 WIB. Node v20.19.2. Bukan nasihat hukum dan bukan klaim kepatuhan. Remote tidak diubah.

## Hash
| Ref | Commit |
|---|---|
| tag `v0.1.4` (rilis yang diaudit) | `1335db5845d5c3991461ff70ef17126d6d7e93d5` ✔ (sesuai `1335db5`) |
| tag `v0.1.3` | `ff9a47ff7e606c31ea1486b9fe5e3a256a4da4b5` |
| `origin/fix/v0.1.1-review` | `1335db5…`, sama dengan v0.1.4 ✔ |
| `origin/main` (default branch = `main`) | `a33b733537306ab637c586cc69fbc94d884c03ce`: **masih v0.1.0, belum di-merge** |

## Blocker v0.1.3
| # | Blocker | Status | Bukti |
|---|---|---|---|
| 1 | Viewer ≠ `renderViewerPage()` / XSS | **CLOSED** | `viewer/index.html` sama byte-for-byte dengan `renderViewerPage()` (`===` true). File di dalam tarball `gapura-0.1.4.tgz` juga sama (true). Ada `&quot;`, `&#39;`, `ALLOWED_STATUS`, dan `safeStatus` (`viewer/index.html:484-490,541-542`). Penegakan: tes `test/report-escape.test.ts` "committed viewer/index.html matches generator escape" (`toBe(generated)`) dan `scripts/examples-check.mjs` (exit 1 kalau tidak cocok; output "viewer/index.html matches renderViewerPage()."). **Uji XSS nyata** (headless Chrome, unggah JSONL berisi payload `"><img onerror>`, `<svg onload>`, dan `status:'clean" onmouseover=…'` di status, provider, host, path, pii, dan region): viewer di tarball v0.1.4 menghasilkan 0 elemen dengan atribut `on*`, script tidak jalan, dan status jadi `status-unchecked`. Sebagai pembanding, viewer v0.1.3 **ter-eksploit** (`window.__x=3` lewat onmouseover, 2 atribut `on*` tersuntik). Skrip: `xss.cjs`. |
| 2 | Mutasi M8 | **CLOSED** | `scripts/mutation-check.mjs:71-76` menarget `src/core/bodyExtract.ts` dengan `return extractSafeModelField(parsed);`. `mutation:check`: **14/14 caught**. Pengecekan pola (`:156-176`) membuat run gagal saat pola hilang. Uji negatif: pola M8 saya ubah di salinan, lalu `mutation:patterns` keluar dengan **exit 1** dan pesan "Pola mutasi tidak ditemukan: M8". Script `mutation:patterns` ada di `package.json:38` dan di `.github/workflows/ci.yml:27`. |
| 3 | BATASAN base64 pendek | **CLOSED** | `docs/BATASAN.md:9`: "Base64 pendek (< 200 karakter) … tidak di-decode — NIK … bisa tercatat `clean`." Perilakunya dikonfirmasi: base64 36 karakter berisi NIK menghasilkan `clean`. |

## Non-blocker
| Item | Status | Bukti |
|---|---|---|
| README "catatan bantu bukan bukti kepatuhan" | **DONE** | `README.md:7` |
| README "Belum ada di npm" | DONE | `README.md:5` |
| README merujuk `gapura-0.1.4.tgz` | **OPEN** | `README.md:25` masih `npm install /path/to/gapura-0.1.3.tgz`, padahal `npm pack` menghasilkan `gapura-0.1.4.tgz`. |
| Tes proxy 504 | DONE | Sudah ada sejak v0.1.3: `test/outcome.test.ts:50` "records timeout from slow upstream via proxy" (`"http_status":504`). Ini koreksi atas audit v0.1.3 yang menyebutnya tidak ada. |
| Tes FormData | DONE (baru) | `test/wrapfetch-formdata.test.ts` lulus. |
| Versi `package.json` 0.1.4 | DONE | |
| Dependensi runtime | DONE | `npm ls --omit=dev` dan lockfile non-dev hanya berisi `@adindamochamad/tirai@0.2.0`. |
| `main` belum di-merge | **OPEN** | Default branch masih menampilkan v0.1.0. |

## Regresi
- `npm ci`, build, typecheck, lint:forbidden, lint:secrets: OK.
- Tes: 24 file, **127/127 lulus**.
- `examples:check` OK, `mutation:patterns` OK, `demo --deterministic` rc 0.
- `npm pack`: `gapura-0.1.4.tgz`, 146 file (dist, data, viewer, LICENSE, README). `verify:pack` ok.
- Ulang uji manual:
  - 4,8 MB angka padat: 651 ms, `partial`+`time-budget`.
  - 4,8 MB filler+NIK: `raw/full`, wrapFetch 216 ms.
  - Base64 panjang: `raw` dengan `base64-partial`.
  - Proxy diam: 504 dengan `outcome:"timeout"`.
  - 413: tes lulus.
  - Privasi log: tidak ada Authorization, sk-, query secret, prompt, atau NIK di log ("LEAK? false"). Log demo: 0 kecocokan.
- Diff v0.1.3..v0.1.4 (14 file): **tidak ada perubahan di `src/`**. Yang berubah: viewer, scripts, tes, docs, README, CHANGELOG, CI, versi, dan `AUDIT.md` (audit v0.1.3 ikut ter-commit dengan catatan tindak lanjut, tidak masuk tarball). Tidak ada perubahan yang tidak terduga.

## Verdict
**(1) GitHub Release v0.1.4 (`1335db5`): GO, dengan dua perbaikan kecil yang disarankan.** Ketiga blocker sudah tertutup dan terbukti. Sebaiknya sebelum atau tepat saat rilis: (a) ubah `README.md:25` menjadi `gapura-0.1.4.tgz`, dan (b) fast-forward `main` ke v0.1.4 supaya halaman repo tidak menampilkan v0.1.0. Poin (a) bisa dimasukkan ke rilis v0.1.5 atau ditulis di catatan rilis. Jangan memindahkan tag.

**(2) Demo konsultan PDP: GO.** Viewer kini aman untuk log dari pihak lain. Batasan yang perlu disampaikan lisan:
- Ini catatan bantu, bukan bukti kepatuhan dan bukan pendapat hukum. Kutipan Pasal 161 berasal dari OCR dan belum dicocokkan ke JDIH.
- Base64 di bawah 200 karakter tidak di-decode, jadi bisa tercatat `clean`.
- `time-budget` atau `too-dense` membuat coverage menjadi `partial`. Body terkompres, file, dan stream tidak diperiksa.
- NIK polos dengan tanggal lahir tidak valid bisa tidak terdeteksi tanpa kata "NIK".
- Region penyedia berstatus "belum terverifikasi".
- Alat ini belum ada di npm dan masih versi 0.1.x.

## Sisa perbaikan
1. ~~`README.md:25`: ganti `0.1.3.tgz` menjadi `0.1.4.tgz`.~~ **Selesai** (commit setelah audit). `verify:pack` memeriksa README ↔ versi `package.json`.
2. Merge atau fast-forward `main` ke `1335db5`.
3. Opsional: masukkan uji XSS viewer berbasis browser (seperti `xss.cjs`) ke tes.
