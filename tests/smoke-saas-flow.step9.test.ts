import { describe, expect, it } from "vitest";
import { InMemorySecurityEventLogger } from "../src/security/events.js";
import { InMemoryTenantRepository } from "../src/tenancy/tenants.js";
import { InMemorySubscriptionRepository } from "../src/billing/subscriptions.js";
import { InMemoryUsageRepository } from "../src/billing/usage.js";
import { createOnboardingApi } from "../src/api/onboarding-endpoints.js";
import { createBillingApi } from "../src/api/billing-endpoints.js";
import { createOperationsApi } from "../src/api/operations-endpoints.js";
import { BikesRepository } from "../src/repositories/bikes-repository.js";
import { RentalsRepository } from "../src/repositories/rentals-repository.js";
import { DocumentsRepository } from "../src/repositories/documents-repository.js";
import { ClientsRepository } from "../src/repositories/clients-repository.js";
import { PaymentsRepository } from "../src/repositories/payments-repository.js";
import { PlanDeniedError } from "../src/errors/access-errors.js";

describe("step9 smoke SaaS flow", () => {
  it("onboarding -> subscription -> create bike/rental/document + gating check", async () => {
    const logger = new InMemorySecurityEventLogger();
    const tenants = new InMemoryTenantRepository();
    const subscriptions = new InMemorySubscriptionRepository([]);
    const usage = new InMemoryUsageRepository();

    const onboarding = createOnboardingApi({
      tenants,
      subscriptions,
      usage,
      policy: { defaultPlan: "FREE", defaultState: "active" },
    });
    const billing = createBillingApi({ logger, subscriptions });
    const ops = createOperationsApi({
      logger,
      bikesRepo: new BikesRepository([]),
      rentalsRepo: new RentalsRepository([]),
      documentsRepo: new DocumentsRepository([]),
      clientsRepo: new ClientsRepository([]),
      paymentsRepo: new PaymentsRepository([]),
      usage,
      subscriptions,
    });

    await onboarding.onboardTenant(
      { auth: { role: "service_admin" } },
      { tenantId: "smoke-tenant", name: "Smoke" },
    );

    const req = { headers: { "x-tenant-id": "smoke-tenant" }, auth: { tenantId: "smoke-tenant" } };

    const sub = await billing.getMySubscription(req);
    expect(sub?.state).toBe("active");

    await ops.createBike(req, { id: "b1", model: "M1", status: "available" });
    await ops.createRental(req, { id: "r1", clientId: "c1", bikeId: "b1", totalRub: 200 });
    await ops.createDocument(req, { id: "d1", name: "doc" });

    await billing.transitionMySubscription(req, "past_due");
    await expect(ops.createBike(req, { id: "b2", model: "M2", status: "available" })).rejects.toThrow(
      PlanDeniedError,
    );
  });
});
