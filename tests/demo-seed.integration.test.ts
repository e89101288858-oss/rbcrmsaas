import { describe, expect, it } from "vitest";
import { createDemoSeedApi } from "../src/api/demo-seed-endpoint.js";
import { InMemoryTenantRepository } from "../src/tenancy/tenants.js";
import { InMemorySubscriptionRepository } from "../src/billing/subscriptions.js";
import { InMemoryUsageRepository } from "../src/billing/usage.js";
import { InMemorySecurityEventLogger } from "../src/security/events.js";

describe("demo seed flow", () => {
  it("bootstraps demo tenant through service endpoint", async () => {
    const api = createDemoSeedApi({
      tenants: new InMemoryTenantRepository(),
      subscriptions: new InMemorySubscriptionRepository([]),
      usage: new InMemoryUsageRepository(),
      logger: new InMemorySecurityEventLogger(),
    });

    const result = await api.seedDemoTenant(
      { auth: { role: "service_admin" } },
      { tenantId: "demo-1", tenantName: "Demo Tenant" },
    );

    expect(result.seeded).toBe(true);
    expect(result.tenantId).toBe("demo-1");
  });
});
