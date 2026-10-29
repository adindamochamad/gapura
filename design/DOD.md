# DoD mockup pitch Gapura — gerbang penuh

Standar ini **sengaja ketat**. Skor “hampir” tidak dihitung. DoD tertutup hanya jika **semua P0** lulus bukti, bukan estimasi.

Produk rilis Gapura (CLI v0.1.4) **bukan** sasaran gerbang ini. Sasaran: mockup fiksi untuk pitch.

**Catatan bantu, bukan bukti kepatuhan.** Kalimat itu wajib di permukaan mockup.

## Aturan penilaian

- Setiap butir P0 = lulus atau gagal. Tidak ada parsial.
- Bukti = perintah yang bisa diulang, atau URL yang dibuka orang lain tanpa akun Cursor.
- Klaim visual “seperti Dribbble” tidak cukup; harus ada file + pemeriksa otomatis.
- Ungu merek, glassmorphism, atau copy yang menyiratkan kepatuhan hukum = **gagal seluruh DoD**.

Jalankan:

```bash
npm run mockup:check
```

Keluar 0 hanya jika P0 otomatis lulus. P0 manual tetap harus dicentang di bawah sebelum mengumumkan DoD tertutup.

## P0 — wajib (otomatis + manual)

### A. Jujur tentang produk

| ID | Kriteria | Bukti |
| --- | --- | --- |
| A1 | Banner/mockup menyebut **fiksi** dan **bukan** aplikasi cloud rilis | `mockup:check` |
| A2 | Kalimat **bukan bukti kepatuhan** dan **bukan pendapat hukum** ada di prototipe klik | `mockup:check` |
| A3 | Tidak ada kata terlarang pemasaran (`lint:forbidden`) di `examples/` dan `docs/` | `npm run lint:forbidden` |
| A4 | README utama membedakan CLI nyata vs mockup | `mockup:check` |

### B. Cakupan layar

| ID | Kriteria | Bukti |
| --- | --- | --- |
| B1 | Enam permukaan: Masuk, Ringkasan, Log, Laporan, Pengaturan, Mulai | `mockup:check` |
| B2 | Pasal 161 **(a) sampai (g)** di prototipe klik **dan** artboard HTML | `mockup:check` |
| B3 | Catatan Pasal 162 (2) h: status ≠ enkripsi | `mockup:check` |
| B4 | Data dummy 2026-10-29, tiga baris raw / masked / clean, host OpenAI + Anthropic | `mockup:check` |
| B5 | Mark candi bentar (dua tiang) dan aksen `#9A3412` / `#9a3412` | `mockup:check` |

### C. Perilaku (bukan screenshot mati)

| ID | Kriteria | Bukti |
| --- | --- | --- |
| C1 | Hash route: `#masuk` `#ringkasan` `#log` `#laporan` `#pengaturan` `#mulai` | `mockup:check` + klik manual |
| C2 | Filter status log menyembunyikan baris | klik: chip raw hanya 1 baris |
| C3 | Input berkas JSONL menampilkan nama file (tanpa unggah jaringan) | klik |
| C4 | Viewport sempit: sidebar tidak merusak tabel (scroll/stack) | resize ~390px |
| C5 | Keyboard: Tab ke Masuk, Enter mengirim ke app | manual — lihat § Bukti manual |

### D. Desain sumber

| ID | Kriteria | Bukti |
| --- | --- | --- |
| D1 | `design/DESIGN.md` + `design/gapura-saas.pen` + `design/gapura-saas.html` ada | `mockup:check` |
| D2 | Tautan pen.dev di README mockup; canvas berisi 6 frame (buka URL, Shift+1) | manual — lihat § Bukti manual |
| D3 | Artboard HTML memuat (a)–(g), bukan berhenti di (e) | `mockup:check` |

### E. Repositori & orang lain

