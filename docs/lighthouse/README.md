# Lighthouse — laporan contoh

Tanggal: **28 Okt 2026 (WIB)**. Target: `examples/sample-reports/laporan-contoh.html` via `python3 -m http.server 8765` (bukan `file://` — Lighthouse membutuhkan origin).

| Berkas | Accessibility |
| --- | --- |
| `laporan-contoh-a11y.json` | **100** |

Perintah:

```bash
npm run demo
python3 -m http.server 8765 --directory .
npx lighthouse http://127.0.0.1:8765/examples/sample-reports/laporan-contoh.html \
  --only-categories=accessibility --output=json \
  --output-path=docs/lighthouse/laporan-contoh-a11y.json
```
