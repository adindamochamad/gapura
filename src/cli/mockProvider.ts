import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export interface MockProviderOptions {
  port?: number;
  host?: string;
}

export interface MockProviderHandle {
  port: number;
  baseUrl: string;
  requestCount: () => number;
  close: () => Promise<void>;
}

export function startMockLlmProvider(
  options: MockProviderOptions = {},
): Promise<MockProviderHandle> {
  let count = 0;
  const host = options.host ?? "127.0.0.1";

  return new Promise((resolve) => {
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      count += 1;
      const chunks: Buffer[] = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            id: "mock-resp",
            object: "chat.completion",
            choices: [{ message: { role: "assistant", content: "ok" } }],
          }),
        );
      });
    });

    server.listen(options.port ?? 0, host, () => {
      const addr = server.address();
      const port =
        typeof addr === "object" && addr ? addr.port : (options.port ?? 3847);
      resolve({
        port,
        baseUrl: `http://${host}:${port}`,
        requestCount: () => count,
        close: () =>
          new Promise((r, j) => server.close((e) => (e ? j(e) : r()))),
      });
    });
  });
}

export function syntheticOpenAiBody(variant: "raw" | "masked" | "clean"): string {
  if (variant === "clean") {
    return JSON.stringify({
      model: "mock-model",
      messages: [{ role: "user", content: "SINTETIS. Tanpa identitas." }],
    });
  }
  if (variant === "masked") {
    return JSON.stringify({
      model: "mock-model",
      messages: [
        {
          role: "user",
          content: "SINTETIS. NIK [NIK_1], HP [TELEPON_1].",
        },
      ],
    });
  }
  return JSON.stringify({
    model: "mock-model",
    messages: [
      {
        role: "user",
        content:
          "SINTETIS. NIK 3171010101010000, HP 0800-0000-0001, email contoh@example.test",
      },
    ],
  });
}

export function packageRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "../..");
}

export function loadExampleConfig(): string {
  return readFileSync(join(packageRoot(), "examples/gapura.config.json"), "utf8");
}
