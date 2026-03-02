import type { TenantRepository } from "../tenancy/tenants.js";
import type { SubscriptionRepository } from "../billing/subscriptions.js";
import type { UsageRepository } from "../billing/usage.js";
import type { SecurityEventLogger } from "../security/events.js";
import { UnauthorizedError, ValidationError } from "./api-errors.js";
import { bootstrapDemoTenant } from "../services/demo-bootstrap.js";

type ServiceRequest = {
  auth?: {
    role?: string;
  };
};

function assertService(req: ServiceRequest): void {
  if (req.auth?.role !== "service_admin") {
    throw new UnauthorizedError("Service admin access required");
  }
}

export function createDemoSeedApi(deps: {
  tenants: TenantRepository;
  subscriptions: SubscriptionRepository;
  usage: UsageRepository;
  logger: SecurityEventLogger;
}) {
  return {
    async seedDemoTenant(req: ServiceRequest, input: { tenantId: string; tenantName: string }) {
      assertService(req);
      if (!input.tenantId?.trim()) throw new ValidationError("tenantId is required");
      if (!input.tenantName?.trim()) throw new ValidationError("tenantName is required");

      return bootstrapDemoTenant({
        ...deps,
        tenantId: input.tenantId,
        tenantName: input.tenantName,
      });
    },
  };
}
