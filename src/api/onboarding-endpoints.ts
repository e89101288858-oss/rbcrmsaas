import type { PlanCode } from "../billing/plans.js";
import type { SubscriptionRepository, SubscriptionState } from "../billing/subscriptions.js";
import type { UsageRepository } from "../billing/usage.js";
import type { BootstrapPolicy, TenantRepository } from "../tenancy/tenants.js";
import { UnauthorizedError, ValidationError } from "./api-errors.js";

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

function validateInput(input: { tenantId: string; name: string }): void {
  if (!input.tenantId?.trim()) throw new ValidationError("tenantId is required");
  if (!input.name?.trim()) throw new ValidationError("name is required");
}

export function createOnboardingApi(deps: {
  tenants: TenantRepository;
  subscriptions: SubscriptionRepository;
  usage: UsageRepository;
  policy?: BootstrapPolicy;
}) {
  const policy = deps.policy ?? { defaultPlan: "FREE" as PlanCode, defaultState: "trial" as SubscriptionState };

  return {
    async onboardTenant(req: ServiceRequest, input: { tenantId: string; name: string }) {
      assertService(req);
      validateInput(input);

      const existingTenant = await deps.tenants.getById(input.tenantId);
      const tenant = existingTenant ?? (await deps.tenants.create({ id: input.tenantId, name: input.name }));

      const existingSub = await deps.subscriptions.getByTenant(tenant.id);
      const subscription =
        existingSub ??
        (await deps.subscriptions.save({
          tenantId: tenant.id,
          plan: policy.defaultPlan,
          state: policy.defaultState,
        }));

      await deps.usage.get(tenant.id);

      return { tenant, subscription, idempotent: !!existingTenant };
    },
  };
}
