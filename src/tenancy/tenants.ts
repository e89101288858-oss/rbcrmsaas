import type { PlanCode } from "../billing/plans.js";
import type { SubscriptionState } from "../billing/subscriptions.js";

export type Tenant = {
  id: string;
  name: string;
  createdAt: string;
};

export type BootstrapPolicy = {
  defaultPlan: PlanCode;
  defaultState: SubscriptionState;
};

export interface TenantRepository {
  create(input: { id: string; name: string }): Promise<Tenant>;
  getById(id: string): Promise<Tenant | undefined>;
}

export class InMemoryTenantRepository implements TenantRepository {
  constructor(private readonly rows: Tenant[] = []) {}

  async create(input: { id: string; name: string }): Promise<Tenant> {
    const tenant: Tenant = {
      id: input.id,
      name: input.name,
      createdAt: new Date().toISOString(),
    };
    this.rows.push(tenant);
    return tenant;
  }

  async getById(id: string): Promise<Tenant | undefined> {
    return this.rows.find((t) => t.id === id);
  }
}
