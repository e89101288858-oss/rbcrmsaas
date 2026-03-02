import { listPlans } from "../billing/plans.js";
import type { Subscription, SubscriptionRepository } from "../billing/subscriptions.js";
import { transitionSubscription, type SubscriptionState } from "../billing/subscriptions.js";
import type { RequestLike } from "../security/tenant-middleware.js";
import { tenantGuardMiddleware } from "../security/tenant-middleware.js";
import type { SecurityEventLogger } from "../security/events.js";
import { ConflictError, NotFoundError, ValidationError } from "./api-errors.js";

export function createBillingApi(deps: {
  logger: SecurityEventLogger;
  subscriptions: SubscriptionRepository;
}) {
  const middleware = tenantGuardMiddleware(deps.logger);
  const idempotency = new Map<string, { nextState: SubscriptionState; result: Subscription }>();

  return {
    listPlans(req: RequestLike) {
      middleware(req);
      return listPlans();
    },

    async getMySubscription(req: RequestLike): Promise<Subscription | undefined> {
      const guarded = middleware(req);
      return deps.subscriptions.getByTenant(guarded.context!.tenantId!);
    },

    async transitionMySubscription(
      req: RequestLike,
      nextState: SubscriptionState,
      opts?: { idempotencyKey?: string },
    ): Promise<Subscription> {
      const guarded = middleware(req);
      const tenantId = guarded.context!.tenantId!;
      if (!nextState) throw new ValidationError("nextState is required");

      const idemKey = opts?.idempotencyKey?.trim();
      if (idemKey) {
        const key = `${tenantId}:${idemKey}`;
        const cached = idempotency.get(key);
        if (cached) {
          if (cached.nextState !== nextState) {
            throw new ConflictError("Idempotency key already used with different target state");
          }
          return cached.result;
        }
      }

      const current = await deps.subscriptions.getByTenant(tenantId);
      if (!current) throw new NotFoundError("Subscription not found");

      const next = transitionSubscription(current, nextState);
      const saved = await deps.subscriptions.save(next);

      if (idemKey) {
        idempotency.set(`${tenantId}:${idemKey}`, { nextState, result: saved });
      }

      return saved;
    },
  };
}
