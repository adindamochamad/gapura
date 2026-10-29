import { describe, expect, it } from "vitest";
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
});
