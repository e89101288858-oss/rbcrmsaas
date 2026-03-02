import { describe, expect, it } from "vitest";
import { createBillingApi } from "../src/api/billing-endpoints.js";
import { InMemorySecurityEventLogger } from "../src/security/events.js";
import { InMemorySubscriptionRepository } from "../src/billing/subscriptions.js";
import { ConflictError } from "../src/api/api-errors.js";

describe("billing api integration", () => {
  it("returns plans and tenant subscription with tenant guard", async () => {
    const api = createBillingApi({
      logger: new InMemorySecurityEventLogger(),
      subscriptions: new InMemorySubscriptionRepository([
        { tenantId: "tenant-A", plan: "BASIC", state: "active" },
      ]),
    });

    const req = { headers: { "x-tenant-id": "tenant-A" }, auth: { tenantId: "tenant-A" } };
    expect(api.listPlans(req).length).toBeGreaterThan(0);
    expect((await api.getMySubscription(req))?.plan).toBe("BASIC");
  });

  it("supports idempotent subscription transition", async () => {
    const api = createBillingApi({
      logger: new InMemorySecurityEventLogger(),
      subscriptions: new InMemorySubscriptionRepository([
        { tenantId: "tenant-A", plan: "BASIC", state: "trial" },
      ]),
    });

    const req = { headers: { "x-tenant-id": "tenant-A" }, auth: { tenantId: "tenant-A" } };
    const next1 = await api.transitionMySubscription(req, "active", { idempotencyKey: "k1" });
    const next2 = await api.transitionMySubscription(req, "active", { idempotencyKey: "k1" });
    expect(next1.state).toBe("active");
    expect(next2.state).toBe("active");

    await expect(api.transitionMySubscription(req, "canceled", { idempotencyKey: "k1" })).rejects.toThrow(
      ConflictError,
    );
  });
});
