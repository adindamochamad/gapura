#!/usr/bin/env node
import { runDemo } from "./demo.js";
import { runReport } from "./reportCmd.js";
import { runProvidersList } from "./providersCmd.js";
import { printProxyUsage, runProxyCli } from "./proxyCmd.js";

function usage(): void {
  console.log(`Gapura — catat panggilan LLM (lokal)

Perintah:
  gapura demo              Demo satu perintah (mock LLM + laporan contoh)
  gapura report [opsi]     Buat laporan MD/HTML dari log JSONL
  gapura providers         Tampilkan tabel penyedia
  gapura proxy [opsi]      Proxy HTTP lokal (ganti base URL)
  (penampil)               Buka viewer/index.html di browser; pilih .jsonl lokal

Opsi report:
  --log <dir>              Folder log (default: ./.gapura/logs)
  --out <dir>              Folder keluaran (default: ./.gapura/reports)
  --format md|html|both    (default: both)

Opsi proxy:
  --listen <host:port>     (default: 127.0.0.1:8787)
  --target <origin>        Wajib
  --log <dir>              Folder log
`);
}

async function main(): Promise<void> {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd || cmd === "--help" || cmd === "-h") {
    usage();
    process.exit(cmd ? 0 : 1);
  }

  if (cmd === "demo") {
    await runDemo();
    return;
  }

  if (cmd === "providers") {
    runProvidersList();
    return;
  }

  if (cmd === "report") {
    let logDir: string | undefined;
    let outDir = `${process.cwd()}/.gapura/reports`;
    let format: "md" | "html" | "both" = "both";
    for (let i = 0; i < rest.length; i++) {
      const a = rest[i];
      if (a === "--log" && rest[i + 1]) logDir = rest[++i];
      else if (a === "--out" && rest[i + 1]) outDir = rest[++i];
      else if (a === "--format" && rest[i + 1]) {
        const f = rest[++i] as "md" | "html" | "both";
        format = f;
      }
    }
    runReport({ logDir, outDir, format });
    return;
  }

  if (cmd === "proxy") {
    if (rest.includes("--help") || rest.includes("-h")) {
      printProxyUsage();
      return;
    }
    await runProxyCli(rest);
    return;
  }

  console.error(`Perintah tidak dikenal: ${cmd}`);
  usage();
  process.exit(1);
}

main().catch((err) => {
  console.error("gapura:", err instanceof Error ? err.message : "error");
  process.exit(1);
});
