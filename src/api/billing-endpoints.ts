import { listPlans } from "../billing/plans.js";
import type { Subscription, SubscriptionRepository } from "../billing/subscriptions.js";
import { transitionSubscription, type SubscriptionState } from "../billing/subscriptions.js";
import type { RequestLike } from "../security/tenant-middleware.js";
import { tenantGuardMiddleware } from "../security/tenant-middleware.js";
import type { SecurityEventLogger } from "../security/events.js";

export function createBillingApi(deps: {
  logger: SecurityEventLogger;
  subscriptions: SubscriptionRepository;
}) {
  const middleware = tenantGuardMiddleware(deps.logger);

  return {
    listPlans(req: RequestLike) {
      middleware(req);
      return listPlans();
    },

    async getMySubscription(req: RequestLike): Promise<Subscription | undefined> {
      const guarded = middleware(req);
      return deps.subscriptions.getByTenant(guarded.context!.tenantId!);
    },

    async transitionMySubscription(req: RequestLike, nextState: SubscriptionState): Promise<Subscription> {
      const guarded = middleware(req);
      const tenantId = guarded.context!.tenantId!;
      const current = await deps.subscriptions.getByTenant(tenantId);
      if (!current) throw new Error("Subscription not found");

      const next = transitionSubscription(current, nextState);
      return deps.subscriptions.save(next);
    },
  };
}
