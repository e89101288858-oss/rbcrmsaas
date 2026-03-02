import { describe, expect, it } from "vitest";
import { createBillingApi } from "../src/api/billing-endpoints.js";
import { InMemorySecurityEventLogger } from "../src/security/events.js";
import { InMemorySubscriptionRepository } from "../src/billing/subscriptions.js";

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

  it("transitions subscription for current tenant only", async () => {
    const api = createBillingApi({
      logger: new InMemorySecurityEventLogger(),
      subscriptions: new InMemorySubscriptionRepository([
        { tenantId: "tenant-A", plan: "BASIC", state: "trial" },
      ]),
    });

    const req = { headers: { "x-tenant-id": "tenant-A" }, auth: { tenantId: "tenant-A" } };
    const next = await api.transitionMySubscription(req, "active");
    expect(next.state).toBe("active");
  });
});
