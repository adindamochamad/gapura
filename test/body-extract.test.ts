import { describe, expect, it } from "vitest";
import {
  extractTextsFromMultipartBody,
  extractTextsFromUrlEncoded,
} from "../src/core/bodyExtract.js";

const SYNTHETIC_NIK = "3171010101010000";

describe("bodyExtract", () => {
  it("urlencoded NIK", () => {
    const out: string[] = [];
    const reasons = new Set<string>();
    extractTextsFromUrlEncoded(
      `name=Budi&nik=${SYNTHETIC_NIK}`,
      out,
      reasons as never,
    );
    expect(out.join(" ")).toContain(SYNTHETIC_NIK);
  });

  it("multipart text part with NIK", () => {
    const boundary = "abc123";
    const body = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="msg"',
      "",
      `NIK ${SYNTHETIC_NIK}`,
      `--${boundary}--`,
    ].join("\r\n");
    const out: string[] = [];
    const reasons = new Set<string>();
    extractTextsFromMultipartBody(
      body,
      `multipart/form-data; boundary=${boundary}`,
      1_000_000,
      out,
      reasons as never,
    );
    expect(out.join(" ")).toContain(SYNTHETIC_NIK);
    expect(reasons.has("multipart")).toBe(true);
  });

  it("multipart file part adds stream-not-inspected", () => {
    const boundary = "bnd";
    const body = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="f"; filename="x.bin"',
      "Content-Type: application/octet-stream",
      "",
      "binary",
      `--${boundary}--`,
    ].join("\r\n");
    const out: string[] = [];
    const reasons = new Set<string>();
    extractTextsFromMultipartBody(
      body,
      `multipart/form-data; boundary=${boundary}`,
      1_000_000,
      out,
      reasons as never,
    );
    expect(reasons.has("stream-not-inspected")).toBe(true);
  });
});
