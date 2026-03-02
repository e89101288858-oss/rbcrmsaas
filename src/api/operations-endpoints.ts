import { assertPlanAllows } from "../billing/gating.js";
import type { SubscriptionRepository } from "../billing/subscriptions.js";
import type { UsageRepository } from "../billing/usage.js";
import { BikesRepository } from "../repositories/bikes-repository.js";
import { RentalsRepository } from "../repositories/rentals-repository.js";
import { DocumentsRepository } from "../repositories/documents-repository.js";
import { ClientsRepository } from "../repositories/clients-repository.js";
import { PaymentsRepository } from "../repositories/payments-repository.js";
import type { Bike, Client, Document, Payment, Rental } from "../domain/types.js";
import type { RequestLike } from "../security/tenant-middleware.js";
import { tenantGuardMiddleware } from "../security/tenant-middleware.js";
import type { SecurityEventLogger } from "../security/events.js";

export function createOperationsApi(deps: {
  logger: SecurityEventLogger;
  bikesRepo: BikesRepository;
  rentalsRepo: RentalsRepository;
  documentsRepo: DocumentsRepository;
  clientsRepo: ClientsRepository;
  paymentsRepo: PaymentsRepository;
  usage: UsageRepository;
  subscriptions: SubscriptionRepository;
}) {
  const middleware = tenantGuardMiddleware(deps.logger);

  return {
    async createBike(req: RequestLike, payload: Omit<Bike, "tenantId">): Promise<Bike> {
      const guarded = middleware(req);
      const tenantId = guarded.context!.tenantId!;
      const subscription = await deps.subscriptions.getByTenant(tenantId);
      if (!subscription) throw new Error("Subscription not found");

      const usage = await deps.usage.get(tenantId);
      assertPlanAllows(subscription, usage, "bikes", 1);

      const bike: Bike = { ...payload, tenantId };
      deps.bikesRepo.save(bike);
      await deps.usage.increment(tenantId, "bikes", 1);
      return bike;
    },

    async createRental(req: RequestLike, payload: Omit<Rental, "tenantId">): Promise<Rental> {
      const guarded = middleware(req);
      const tenantId = guarded.context!.tenantId!;
      const subscription = await deps.subscriptions.getByTenant(tenantId);
      if (!subscription) throw new Error("Subscription not found");

      const usage = await deps.usage.get(tenantId);
      assertPlanAllows(subscription, usage, "activeRentals", 1);

      const rental: Rental = { ...payload, tenantId };
      deps.rentalsRepo.save(rental);
      await deps.usage.increment(tenantId, "activeRentals", 1);
      return rental;
    },

    async createDocument(req: RequestLike, payload: Omit<Document, "tenantId">): Promise<Document> {
      const guarded = middleware(req);
      const tenantId = guarded.context!.tenantId!;
      const subscription = await deps.subscriptions.getByTenant(tenantId);
      if (!subscription) throw new Error("Subscription not found");

      const usage = await deps.usage.get(tenantId);
      assertPlanAllows(subscription, usage, "documentsThisMonth", 1);

      const document: Document = { ...payload, tenantId };
      deps.documentsRepo.save(document);
      await deps.usage.increment(tenantId, "documentsThisMonth", 1);
      return document;
    },

    async createClient(req: RequestLike, payload: Omit<Client, "tenantId">): Promise<Client> {
      const guarded = middleware(req);
      const tenantId = guarded.context!.tenantId!;
      const subscription = await deps.subscriptions.getByTenant(tenantId);
      if (!subscription) throw new Error("Subscription not found");

      const usage = await deps.usage.get(tenantId);
      assertPlanAllows(subscription, usage, "clients", 1);

      const client: Client = { ...payload, tenantId };
      deps.clientsRepo.save(client);
      await deps.usage.increment(tenantId, "clients", 1);
      return client;
    },

    async createPayment(req: RequestLike, payload: Omit<Payment, "tenantId">): Promise<Payment> {
      const guarded = middleware(req);
      const tenantId = guarded.context!.tenantId!;
      const subscription = await deps.subscriptions.getByTenant(tenantId);
      if (!subscription) throw new Error("Subscription not found");

      const usage = await deps.usage.get(tenantId);
      assertPlanAllows(subscription, usage, "paymentsThisMonth", 1);

      const payment: Payment = { ...payload, tenantId };
      deps.paymentsRepo.save(payment);
      await deps.usage.increment(tenantId, "paymentsThisMonth", 1);
      return payment;
    },
  };
}
