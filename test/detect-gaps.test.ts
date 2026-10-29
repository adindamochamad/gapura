import { describe, expect, it } from "vitest";
import { observeHttpRequest } from "../src/core/observe.js";

/** SINTETIS */
export const SYNTHETIC_NIK = "3171010101010000";
export const FILL =
  "Mohon ringkas data pelanggan berikut ini agar tim layanan dapat menindaklanjuti keluhan dengan cepat dan tepat ";

function observe(
  body: unknown | string,
  opts: {
    url?: string;
    method?: string;
    headers?: Headers;
    bodyText?: string | null;
    bodyBytes?: number;
  } = {},
) {
  const url = opts.url ?? "https://api.openai.com/v1/x";
  let bodyText: string | null;
  let bodyBytes: number;
  if (opts.bodyText !== undefined) {
    bodyText = opts.bodyText;
    bodyBytes = opts.bodyBytes ?? (bodyText?.length ?? 0);
  } else if (typeof body === "string") {
    bodyText = body;
    bodyBytes = Buffer.byteLength(body);
  } else {
    bodyText = JSON.stringify(body);
    bodyBytes = Buffer.byteLength(bodyText);
  }
  return observeHttpRequest({
    url,
    method: opts.method ?? "POST",
    headers:
      opts.headers ??
      new Headers({ "content-type": "application/json; charset=utf-8" }),
    bodyText,
    bodyBytes,
  });
}

describe("detect gaps — reproduksi review", () => {
  it("1: long filler + NIK in messages", () => {
    const body = {
      messages: [
        {
          role: "user",
          content: `${FILL.repeat(3)}Budi Santoso NIK ${SYNTHETIC_NIK}`,
        },
      ],
    };
    const { entry } = observe(body);
    expect(entry.status).toBe("raw");
    expect(entry.pii.NIK).toBe(1);
  });

  it("2: spaced filler 300 + NIK", () => {
    const body = {
      messages: [
        { role: "user", content: `a `.repeat(300) + `, NIK ${SYNTHETIC_NIK}` },
      ],
    };
    const { entry } = observe(body);
    expect(entry.status).toBe("raw");
    expect(entry.pii.NIK).toBe(1);
  });

  it("3: long filler repeat 6 + NIK", () => {
    const body = {
      messages: [{ role: "user", content: `${FILL.repeat(6)}, NIK ${SYNTHETIC_NIK}` }],
    };
    const { entry } = observe(body);
    expect(entry.status).toBe("raw");
  });

  it("4: nik as JSON number", () => {
    const { entry } = observe({ nik: 3171010101010000 });
    expect(entry.status).toBe("raw");
  });

  it("5: NIK as object key", () => {
    const { entry } = observe({ [SYNTHETIC_NIK]: "x" });
    expect(entry.status).toBe("raw");
  });

  it("6: spaced/dash/zw/fullwidth NIK variants", () => {
    const variants = [
      `NIK 3171 0101 0101 0000`,
      `NIK 3171-0101-0101-0000`,
      `NIK 3171\u200b0101 0101 0000`,
      `NIK ３１７１０１０１０１０１００００`,
    ];
    for (const m of variants) {
      const { entry } = observe({ m });
      expect(entry.status).toBe("raw");
      expect(entry.pii.NIK).toBe(1);
    }
  });

  it("7: NIK in query on GET", () => {
    const { entry } = observe(null, {
      url: `https://api.openai.com/v1/x?nik=${SYNTHETIC_NIK}`,
      method: "GET",
      bodyText: "",
      bodyBytes: 0,
    });
    expect(entry.status).toBe("raw");
  });

  it("8: NIK in path sanitized in log", () => {
    const { entry } = observe(
      { a: 1 },
      { url: `https://api.example.com/users/${SYNTHETIC_NIK}/profile` },
    );
    expect(entry.status).toBe("raw");
    expect(entry.path).toBe("/users/:id/profile");
  });

  it("9: model with PII omitted", () => {
    const { entry } = observe({
      model: `Budi NIK ${SYNTHETIC_NIK}`,
      messages: [],
    });
    expect(entry.model).toBeUndefined();
  });

  it("10: long base64 without payload → unchecked partial", () => {
    const b64 = "Y".repeat(220);
    const { entry } = observe({ m: b64 });
    expect(entry.status).toBe("unchecked");
    expect(entry.reasons).toContain("base64-partial");
  });

  it("10b: NIK inside long base64 → raw with base64-partial", () => {
    const SYNTHETIC_NIK = "3171010101010000";
    const inner = JSON.stringify({ nik: SYNTHETIC_NIK });
    const padded = inner + "x".repeat(180);
    const b64 = Buffer.from(padded, "utf8").toString("base64");
    expect(b64.length).toBeGreaterThanOrEqual(200);
    const { entry } = observe({ payload: b64 });
    expect(entry.status).toBe("raw");
    expect(entry.reasons).toContain("base64-partial");
  });

  it("11: hp number does not crash", () => {
    const { entry } = observe({ hp: 628123456789 });
    expect(entry.status).toBeDefined();
  });

  it("13: token + spaced NIK → mixed", () => {
    const body = `[NIK_1] NIK 3171 0101 0101 0000`;
    const { entry } = observe({ m: body });
    expect(entry.status).toBe("mixed");
  });

  it("14: broken JSON → unchecked non-json", () => {
    const { entry } = observe("{not json", {
      bodyText: "{not json",
      bodyBytes: 9,
    });
    expect(entry.status).toBe("unchecked");
    expect(entry.reasons).toContain("non-json");
  });
});

describe("normalization negatives — must stay clean", () => {
  const negatives = [
    "2026-10-28 12:30:45",
    "INV-2026-0001234",
    "versi 1.2.3.4",
    "ORD 1234 5678 9012",
  ];
  for (const text of negatives) {
    it(`clean: ${text.slice(0, 24)}`, () => {
      const { entry } = observe({ note: text });
      expect(entry.status).toBe("clean");
      expect(entry.coverage).toBe("full");
    });
  }
});
