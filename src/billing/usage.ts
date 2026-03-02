export type TenantUsage = {
  tenantId: string;
  bikes: number;
  activeRentals: number;
  documentsThisMonth: number;
  clients: number;
  paymentsThisMonth: number;
};

export type UsageMetric = keyof Omit<TenantUsage, "tenantId">;

export interface UsageRepository {
  get(tenantId: string): Promise<TenantUsage>;
  increment(tenantId: string, metric: UsageMetric, by?: number): Promise<TenantUsage>;
  resetMonthly(tenantId: string): Promise<TenantUsage>;
}

export class InMemoryUsageRepository implements UsageRepository {
  private usageByTenant = new Map<string, TenantUsage>();

  private zero(tenantId: string): TenantUsage {
    return {
      tenantId,
      bikes: 0,
      activeRentals: 0,
      documentsThisMonth: 0,
      clients: 0,
      paymentsThisMonth: 0,
    };
  }

  async get(tenantId: string): Promise<TenantUsage> {
    return this.usageByTenant.get(tenantId) ?? this.zero(tenantId);
  }

  async increment(tenantId: string, metric: UsageMetric, by = 1): Promise<TenantUsage> {
    const current = await this.get(tenantId);
    const next = { ...current, [metric]: current[metric] + by };
    this.usageByTenant.set(tenantId, next);
    return next;
  }

  async resetMonthly(tenantId: string): Promise<TenantUsage> {
    const current = await this.get(tenantId);
    const next = {
      ...current,
      documentsThisMonth: 0,
      paymentsThisMonth: 0,
    };
    this.usageByTenant.set(tenantId, next);
    return next;
  }
}
