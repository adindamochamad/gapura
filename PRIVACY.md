# Privasi — Gapura

Gapura berjalan lokal. Tidak ada akun, server Gapura, atau telemetri.

## Yang dicatat

Metadata panggilan HTTP ke LLM: host, path (tanpa query), waktu, status deteksi, **jenis dan jumlah** PII (bukan nilai), token Tirai (jenis×jumlah).

## Yang tidak dicatat

Isi prompt, nilai PII, header (`Authorization`, `x-api-key`), query string, respons API.

## Penyimpanan

Log JSONL di folder yang Anda tentukan (default `./.gapura/logs`), izin file `0600` di POSIX.

## Data uji

Contoh di repo memakai data **SINTETIS** saja.

English summary: see [README.en.md](README.en.md).
