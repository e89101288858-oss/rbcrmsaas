import type { SecurityEventLogger } from "./events.js";

export class TenantAccessDeniedError extends Error {
  constructor(message = "Tenant access denied") {
    super(message);
    this.name = "TenantAccessDeniedError";
  }
}

export type GuardInput = {
  actorTenantId?: string | null;
  resourceTenantId?: string | null;
  operation: "read" | "write";
  entity: string;
  entityId?: string;
};

export function assertTenantAccess(
  input: GuardInput,
  logger: SecurityEventLogger,
): void {
  const { actorTenantId, resourceTenantId, operation, entity, entityId } = input;

  if (!actorTenantId || !resourceTenantId) {
    logger.log({
      type: "TENANT_CONTEXT_MISSING",
      actorTenantId: actorTenantId ?? undefined,
      operation,
      entity,
      at: new Date().toISOString(),
      reason: "actor or resource tenant is missing",
    });

    throw new TenantAccessDeniedError("Missing tenant context");
  }

  if (actorTenantId !== resourceTenantId) {
    logger.log({
      type: "TENANT_MISMATCH",
      actorTenantId,
      resourceTenantId,
      operation,
      entity,
      entityId,
      at: new Date().toISOString(),
    });

    throw new TenantAccessDeniedError();
  }
}

export type TenantScopedQuery = {
  where: {
    tenantId: string;
  };
};

export function tenantScopedQuery(actorTenantId?: string | null): TenantScopedQuery {
  if (!actorTenantId) {
    throw new TenantAccessDeniedError("Missing tenant context");
  }

  return {
    where: {
      tenantId: actorTenantId,
    },
  };
}
