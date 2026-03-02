import type { PlanCode } from "../billing/plans.js";
import type { SubscriptionRepository, SubscriptionState } from "../billing/subscriptions.js";
import type { UsageRepository } from "../billing/usage.js";
import type { BootstrapPolicy, TenantRepository } from "../tenancy/tenants.js";

type ServiceRequest = {
  auth?: {
    role?: string;
  };
};

function assertService(req: ServiceRequest): void {
  if (req.auth?.role !== "service_admin") {
    throw new Error("Service admin access required");
  }
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

      const tenant = await deps.tenants.create({ id: input.tenantId, name: input.name });
      const subscription = await deps.subscriptions.save({
        tenantId: tenant.id,
        plan: policy.defaultPlan,
        state: policy.defaultState,
      });
      await deps.usage.get(tenant.id);

      return { tenant, subscription };
    },
  };
}
