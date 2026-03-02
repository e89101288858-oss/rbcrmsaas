import { describe, expect, it } from "vitest";
import { createBillingApi } from "../src/api/billing-endpoints.js";
import { createOperationsApi } from "../src/api/operations-endpoints.js";
import { InMemorySecurityEventLogger } from "../src/security/events.js";
import { InMemorySubscriptionRepository } from "../src/billing/subscriptions.js";
import { InMemoryUsageRepository } from "../src/billing/usage.js";
import { BikesRepository } from "../src/repositories/bikes-repository.js";
import { RentalsRepository } from "../src/repositories/rentals-repository.js";
import { DocumentsRepository } from "../src/repositories/documents-repository.js";
import { ClientsRepository } from "../src/repositories/clients-repository.js";
import { PaymentsRepository } from "../src/repositories/payments-repository.js";
import { PlanDeniedError } from "../src/errors/access-errors.js";

describe("subscription lifecycle impacts feature access", () => {
  it("blocks create operations after transition to past_due", async () => {
    const logger = new InMemorySecurityEventLogger();
    const subscriptions = new InMemorySubscriptionRepository([
      { tenantId: "tenant-A", plan: "BASIC", state: "active" },
    ]);
    const usage = new InMemoryUsageRepository();

    const billingApi = createBillingApi({ logger, subscriptions });
    const opsApi = createOperationsApi({
      logger,
      bikesRepo: new BikesRepository([]),
      rentalsRepo: new RentalsRepository([]),
      documentsRepo: new DocumentsRepository([]),
      clientsRepo: new ClientsRepository([]),
      paymentsRepo: new PaymentsRepository([]),
      usage,
      subscriptions,
    });

    const req = { headers: { "x-tenant-id": "tenant-A" }, auth: { tenantId: "tenant-A" } };

    await billingApi.transitionMySubscription(req, "past_due");

    await expect(opsApi.createBike(req, { id: "b1", model: "M1", status: "available" })).rejects.toThrow(
      PlanDeniedError,
    );
    await expect(
      opsApi.createRental(req, { id: "r1", clientId: "c1", bikeId: "b1", totalRub: 100 }),
    ).rejects.toThrow(PlanDeniedError);
    await expect(opsApi.createDocument(req, { id: "d1", name: "contract" })).rejects.toThrow(PlanDeniedError);
    await expect(opsApi.createClient(req, { id: "c1", name: "N", phone: "+7" })).rejects.toThrow(PlanDeniedError);
    await expect(
      opsApi.createPayment(req, { id: "p1", rentalId: "r1", amountRub: 100, method: "card" }),
    ).rejects.toThrow(PlanDeniedError);
  });
});
