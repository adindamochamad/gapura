# Review mockup Gapura SaaS (fiksi)

**Verdict: GO untuk pitch / PDP**, dengan batasan produk jelas. Bukan GO untuk dijual sebagai aplikasi cloud.

## Sumber

| Sumber | Cakupan |
| --- | --- |
| [pen.dev (synced)](https://app.pen.dev/s/opy1E7uKhbDyUkSIlFYt8yixQAybZ1qmFv7glRyi8Qw) | 6 frame 1440×900, komponen AppSidebar, badge, disclaimer, KPI; split login; log + inspector; Pasal 161 a–g |
| `design/gapura-saas.pen` | Skema v2.21 (backup lokal, lebih ringkas) |
| `design/gapura-saas.html` | Artboard 6 layar sejajar (ekspor / screenshot) |

## Checklist brief (`design/DESIGN.md`)

| Kriteria | pen.dev | HTML artboard |
| --- | --- | --- |
| 6 layar | Ya | Ya |
| Copy disclaimer ID | Ya (bar bawah) | Ya |
| Terracotta #9A3412, bukan ungu | Ya | Ya |
| Candi bentar | Ya (vektor) | Ya |
| Data contoh 2026-10-29 | Ya | Ya |
| Pasal 161 + 162(2)h | Ya (accordion) | (a)–(e) saja di artboard |
| Jujur “log di mesin” | Ya | Ya |

## Celah minor (diterima untuk v1 mockup)

- Iterasi “Let it cook” terakhir gagal 400 (validasi gambar); desain utama sudah selesai.
- Produk nyata tidak punya login cloud — mockup harus tetap berlabel fiksi.
- Laporan HTML/`theme.ts` v0.1.4 tetap Untitled UI; mockup tidak mengganti viewer produksi.

## Implementasi repo

Prototipe **klik** (nav sidebar, tanpa backend): [`examples/saas-mockup/`](../examples/saas-mockup/).

DoD: [`DOD.md`](DOD.md). Jangan klaim “selesai penuh” sebelum `npm run mockup:check` hijau **dan** P0 manual + E3/E4 dicentang.
