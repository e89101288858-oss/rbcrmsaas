import type { PlanCode } from "./plans.js";

export type SubscriptionState = "trial" | "active" | "past_due" | "canceled";

export type Subscription = {
  tenantId: string;
  plan: PlanCode;
  state: SubscriptionState;
  trialEndsAt?: string;
  currentPeriodEndsAt?: string;
};

const ALLOWED_TRANSITIONS: Record<SubscriptionState, SubscriptionState[]> = {
  trial: ["active", "canceled", "past_due"],
  active: ["past_due", "canceled"],
  past_due: ["active", "canceled"],
  canceled: [],
};

export interface SubscriptionRepository {
  getByTenant(tenantId: string): Promise<Subscription | undefined>;
  save(next: Subscription): Promise<Subscription>;
}

export class InMemorySubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly rows: Subscription[]) {}

  async getByTenant(tenantId: string): Promise<Subscription | undefined> {
    return this.rows.find((row) => row.tenantId === tenantId);
  }

  async save(next: Subscription): Promise<Subscription> {
    const idx = this.rows.findIndex((row) => row.tenantId === next.tenantId);
    if (idx >= 0) this.rows[idx] = next;
    else this.rows.push(next);
    return next;
  }
}

export function transitionSubscription(
  current: Subscription,
  nextState: SubscriptionState,
): Subscription {
  const allowed = ALLOWED_TRANSITIONS[current.state];
  if (!allowed.includes(nextState)) {
    throw new Error(`Invalid subscription transition: ${current.state} -> ${nextState}`);
  }

  return {
    ...current,
    state: nextState,
  };
}

export function canUseProduct(subscription: Subscription): boolean {
  return subscription.state === "trial" || subscription.state === "active";
}
