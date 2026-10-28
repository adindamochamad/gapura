import { defaultLogDir } from "../core/logger.js";
import { loadGapuraConfig } from "../core/config.js";
import { startGapuraProxy } from "../proxy/server.js";

export interface ProxyCliOptions {
  listen?: string;
  target?: string;
  logDir?: string;
  cwd?: string;
}

function parseListen(listen: string): { host: string; port: number } {
  const idx = listen.lastIndexOf(":");
  if (idx <= 0) {
    return { host: "127.0.0.1", port: Number.parseInt(listen, 10) || 8787 };
  }
  return {
    host: listen.slice(0, idx),
    port: Number.parseInt(listen.slice(idx + 1), 10) || 8787,
  };
}

export function printProxyUsage(): void {
  console.log(`Gapura proxy — HTTP lokal, observasi body request

Opsi:
  --listen <host:port>   Default: 127.0.0.1:8787
  --target <origin>      Wajib, mis. https://api.openai.com
  --log <dir>            Folder log JSONL (default: ./.gapura/logs)
`);
}

export async function runProxyCli(
  args: string[],
  cwd = process.cwd(),
): Promise<void> {
  let listen = "127.0.0.1:8787";
  let target: string | undefined;
  let logDir: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--listen" && args[i + 1]) listen = args[++i]!;
    else if (a === "--target" && args[i + 1]) target = args[++i];
    else if (a === "--log" && args[i + 1]) logDir = args[++i];
    else if (a === "--help" || a === "-h") {
      printProxyUsage();
      return;
    }
  }

  if (!target) {
    console.error("gapura proxy: --target wajib");
    printProxyUsage();
    process.exit(1);
  }

  const { host, port } = parseListen(listen);
  const config = loadGapuraConfig(cwd);
  const handle = await startGapuraProxy({
    listenHost: host,
    listenPort: port,
    targetOrigin: target,
    logDir: logDir ?? defaultLogDir(cwd),
    config,
  });

  console.log(`Proxy ${handle.baseUrl} → ${target.replace(/\/$/, "")}`);
  console.log(`Log: ${logDir ?? defaultLogDir(cwd)}`);
  console.log("Tekan Ctrl+C untuk berhenti.");

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => resolve());
    process.on("SIGTERM", () => resolve());
  });
  await handle.close();
}
