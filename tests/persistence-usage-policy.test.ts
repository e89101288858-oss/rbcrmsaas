import { describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { JsonFileStorage } from "../src/persistence/json-file-storage.js";
import { PersistentUsageRepository } from "../src/persistence/billing-repositories.js";

describe("persistent usage policy", () => {
  it("increments and monthly resets counters", async () => {
    const dir = await mkdtemp(join(tmpdir(), "rbcrm-saas-usage-"));

    try {
      const usage = new PersistentUsageRepository(new JsonFileStorage(dir));

      await usage.increment("t1", "paymentsThisMonth", 3);
      await usage.increment("t1", "documentsThisMonth", 2);
      const before = await usage.get("t1");
      expect(before.paymentsThisMonth).toBe(3);
      expect(before.documentsThisMonth).toBe(2);

      const after = await usage.resetMonthly("t1");
      expect(after.paymentsThisMonth).toBe(0);
      expect(after.documentsThisMonth).toBe(0);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
