import { PLAN_LIMITS } from "./plans.js";
import { canUseProduct, type Subscription } from "./subscriptions.js";
import type { TenantUsage } from "./usage.js";
import { PlanDeniedError } from "../errors/access-errors.js";

export function assertPlanAllows(
  subscription: Subscription,
  usage: TenantUsage,
  metric: keyof Omit<TenantUsage, "tenantId">,
  increment = 1,
): void {
  if (!canUseProduct(subscription)) {
    throw new PlanDeniedError(`Subscription state does not allow product access: ${subscription.state}`);
  }

  const limit = PLAN_LIMITS[subscription.plan][metric];
  const current = usage[metric];
  if (current + increment > limit) {
    throw new PlanDeniedError(`Plan limit exceeded for ${metric}: ${current + increment} > ${limit}`);
  }
}
