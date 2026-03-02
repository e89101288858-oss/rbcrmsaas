import type { Subscription, SubscriptionRepository } from "../billing/subscriptions.js";
import type { TenantUsage, UsageMetric, UsageRepository } from "../billing/usage.js";
import type { KeyValueStorage } from "./storage.js";

type BillingData = {
  subscriptions: Subscription[];
  usage: TenantUsage[];
};

const EMPTY_USAGE = (tenantId: string): TenantUsage => ({
  tenantId,
  bikes: 0,
  activeRentals: 0,
  documentsThisMonth: 0,
  clients: 0,
  paymentsThisMonth: 0,
});

export class PersistentSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly storage: KeyValueStorage, private readonly key = "billing") {}

  private async data(): Promise<BillingData> {
    return this.storage.read<BillingData>(this.key, { subscriptions: [], usage: [] });
  }

  async getByTenant(tenantId: string): Promise<Subscription | undefined> {
    const data = await this.data();
    return data.subscriptions.find((s) => s.tenantId === tenantId);
  }

  async save(next: Subscription): Promise<Subscription> {
    const data = await this.data();
    const idx = data.subscriptions.findIndex((s) => s.tenantId === next.tenantId);
    if (idx >= 0) data.subscriptions[idx] = next;
    else data.subscriptions.push(next);
    await this.storage.write(this.key, data);
    return next;
  }
}

export class PersistentUsageRepository implements UsageRepository {
  constructor(private readonly storage: KeyValueStorage, private readonly key = "billing") {}

  private async data(): Promise<BillingData> {
    return this.storage.read<BillingData>(this.key, { subscriptions: [], usage: [] });
  }

  async get(tenantId: string): Promise<TenantUsage> {
    const data = await this.data();
    return data.usage.find((u) => u.tenantId === tenantId) ?? EMPTY_USAGE(tenantId);
  }

  async increment(tenantId: string, metric: UsageMetric, by = 1): Promise<TenantUsage> {
    const data = await this.data();
    const current = data.usage.find((u) => u.tenantId === tenantId) ?? EMPTY_USAGE(tenantId);
    const next = { ...current, [metric]: current[metric] + by };
    const idx = data.usage.findIndex((u) => u.tenantId === tenantId);
    if (idx >= 0) data.usage[idx] = next;
    else data.usage.push(next);
    await this.storage.write(this.key, data);
    return next;
  }

  async resetMonthly(tenantId: string): Promise<TenantUsage> {
    const data = await this.data();
    const current = data.usage.find((u) => u.tenantId === tenantId) ?? EMPTY_USAGE(tenantId);
    const next = { ...current, documentsThisMonth: 0, paymentsThisMonth: 0 };
    const idx = data.usage.findIndex((u) => u.tenantId === tenantId);
    if (idx >= 0) data.usage[idx] = next;
    else data.usage.push(next);
    await this.storage.write(this.key, data);
    return next;
  }
}
