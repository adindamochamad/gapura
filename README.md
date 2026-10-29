# Gapura

Mencatat panggilan LLM yang membawa data pribadi Indonesia, lalu mencetak **catatan bantu** terkait Pasal 161 PP 33/2026. Semua jalan di komputer Anda.

**Belum ada di npm.** Clone repo ini, `npm ci`, `npm run build`, lalu `npm pack` dan pasang tarball di proyek lain (atau `npm link`).

**Bukan pendapat hukum.** Catatan bantu **bukan bukti kepatuhan.** Tidak terkait PT Gapura Angkasa.

Pasangan penyamaran: [@adindamochamad/tirai](https://github.com/adindamochamad/tirai).

## Prasyarat

- Node.js **≥ 20** (CI: Node 20 dan 22; Windows belum diuji)
- npm

## Instal (dari repo)

```bash
git clone https://github.com/adindamochamad/gapura.git
cd gapura
npm ci
npm run build
npm pack
# di proyek lain:
npm install /path/to/gapura-0.1.4.tgz
```

## Demo satu perintah

Tanpa internet, tanpa kunci API:

```bash
npm run demo
```

Menulis ke `./gapura-demo-out/` (log + laporan). Tidak mengubah berkas contoh di repo.

## wrapFetch

```ts
import { wrapFetch } from "gapura/wrap";
import { defaultLogDir } from "gapura";

const fetch = wrapFetch(globalThis.fetch, {
  logDir: defaultLogDir(),
  label: "Aplikasi Contoh",
});
```

OpenAI SDK: opsi `fetch` [dibaca di docs openai-node](https://github.com/openai/openai-node), **belum diuji dengan SDK asli**.

Anthropic SDK: opsi `fetch` [dibaca di anthropic-sdk-typescript](https://github.com/anthropics/anthropic-sdk-typescript), **belum diuji dengan SDK asli**.

## Proxy (Python, curl, dll.)

**Beta, hanya loopback — jangan di jaringan bersama.**

Setelah `npm run build`:

```bash
node dist/cli/main.js proxy --target https://api.openai.com --listen 127.0.0.1:8787
```

## Laporan

```bash
node dist/cli/main.js report --log ./.gapura/logs --out ./.gapura/reports
```

## Batasan

Lihat [docs/BATASAN.md](docs/BATASAN.md).

## Lisensi

MIT — lihat [LICENSE](LICENSE).
