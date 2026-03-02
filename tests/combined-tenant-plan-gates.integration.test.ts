import { describe, expect, it } from "vitest";
import { createOperationsApi } from "../src/api/operations-endpoints.js";
import { InMemorySecurityEventLogger } from "../src/security/events.js";
import { InMemoryUsageRepository } from "../src/billing/usage.js";
import { InMemorySubscriptionRepository } from "../src/billing/subscriptions.js";
import { BikesRepository } from "../src/repositories/bikes-repository.js";
import { RentalsRepository } from "../src/repositories/rentals-repository.js";
import { DocumentsRepository } from "../src/repositories/documents-repository.js";
import { ClientsRepository } from "../src/repositories/clients-repository.js";
import { PaymentsRepository } from "../src/repositories/payments-repository.js";
import { TenantAccessDeniedError } from "../src/security/tenant-guard.js";
import { PlanDeniedError } from "../src/errors/access-errors.js";

describe("combined tenant + plan gates", () => {
  it("returns tenant-denied before plan checks on mismatched tenant", async () => {
    const usage = new InMemoryUsageRepository();
    await usage.increment("tenant-A", "bikes", 5);

    const api = createOperationsApi({
      logger: new InMemorySecurityEventLogger(),
      bikesRepo: new BikesRepository([]),
      rentalsRepo: new RentalsRepository([]),
      documentsRepo: new DocumentsRepository([]),
      clientsRepo: new ClientsRepository([]),
      paymentsRepo: new PaymentsRepository([]),
      usage,
      subscriptions: new InMemorySubscriptionRepository([
        { tenantId: "tenant-A", plan: "FREE", state: "active" },
      ]),
    });

    const req = { headers: { "x-tenant-id": "tenant-B" }, auth: { tenantId: "tenant-A" } };
    await expect(api.createBike(req, { id: "b1", model: "M1", status: "available" })).rejects.toThrow(
      TenantAccessDeniedError,
    );
  });

  it("returns plan-denied on tenant-valid request when over limit", async () => {
    const usage = new InMemoryUsageRepository();
    await usage.increment("tenant-A", "bikes", 5);

    const api = createOperationsApi({
      logger: new InMemorySecurityEventLogger(),
      bikesRepo: new BikesRepository([]),
      rentalsRepo: new RentalsRepository([]),
      documentsRepo: new DocumentsRepository([]),
      clientsRepo: new ClientsRepository([]),
      paymentsRepo: new PaymentsRepository([]),
      usage,
      subscriptions: new InMemorySubscriptionRepository([
        { tenantId: "tenant-A", plan: "FREE", state: "active" },
      ]),
    });

    const req = { headers: { "x-tenant-id": "tenant-A" }, auth: { tenantId: "tenant-A" } };
    await expect(api.createBike(req, { id: "b2", model: "M2", status: "available" })).rejects.toThrow(
      PlanDeniedError,
    );
  });
});
