import type { PlanCode } from "../billing/plans.js";
import type {
  Subscription,
  SubscriptionRepository,
  SubscriptionState,
} from "../billing/subscriptions.js";
import { transitionSubscription } from "../billing/subscriptions.js";

type AdminRequest = {
  auth?: {
    role?: string;
  };
};

function assertAdmin(req: AdminRequest): void {
  if (req.auth?.role !== "service_admin") {
    throw new Error("Service admin access required");
  }
}

export function createAdminBillingApi(deps: { subscriptions: SubscriptionRepository }) {
  return {
    async setTenantPlan(req: AdminRequest, tenantId: string, plan: PlanCode): Promise<Subscription> {
      assertAdmin(req);
      const current = await deps.subscriptions.getByTenant(tenantId);
      if (!current) throw new Error("Subscription not found");
      return deps.subscriptions.save({ ...current, plan });
    },

    async setTenantSubscriptionState(
      req: AdminRequest,
      tenantId: string,
      state: SubscriptionState,
    ): Promise<Subscription> {
      assertAdmin(req);
      const current = await deps.subscriptions.getByTenant(tenantId);
      if (!current) throw new Error("Subscription not found");
      if (state === current.state) return current;
      return deps.subscriptions.save(transitionSubscription(current, state));
    },
  };
}
