# Gapura SaaS mockup — design source

Fictional product UI for pitch/demo. Real Gapura remains a local CLI + JSONL logs + HTML report. Do not imply cloud storage of prompts or PII values.

## Must say on every app screen

- Catatan bantu, bukan bukti kepatuhan.
- Bukan pendapat hukum.
- UI language: Indonesian.

## Visual direction (mood, not a copy)

- Untitled UI: gray-25–900, 8–16px radius, xs shadows, status badges.
- Linear / Stripe Dashboard / Vercel: thin sidebar, dense table, 3–4 KPI cards.
- Accent: stone / terracotta `#9A3412` — never generic brand purple, never glassmorphism, never neon cyber.
- Logomark: split candi bentar (two gate posts), 24px, currentColor. Not batik wallpaper.

## Tokens

- Desktop frames: 1440×900
- Sidebar: 240px
- Content: ~1120px
- Font: Inter / system UI
- Background: `#F9FAFB`  Content: `#FFFFFF`  Ink: `#101828`  Muted: `#667085`  Border: `#EAECF0`
- Status: raw `#B42318` · masked `#067647` · mixed `#B54708` · clean `#475467` · unchecked `#667085` (dashed)

## Nav (screens 2–6)

Ringkasan · Log · Laporan · Pengaturan

## Six frames on one canvas, in a row

1. **Masuk workspace** — email field, primary button “Masuk”. Footer: “Log tetap di mesin Anda.” Optional GitHub-style note that this SaaS shell is mock-only.
2. **Ringkasan** — KPI: 3 panggilan, 1 raw, 1 masked, 1 clean. Dummy sparkline. Host list: api.openai.com, api.anthropic.com. Sticky disclaimer badge.
3. **Penjelajah log** — filters as chips. Table columns: Waktu (UTC), Penyedia, Host, Path, Status, PII, Token, Outcome. Highlight the raw row.
4. **Laporan Pasal 161** — accordion a–g with labels otomatis / sebagian / isi manual as in the sample report. Quote PP 33/2026. Pasal 162 (2) h note: Gapura status ≠ encryption.
5. **Pengaturan** — log folder `.gapura/logs`; wrapFetch TypeScript snippet; proxy `127.0.0.1:8787` loopback only; toggle `--deterministic`.
6. **Kosong / pertama kali** — drop zone JSONL; secondary CTA `npm run demo`.

## Dummy rows (sample report)

| Waktu | Penyedia | Path | Status | PII / token |
| --- | --- | --- | --- | --- |
| 2026-10-29T04:00:00.000Z | OpenAI API | /v1/chat/completions | raw | NIK:1 TELEPON:1 EMAIL:1 |
| 2026-10-29T04:00:00.000Z | Anthropic API | /v1/messages | masked | token NIK:1 TELEPON:1 |
| 2026-10-29T04:00:00.000Z | OpenAI API | /v1/chat/completions | clean | — |

Pasal 161 labels: (a)(b)(e)(g) sebagian · (c)(d)(f) isi manual.

## Berkas

- `design/gapura-saas.pen` — buka di [app.pen.dev](https://app.pen.dev/) (File → Open) atau `npx pen interactive -i design/gapura-saas.pen` setelah `npx pen login`
- `design/gapura-saas.html` — artboard 6 layar (ekspor)
- `examples/saas-mockup/index.html` — prototipe klik (implementasi repo)
- `design/gapura-saas.png` — ekspor preview

Share (akun Pen, synced): https://app.pen.dev/s/opy1E7uKhbDyUkSIlFYt8yixQAybZ1qmFv7glRyi8Qw

Agen Pen CLI/web membutuhkan akun; tanpa login, file `.pen` ini ditulis dari skema resmi v2.21.

## Do not

- Purple SaaS gradients, illustrations of people, stock photos.
- Pixel-copy any Dribbble shot.
- Claim Gapura is a live cloud product or legal compliance.
