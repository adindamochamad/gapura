import { describe, expect, it } from "vitest";
import {
  SchemaError,
  validateLogEntry,
  dropUnknownKeys,
} from "../src/core/schema.js";
import { appendLogEntry } from "../src/core/logger.js";
import type { LogEntryV1 } from "../src/core/types.js";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const base: LogEntryV1 = {
  v: 1,
  id: "x",
  ts: "2026-10-28T00:00:00.000Z",
  provider: "local",
  host: "127.0.0.1",
  path: "/v1/chat/completions",
  status: "clean",
  pii: {},
  tokens: {},
  bytes: 0,
  coverage: "full",
  region_ref: {
    provider_id: "local",
    processing_region: "tidak keluar mesin (kategori khusus)",
    verification: "test",
    docs_url: null,
    verified_at: "2026-10-28",
  },
};

describe("allowlist writer", () => {
  it("rejects unknown keys in strict mode with throw", () => {
    const bad = { ...base, secret: "nope" } as LogEntryV1 & { secret: string };
    expect(() =>
      validateLogEntry(bad as unknown as LogEntryV1, {
        strictSchema: true,
        onUnknownKey: "throw",
      }),
    ).toThrow(SchemaError);
  });

  it("drops unknown keys by default", () => {
    const bad = { ...base, secret_prompt: "nope" } as LogEntryV1 & {
      secret_prompt: string;
    };
    const cleaned = dropUnknownKeys(bad as unknown as LogEntryV1, {});
    expect((cleaned as Record<string, unknown>).secret_prompt).toBeUndefined();
  });

  it("appendLogEntry drops foreign keys from file", () => {
    const logDir = mkdtempSync(join(tmpdir(), "gapura-schema-"));
    appendLogEntry(
      {
        ...base,
        secret_prompt: "Budi 3171010101010000",
      } as LogEntryV1 & { secret_prompt: string },
      { logDir },
    );
    const content = readFileSync(join(logDir, readdirSync(logDir)[0]!), "utf8");
    expect(content).not.toContain("secret_prompt");
    rmSync(logDir, { recursive: true, force: true });
  });
});
