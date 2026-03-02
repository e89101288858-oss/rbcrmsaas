import { createOnboardingApi } from "../api/onboarding-endpoints.js";
import { createAdminBillingApi } from "../api/admin-billing-endpoints.js";
import { createOperationsApi } from "../api/operations-endpoints.js";
import type { TenantRepository } from "../tenancy/tenants.js";
import type { SubscriptionRepository } from "../billing/subscriptions.js";
import type { UsageRepository } from "../billing/usage.js";
import type { SecurityEventLogger } from "../security/events.js";
import { BikesRepository } from "../repositories/bikes-repository.js";
import { RentalsRepository } from "../repositories/rentals-repository.js";
import { DocumentsRepository } from "../repositories/documents-repository.js";
import { ClientsRepository } from "../repositories/clients-repository.js";
import { PaymentsRepository } from "../repositories/payments-repository.js";

export async function bootstrapDemoTenant(deps: {
  tenants: TenantRepository;
  subscriptions: SubscriptionRepository;
  usage: UsageRepository;
  logger: SecurityEventLogger;
  tenantId: string;
  tenantName: string;
}) {
  const onboarding = createOnboardingApi({
    tenants: deps.tenants,
    subscriptions: deps.subscriptions,
    usage: deps.usage,
    policy: { defaultPlan: "BASIC", defaultState: "active" },
  });
  const admin = createAdminBillingApi({ subscriptions: deps.subscriptions });
  const operations = createOperationsApi({
    logger: deps.logger,
    bikesRepo: new BikesRepository([]),
    rentalsRepo: new RentalsRepository([]),
    documentsRepo: new DocumentsRepository([]),
    clientsRepo: new ClientsRepository([]),
    paymentsRepo: new PaymentsRepository([]),
    usage: deps.usage,
    subscriptions: deps.subscriptions,
  });

  const serviceReq = { auth: { role: "service_admin" } };
  const tenantReq = { headers: { "x-tenant-id": deps.tenantId }, auth: { tenantId: deps.tenantId } };

  await onboarding.onboardTenant(serviceReq, {
    tenantId: deps.tenantId,
    name: deps.tenantName,
  });

  await admin.setTenantSubscriptionState(serviceReq, deps.tenantId, "active");

  await operations.createBike(tenantReq, { id: "demo-bike-1", model: "Demo Bike", status: "available" });
  await operations.createRental(tenantReq, {
    id: "demo-rental-1",
    clientId: "demo-client-1",
    bikeId: "demo-bike-1",
    totalRub: 300,
  });
  await operations.createDocument(tenantReq, {
    id: "demo-doc-1",
    name: "demo-contract.pdf",
  });

  return {
    tenantId: deps.tenantId,
    seeded: true,
  };
}
