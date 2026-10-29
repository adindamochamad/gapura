# Bukti uji Gapura v0.1.1

Diperbarui 29 Okt 2026 (WIB). Output di bawah dari branch `fix/v0.1.1-review` lokal.

## Gerbang (klon kerja)

```text
npm run typecheck          → exit 0
npm run lint:forbidden     → No forbidden marketing/compliance words found.
npm run lint:secrets       → (exit 0)
npx vitest run             → 17 files, 105 tests passed
npm run build              → exit 0
npm run demo               → gapura-demo-out/ (3 baris log)
npm run verify:pack        → verify-pack: ok
```

Baseline v0.1.0: **72** tes. Setelah perbaikan: **105** tes.

## npm audit

```text
npm audit --omit=dev → found 0 vulnerabilities
```

(Jalankan `npm audit` penuh untuk devDependencies; vitest/esbuild mungkin masih melaporkan celah dev — catat angka saat rilis.)

## Coverage

Jalankan `npm run test:coverage` dan tempel ringkasan `%` Statements/Branches di sini setelah CI lokal (angka berubah per mesin).

## Tag (untuk Adinda, jangan dijalankan agent)

```bash
git tag -a v0.1.1 -m "Gapura v0.1.1 — perbaikan review deteksi, log, wrapFetch, proxy."
git push origin fix/v0.1.1-review --follow-tags
```

## Koreksi klaim lama

- Buffer penuh body besar pada `wrapFetch` v0.1.0: **salah**; v0.1.1 tidak clone+kuras stream.
- Log sebelum hasil fetch: **salah**; v0.1.1 menulis setelah `outcome` diketahui.
- README EN “lengkap”: **salah**; ringkasan singkat saja.
