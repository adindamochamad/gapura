# Usulan perbaikan upstream Tirai

Gapura **tidak** mengubah paket `@adindamochamad/tirai` di repo ini. Catatan untuk maintainer Tirai:

1. **NIK dengan spasi, strip, zero-width, fullwidth, digit Arab-Indic** — Tirai 0.2.0 sering tidak mengenali; Gapura menormalisasi di sisi Gapura (`normalizeForScan`) sebelum memanggil `detectAll`.
2. **`matches.push(...spread)` di `detect.js:37`** — body padat dapat memicu `RangeError: Maximum call stack size exceeded`. Usulan: push per elemen atau batasi batch.
3. Koordinasi versi: setelah Tirai memperbaiki bentuk NIK, Gapura bisa meninjau ulang normalisasi agar tidak dobel.
