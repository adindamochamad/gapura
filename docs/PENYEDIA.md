# Penyedia LLM — wilayah pemrosesan

Data utama: [`data/providers.json`](../data/providers.json).

Aturan:

- Wilayah ditampilkan hanya sebagai “menurut dokumentasi penyedia, diakses &lt;tanggal&gt;” atau **`belum terverifikasi`**.
- Baris diverifikasi &gt;90 hari **[tebakan]** → “perlu verifikasi ulang”.
- Pengguna bisa menimpa lewat `gapura.config.json` → `provider_overrides`.
- Gapura **tidak** menjawab sub-prosesor, akses dukungan luar negeri, atau lokasi sebenarnya.

## Verifikasi 28 Okt 2026 (WIB)

| Penyedia | Wilayah (ringkas) | Kutipan / catatan |
| --- | --- | --- |
| OpenAI | `belum terverifikasi` | [Your data](https://platform.openai.com/docs/guides/your-data) dibaca; retensi endpoint dijelaskan, **bukan** satu wilayah pemrosesan tunggal. |
| Anthropic | global default atau US (`inference_geo`) | “`global`: Inference may run in any available geography”; “`us`: Inference runs only in US-based infrastructure”; workspace geo only `"us"`. [Data residency](https://platform.claude.com/docs/en/build-with-claude/data-residency) |
| Google Gemini API | fasilitas Google di berbagai negara (Paid) | Paid Services: “may be stored transiently or cached **in any country** in which Google or its agents maintain facilities”. [Terms](https://ai.google.dev/gemini-api/terms) |
| Vertex AI | `belum terverifikasi` | Halaman data residency timeout saat fetch otomatis; deployment bisa dipilih — cek manual. |
| Azure OpenAI | `belum terverifikasi` | Tergantung region resource Azure yang dipilih deployer. |
| DeepSeek | `belum terverifikasi` | [API docs](https://api-docs.deepseek.com/) tidak menyatakan wilayah pemrosesan. |
| local | tidak keluar mesin | Host lokal/privat. |

Scaffold awal 28 Okt 2026: baris cloud di atas diisi hanya dari teks docs yang terbaca; sisanya tetap jujur.