| ID | Kriteria | Bukti |
| --- | --- | --- |
| E1 | `npm run mockup:check` di CI (`main` / PR) | `.github/workflows/ci.yml` |
| E2 | `npm run mockup` membuka HTML di macOS, Linux (`xdg-open`), atau Windows | `scripts/open-mockup.mjs` |
| E3 | Perubahan mockup **ter-commit dan ter-push** ke remote yang diumumkan | `git status` bersih untuk jalur mockup |
| E4 | Orang tanpa clone bisa buka **URL HTTPS** prototipe, **atau** `design/DOD.md` memuat alasan tertulis “lokal saja” yang disetujui maintainer | § E4 di bawah (lokal saja) |
| E5 | `npm test` tetap hijau (regresi CLI) | `npm test` |

## P1 — mutu (wajib untuk mengumumkan “matang”, bukan P0 otomatis)

| ID | Kriteria |
| --- | --- |
| P1-1 | Kontras teks memenuhi penggunaan indoor; badge raw/masked terbaca |
| P1-2 | Tidak menjiplak shot Dribbble |
| P1-3 | `theme.ts` / viewer produksi **tidak** diubah demi mockup |
| P1-4 | Bahasa UI Indonesia; tidak ada lorem ipsum |

## Yang sengaja di luar DoD ini

- Backend, auth cloud, npm publish, pengganti CLI.
- Pixel-match dengan setiap layer pen.dev (inspector, terminal demo, split-hero).
- Tes browser XSS CI (tetap opsional di audit v0.1.4).

## Bukti manual P0 (2026-10-29)

Prototipe klik: `examples/saas-mockup/index.html` (`npm run mockup` atau `python3 -m http.server --directory examples/saas-mockup`).

| ID | Hasil | Cara ulang |
| --- | --- | --- |
| C1 | **Lulus** | Buka `#masuk`, `#ringkasan`, `#log`, `#laporan`, `#pengaturan`, `#mulai` — tiap hash menampilkan satu permukaan; wiring juga dicek `mockup:check`. |
| C2 | **Lulus** | `#log` → chip **raw** = 1 baris; **Semua** = 3 baris. |
| C3 | **Lulus** | `#mulai` → pilih berkas JSONL → hint `Dipilih di mesin ini: … (tidak diunggah).` |
| C4 | **Lulus** | Viewport ~390×844 → `.shell` kolom, tanpa scroll horizontal; tabel di `.card` dengan `overflow: auto`. |
| C5 | **Lulus** | `#masuk` → Tab ke tombol **Masuk** → Enter (atau submit form) → `#ringkasan`, shell app tampil. |
| D2 | **Lulus** | Share [pen.dev](https://app.pen.dev/s/opy1E7uKhbDyUkSIlFYt8yixQAybZ1qmFv7glRyi8Qw): enam frame top-level `01`–`06` di `design/gapura-saas.pen` dan ringkasan di `design/REVIEW.md`; di app: **Shift+1** untuk overview. |

## E4 — prototipe lokal saja (disetujui maintainer)

Mockup pitch **sengaja tidak** di-host sebagai SaaS publik: produk rilis Gapura adalah **CLI lokal** (v0.1.4). Prototipe fiksi cukup dibuka dari repo (`npm run mockup`) atau artboard statis `design/gapura-saas.html`. Orang tanpa clone tetap bisa melihat desain sumber lewat **share pen.dev** (HTTPS) di atas; perilaku klik memerlukan clone atau server statis lokal — itu diterima untuk gerbang pitch, bukan substitusi produk.

## Status saat gerbang dijalankan

| Tanggal | Commit | P0 otomatis | P0 manual | Catatan |
| --- | --- | --- | --- | --- |
| 2026-10-29 | *(isi setelah push)* | `npm run mockup:check` → 0 | C1–C5, D2, E4 § di atas | E5: `npm test` 127 passed; `lint:forbidden` bersih |

Isi hash commit di baris ini di PR yang mengklaim DoD tertutup. Tanpa itu, klaim ditolak.
