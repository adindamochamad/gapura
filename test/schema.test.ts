import { describe, expect, it } from "vitest";
import { SchemaError, validateLogEntry } from "../src/core/schema.js";
import type { LogEntryV1 } from "../src/core/types.js";

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
  region_ref: {
    provider_id: "local",
    processing_region: "tidak keluar mesin (kategori khusus)",
    verification: "test",
    docs_url: null,
    verified_at: "2026-10-28",
  },
};

describe("allowlist writer", () => {
  it("rejects unknown keys in strict mode", () => {
    const bad = { ...base, secret: "nope" } as LogEntryV1 & { secret: string };
    expect(() =>
      validateLogEntry(bad as unknown as LogEntryV1, true),
    ).toThrow(SchemaError);
  });
});
