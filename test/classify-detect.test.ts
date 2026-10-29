import { describe, expect, it } from "vitest";
import { classifyCall } from "../src/core/classify.js";
import { countPiiInText, countTiraiTokens } from "../src/core/detect.js";
import { redact } from "@adindamochamad/tirai";
import { extractStringsFromJson } from "../src/core/extract.js";
import { observeHttpRequest } from "../src/core/observe.js";

const SINTETIS_NIK = "3171010101010000";
const SINTETIS_HP = "0800-0000-0001";

describe("classifyCall", () => {
  it("maps five statuses", () => {
    expect(classifyCall({ NIK: 1 }, {}, { coverage: "full" })).toBe("raw");
    expect(classifyCall({}, { NIK: 1 }, { coverage: "full" })).toBe("masked");
    expect(classifyCall({ NIK: 1 }, { TELEPON: 1 }, { coverage: "full" })).toBe(
      "mixed",
    );
    expect(classifyCall({}, {}, { coverage: "full" })).toBe("clean");
    expect(
      classifyCall({ NIK: 1 }, {}, { coverage: "full", forceUnchecked: true }),
    ).toBe("unchecked");
  });
});

describe("detection in JSON bodies", () => {
  const openAiChat = {
    model: "gpt-mock",
    messages: [
      {
        role: "user",
        content: `SINTETIS nama pelapor Warga Contoh NIK ${SINTETIS_NIK} plat B 4321 XYZ`,
      },
    ],
  };

  it("detects NIK in OpenAI-style chat JSON", () => {
    const strings: string[] = [];
    extractStringsFromJson(openAiChat, strings);
    const pii = strings.reduce(
      (acc, t) => {
        const c = countPiiInText(t);
        for (const [k, v] of Object.entries(c)) acc[k] = (acc[k] ?? 0) + (v ?? 0);
        return acc;
      },
      {} as Record<string, number>,
    );
    expect(pii.NIK).toBeGreaterThan(0);
  });

  it("masked status with Tirai redact tokens", () => {
    const raw = `SINTETIS NIK ${SINTETIS_NIK}`;
    const { redacted } = redact(raw);
    const strings = [redacted];
    const pii = countPiiInText(redacted);
    const tokens = countTiraiTokens(redacted);
    expect(classifyCall(pii, tokens, { coverage: "full" })).toBe("masked");
  });
});

describe("observe unchecked", () => {
  it("marks multipart as unchecked", () => {
    const { entry } = observeHttpRequest({
      url: "https://api.openai.com/v1/chat/completions",
      method: "POST",
      headers: new Headers({ "content-type": "multipart/form-data" }),
      bodyText: "",
      bodyBytes: 0,
    });
    expect(entry.status).toBe("unchecked");
  });
});
