import { describe, expect, it } from "vitest";
import {
  isAbortError,
  outcomeFromFetchError,
} from "../src/core/outcomeFromError.js";

describe("outcomeFromFetchError", () => {
  it("classifies TimeoutError", () => {
    const err = new DOMException("timeout", "TimeoutError");
    expect(outcomeFromFetchError(err)).toBe("timeout");
  });

  it("classifies ETIMEDOUT", () => {
    expect(outcomeFromFetchError({ code: "ETIMEDOUT" })).toBe("timeout");
  });

  it("classifies generic errors as network_error", () => {
    expect(outcomeFromFetchError(new Error("ECONNREFUSED"))).toBe(
      "network_error",
    );
  });

  it("detects AbortError", () => {
    expect(isAbortError(new DOMException("aborted", "AbortError"))).toBe(true);
  });
});
