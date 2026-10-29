import { describe, expect, it } from "vitest";
import { observeHttpRequest } from "../src/core/observe.js";
import { scanPayloadSync, type DetectFn } from "../src/core/scanPayload.js";

describe("observer budget", () => {
  it("too-dense stops counting", () => {
    const text = `NIK 3171010101010000 `.repeat(100);
    const result = scanPayloadSync([text], { maxMatches: 10 });
    expect(result.reasons).toContain("too-dense");
  });

  it("detector-error when detect throws", () => {
    const bad: DetectFn = () => {
      throw new RangeError("stack");
    };
    const result = scanPayloadSync(["NIK 3171010101010000"], {}, bad);
    expect(result.reasons).toContain("detector-error");
  });

  it("time-budget stops huge payload scan quickly", () => {
    const inner = "1234567890 ".repeat(400_000);
    const body = JSON.stringify({ messages: [{ role: "user", content: inner }] });
    const t0 = Date.now();
    const { entry } = observeHttpRequest({
      url: "https://api.openai.com/v1/chat/completions",
      method: "POST",
      headers: new Headers({ "content-type": "application/json" }),
      bodyText: body,
      bodyBytes: Buffer.byteLength(body),
    });
    const elapsed = Date.now() - t0;
    expect(elapsed).toBeLessThan(3000);
    expect(entry.reasons).toContain("time-budget");
    expect(entry.status).toBe("unchecked");
    expect(entry.coverage).toBe("partial");
  });
});
