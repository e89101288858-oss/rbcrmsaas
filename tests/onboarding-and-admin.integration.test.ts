import { describe, expect, it } from "vitest";
import { createOnboardingApi } from "../src/api/onboarding-endpoints.js";
import { createAdminBillingApi } from "../src/api/admin-billing-endpoints.js";
import { InMemoryTenantRepository } from "../src/tenancy/tenants.js";
import { InMemorySubscriptionRepository } from "../src/billing/subscriptions.js";
import { InMemoryUsageRepository } from "../src/billing/usage.js";

describe("onboarding + admin billing", () => {
  it("creates tenant and bootstraps subscription", async () => {
    const tenants = new InMemoryTenantRepository();
    const subscriptions = new InMemorySubscriptionRepository([]);
    const usage = new InMemoryUsageRepository();
    const onboarding = createOnboardingApi({ tenants, subscriptions, usage });

    const res = await onboarding.onboardTenant({ auth: { role: "service_admin" } }, { tenantId: "t-new", name: "Acme" });

    expect(res.tenant.id).toBe("t-new");
    expect(res.subscription.plan).toBe("FREE");
    expect(res.subscription.state).toBe("trial");
    expect((await usage.get("t-new")).bikes).toBe(0);
  });

  it("admin can change plan and state", async () => {
    const subscriptions = new InMemorySubscriptionRepository([
      { tenantId: "t1", plan: "FREE", state: "trial" },
    ]);
    const admin = createAdminBillingApi({ subscriptions });

    const req = { auth: { role: "service_admin" } };
    const p = await admin.setTenantPlan(req, "t1", "PRO");
    const s = await admin.setTenantSubscriptionState(req, "t1", "active");

    expect(p.plan).toBe("PRO");
    expect(s.state).toBe("active");
  });
});
