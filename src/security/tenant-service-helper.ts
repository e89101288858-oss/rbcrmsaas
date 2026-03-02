import type { SecurityEventLogger } from "./events.js";
import { assertTenantAccess, tenantScopedQuery, type TenantScopedQuery } from "./tenant-guard.js";

export type TenantEntity = {
  id: string;
  tenantId: string;
};

export class TenantServiceHelper {
  constructor(private readonly logger: SecurityEventLogger) {}

  mustRead<T extends TenantEntity>(actorTenantId: string, entity: string, row: T): T {
    assertTenantAccess(
      {
        actorTenantId,
        resourceTenantId: row.tenantId,
        operation: "read",
        entity,
        entityId: row.id,
      },
      this.logger,
    );

    return row;
  }

  mustWrite<T extends TenantEntity>(actorTenantId: string, entity: string, row: T): T {
    assertTenantAccess(
      {
        actorTenantId,
        resourceTenantId: row.tenantId,
        operation: "write",
        entity,
        entityId: row.id,
      },
      this.logger,
    );

    return row;
  }

  tenantQuery(actorTenantId: string): TenantScopedQuery {
    return tenantScopedQuery(actorTenantId);
  }
}
