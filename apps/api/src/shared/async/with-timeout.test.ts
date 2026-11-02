import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TimeoutError, withTimeout } from "./with-timeout.js";

describe(withTimeout, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the operation result when the operation finishes in time", async () => {
    const operation = new Promise<string>((resolve) => {
      setTimeout(() => resolve("done"), 999);
    });

    const result = withTimeout(operation, 1000);
    await vi.advanceTimersByTimeAsync(999);

    await expect(result).resolves.toBe("done");
  });

  it("rejects with a timeout error when the operation takes longer than the limit", async () => {
    const operation = new Promise<string>(() => {
      // Never settles.
    });

    await Promise.all([
      expect(withTimeout(operation, 1000)).rejects.toStrictEqual(
        new TimeoutError("timed out after 1000 ms"),
      ),
      vi.advanceTimersByTimeAsync(1000),
    ]);
  });

  it("rejects with the operation error when the operation fails in time", async () => {
    const operation = Promise.reject(new Error("connection refused"));

    await expect(withTimeout(operation, 1000)).rejects.toStrictEqual(
      new Error("connection refused"),
    );
  });
});
