import { describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { JsonFileStorage } from "../src/persistence/json-file-storage.js";
import { PersistentSubscriptionRepository, PersistentUsageRepository } from "../src/persistence/billing-repositories.js";
import { createOnboardingApi } from "../src/api/onboarding-endpoints.js";
import { createBillingApi } from "../src/api/billing-endpoints.js";
import { createOperationsApi } from "../src/api/operations-endpoints.js";
import { InMemoryTenantRepository } from "../src/tenancy/tenants.js";
import { InMemorySecurityEventLogger } from "../src/security/events.js";
import { BikesRepository } from "../src/repositories/bikes-repository.js";
import { RentalsRepository } from "../src/repositories/rentals-repository.js";
import { DocumentsRepository } from "../src/repositories/documents-repository.js";
import { ClientsRepository } from "../src/repositories/clients-repository.js";
import { PaymentsRepository } from "../src/repositories/payments-repository.js";
import { PlanDeniedError } from "../src/errors/access-errors.js";

describe("persistence billing lifecycle integrity", () => {
  it("uses persistent repositories for lifecycle + usage checks", async () => {
    const dir = await mkdtemp(join(tmpdir(), "rbcrm-saas-step7-"));

    try {
      const storage = new JsonFileStorage(dir);
      const subscriptions = new PersistentSubscriptionRepository(storage);
      const usage = new PersistentUsageRepository(storage);
      const logger = new InMemorySecurityEventLogger();

      const onboarding = createOnboardingApi({
        tenants: new InMemoryTenantRepository(),
        subscriptions,
        usage,
        policy: { defaultPlan: "FREE", defaultState: "active" },
      });

      await onboarding.onboardTenant(
        { auth: { role: "service_admin" } },
        { tenantId: "tenant-persist", name: "Persisted Co" },
      );

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

      const req = { headers: { "x-tenant-id": "tenant-persist" }, auth: { tenantId: "tenant-persist" } };

      await ops.createBike(req, { id: "b1", model: "M1", status: "available" });
      await ops.createRental(req, { id: "r1", clientId: "c1", bikeId: "b1", totalRub: 100 });
      await ops.createDocument(req, { id: "d1", name: "contract" });

      const snap = await usage.get("tenant-persist");
      expect(snap.bikes).toBe(1);
      expect(snap.activeRentals).toBe(1);
      expect(snap.documentsThisMonth).toBe(1);

      await billing.transitionMySubscription(req, "past_due");

      await expect(ops.createBike(req, { id: "b2", model: "M2", status: "available" })).rejects.toThrow(
        PlanDeniedError,
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
