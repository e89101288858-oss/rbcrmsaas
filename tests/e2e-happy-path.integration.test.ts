import { describe, expect, it } from "vitest";
import { createOnboardingApi } from "../src/api/onboarding-endpoints.js";
import { createOperationsApi } from "../src/api/operations-endpoints.js";
import { InMemoryTenantRepository } from "../src/tenancy/tenants.js";
import { InMemorySubscriptionRepository } from "../src/billing/subscriptions.js";
import { InMemoryUsageRepository } from "../src/billing/usage.js";
import { BikesRepository } from "../src/repositories/bikes-repository.js";
import { RentalsRepository } from "../src/repositories/rentals-repository.js";
import { DocumentsRepository } from "../src/repositories/documents-repository.js";
import { ClientsRepository } from "../src/repositories/clients-repository.js";
import { PaymentsRepository } from "../src/repositories/payments-repository.js";
import { InMemorySecurityEventLogger } from "../src/security/events.js";

describe("e2e happy path", () => {
  it("new tenant -> plan -> create bike/rental/document", async () => {
    const tenants = new InMemoryTenantRepository();
    const subscriptions = new InMemorySubscriptionRepository([]);
    const usage = new InMemoryUsageRepository();
    const logger = new InMemorySecurityEventLogger();

    const onboarding = createOnboardingApi({
      tenants,
      subscriptions,
      usage,
      policy: { defaultPlan: "BASIC", defaultState: "active" },
    });

    await onboarding.onboardTenant(
      { auth: { role: "service_admin" } },
      { tenantId: "tenant-e2e", name: "E2E" },
    );

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

    const req = { headers: { "x-tenant-id": "tenant-e2e" }, auth: { tenantId: "tenant-e2e" } };
    const bike = await ops.createBike(req, { id: "b1", model: "M1", status: "available" });
    const rental = await ops.createRental(req, { id: "r1", clientId: "c1", bikeId: "b1", totalRub: 100 });
    const doc = await ops.createDocument(req, { id: "d1", name: "contract" });

    expect(bike.tenantId).toBe("tenant-e2e");
    expect(rental.tenantId).toBe("tenant-e2e");
    expect(doc.tenantId).toBe("tenant-e2e");
  });
});
