import { describe, expect, it } from "vitest";
import { createOnboardingApi } from "../src/api/onboarding-endpoints.js";
import { createAdminBillingApi } from "../src/api/admin-billing-endpoints.js";
import { InMemoryTenantRepository } from "../src/tenancy/tenants.js";
import { InMemorySubscriptionRepository } from "../src/billing/subscriptions.js";
import { InMemoryUsageRepository } from "../src/billing/usage.js";
import { UnauthorizedError, ValidationError } from "../src/api/api-errors.js";

describe("onboarding + admin billing", () => {
  it("creates tenant and bootstraps subscription (idempotent)", async () => {
    const tenants = new InMemoryTenantRepository();
    const subscriptions = new InMemorySubscriptionRepository([]);
    const usage = new InMemoryUsageRepository();
    const onboarding = createOnboardingApi({ tenants, subscriptions, usage });

    const req = { auth: { role: "service_admin" } };
    const first = await onboarding.onboardTenant(req, { tenantId: "t-new", name: "Acme" });
    const second = await onboarding.onboardTenant(req, { tenantId: "t-new", name: "Acme" });

    expect(first.tenant.id).toBe("t-new");
    expect(first.subscription.plan).toBe("FREE");
    expect(second.idempotent).toBe(true);
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

  it("validates input and role", async () => {
    const onboarding = createOnboardingApi({
      tenants: new InMemoryTenantRepository(),
      subscriptions: new InMemorySubscriptionRepository([]),
      usage: new InMemoryUsageRepository(),
    });

    await expect(onboarding.onboardTenant({ auth: { role: "user" } }, { tenantId: "t", name: "n" })).rejects.toThrow(
      UnauthorizedError,
    );
    await expect(
      onboarding.onboardTenant({ auth: { role: "service_admin" } }, { tenantId: "", name: "n" }),
    ).rejects.toThrow(ValidationError);
  });
});
