import { describe, expect, it } from "vitest";
import { PII_TYPES, type PiiType, redact } from "@adindamochamad/tirai";
import { extractStringsFromJson } from "../src/core/extract.js";
import { countPiiInTexts, countTiraiTokensInTexts } from "../src/core/detect.js";
import { classifyCall } from "../src/core/classify.js";
import { observeHttpRequest } from "../src/core/observe.js";

/** SINTETIS — nilai palsu untuk tes, bukan data nyata. */
export const SYNTHETIC_SNIPPETS: Record<PiiType, string> = {
  NIK: "NIK 3171010101010000",
  KK: "No KK 3171010101010001",
  NPWP: "NPWP 12.345.678.9-012.345",
  KARTU: "kartu 4111 1111 1111 1111",
  TELEPON: "HP 0800-0000-0001",
  REKENING: "rekening 1234567890",
  PASPOR: "paspor A1234567",
  EMAIL: "email contoh@example.test",
  ALAMAT: "Jl. Contoh No 1 RT 01 RW 02",
  NAMA: "nama pelapor Warga Contoh",
  PLAT: "plat B 4321 XYZ",
};

export type JsonShape =
  | "openai-chat"
  | "openai-responses"
  | "anthropic-messages"
  | "gemini-generate";

export function wrapInJsonShape(text: string, shape: JsonShape): unknown {
  switch (shape) {
    case "openai-chat":
      return {
        model: "gpt-mock",
        messages: [{ role: "user", content: text }],
      };
    case "openai-responses":
      return { model: "gpt-mock", input: text };
    case "anthropic-messages":
      return {
        model: "claude-mock",
        messages: [
          {
            role: "user",
            content: [{ type: "text", text }],
          },
        ],
      };
    case "gemini-generate":
      return {
        contents: [{ parts: [{ text }] }],
      };
  }
}

export function piiFromJsonBody(body: unknown): Record<string, number> {
  const strings: string[] = [];
  extractStringsFromJson(body, strings);
  return countPiiInTexts(strings);
}

const SHAPES: JsonShape[] = [
  "openai-chat",
  "openai-responses",
  "anthropic-messages",
  "gemini-generate",
];

describe("detection DoD — 11 jenis × 4 bentuk JSON", () => {
  for (const type of PII_TYPES) {
    for (const shape of SHAPES) {
      it(`${type} in ${shape}`, () => {
        const text = `SINTETIS. ${SYNTHETIC_SNIPPETS[type]}`;
        const body = wrapInJsonShape(text, shape);
        const pii = piiFromJsonBody(body);
        expect(pii[type]).toBeGreaterThan(0);
      });
    }
  }
});

describe("detection edge cases", () => {
  it("escaped JSON string still scanned", () => {
    const raw = String.raw`SINTETIS NIK 3171010101010000`;
    const body = {
      model: "m",
      messages: [{ role: "user", content: raw }],
    };
    expect(piiFromJsonBody(body).NIK).toBeGreaterThan(0);
  });

  it("long wrapper text still detects NIK", () => {
    const pad = "• ".repeat(400);
    const text = `${pad}SINTETIS NIK 3171010101010000${pad}`;
    const pii = piiFromJsonBody(wrapInJsonShape(text, "openai-chat"));
    expect(pii.NIK).toBeGreaterThan(0);
  });

  it("skips long base64-like blobs", () => {
    const blob = "A".repeat(250);
    const body = { only: blob };
    const strings: string[] = [];
    extractStringsFromJson(body, strings);
    expect(strings.length).toBe(0);
  });

  it("known miss: unlabeled name not counted as NAMA", () => {
    const pii = piiFromJsonBody(
      wrapInJsonShape("SINTETIS. Saya Budi saja.", "openai-chat"),
    );
    expect(pii.NAMA ?? 0).toBe(0);
  });

  it("known miss: unlabeled passport not counted", () => {
    const pii = piiFromJsonBody(
      wrapInJsonShape("SINTETIS. Referensi A1234567.", "openai-chat"),
    );
    expect(pii.PASPOR ?? 0).toBe(0);
  });

  it("Tirai redact → masked classification", () => {
    const raw = `SINTETIS ${SYNTHETIC_SNIPPETS.NIK}`;
    const { redacted } = redact(raw);
    const pii = countPiiInTexts([redacted]);
    const tok = countTiraiTokensInTexts([redacted]);
    expect(classifyCall(pii, tok, false)).toBe("masked");
  });
});

describe("observe via JSON parse path", () => {
  it("anthropic block content stringifies to detection", () => {
    const body = wrapInJsonShape(SYNTHETIC_SNIPPETS.EMAIL, "anthropic-messages");
    const { entry } = observeHttpRequest({
      url: "https://api.anthropic.com/v1/messages",
      method: "POST",
      headers: new Headers({ "content-type": "application/json" }),
      bodyText: JSON.stringify(body),
      bodyBytes: 100,
    });
    expect(entry.status).toBe("raw");
    expect(entry.pii.EMAIL).toBeGreaterThan(0);
  });
});
