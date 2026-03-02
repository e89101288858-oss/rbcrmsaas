import { describe, expect, it } from "vitest";
import { createOperationsApi } from "../src/api/operations-endpoints.js";
import { InMemoryUsageRepository } from "../src/billing/usage.js";
import { InMemorySubscriptionRepository } from "../src/billing/subscriptions.js";
import { BikesRepository } from "../src/repositories/bikes-repository.js";
import { RentalsRepository } from "../src/repositories/rentals-repository.js";
import { DocumentsRepository } from "../src/repositories/documents-repository.js";
import { ClientsRepository } from "../src/repositories/clients-repository.js";
import { PaymentsRepository } from "../src/repositories/payments-repository.js";
import { InMemorySecurityEventLogger } from "../src/security/events.js";
import { PlanDeniedError } from "../src/errors/access-errors.js";

describe("operations api integration", () => {
  it("allows bike create inside plan limits", async () => {
    const usage = new InMemoryUsageRepository();
    await usage.increment("tenant-A", "bikes", 4);

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
    const bike = await api.createBike(req, { id: "b-new", model: "M3", status: "available" });
    expect(bike.tenantId).toBe("tenant-A");
  });

  it("enforces plan-gating for rentals/documents/clients/payments", async () => {
    const usage = new InMemoryUsageRepository();
    await usage.increment("tenant-A", "activeRentals", 20);
    await usage.increment("tenant-A", "documentsThisMonth", 100);
    await usage.increment("tenant-A", "clients", 100);
    await usage.increment("tenant-A", "paymentsThisMonth", 200);

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

    await expect(
      api.createRental(req, { id: "r-over", clientId: "c1", bikeId: "b1", totalRub: 100 }),
    ).rejects.toThrow(PlanDeniedError);
    await expect(api.createDocument(req, { id: "d-over", name: "contract" })).rejects.toThrow(PlanDeniedError);
    await expect(api.createClient(req, { id: "c-over", name: "N", phone: "+7" })).rejects.toThrow(PlanDeniedError);
    await expect(
      api.createPayment(req, { id: "p-over", rentalId: "r1", amountRub: 10, method: "card" }),
    ).rejects.toThrow(PlanDeniedError);
  });
});
