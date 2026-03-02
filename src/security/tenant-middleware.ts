import type { SecurityEventLogger } from "./events.js";
import { TenantAccessDeniedError } from "./tenant-guard.js";

export type RequestLike = {
  headers: Record<string, string | undefined>;
  auth?: {
    tenantId?: string;
  };
  context?: {
    tenantId?: string;
  };
};

function getHeaderCaseInsensitive(headers: Record<string, string | undefined>, key: string): string | undefined {
  const target = key.toLowerCase();
  const foundKey = Object.keys(headers).find((k) => k.toLowerCase() === target);
  return foundKey ? headers[foundKey] : undefined;
}

export function tenantGuardMiddleware(logger: SecurityEventLogger) {
  return (req: RequestLike): RequestLike => {
    const authTenantId = req.auth?.tenantId;
    const compatHeaderTenantId = getHeaderCaseInsensitive(req.headers, "x-tenant-id");

    if (!authTenantId) {
      logger.log({
        type: "TENANT_CONTEXT_MISSING",
        actorTenantId: undefined,
        operation: "read",
        entity: "request",
        at: new Date().toISOString(),
        reason: "auth tenant is missing",
      });

      throw new TenantAccessDeniedError("Missing tenant context in auth");
    }

    if (compatHeaderTenantId && compatHeaderTenantId !== authTenantId) {
      logger.log({
        type: "TENANT_MISMATCH",
        actorTenantId: authTenantId,
        resourceTenantId: compatHeaderTenantId,
        operation: "read",
        entity: "request-header",
        at: new Date().toISOString(),
      });

      throw new TenantAccessDeniedError("Tenant header mismatch");
    }

    req.context = {
      ...(req.context ?? {}),
      tenantId: authTenantId,
    };

    return req;
  };
}
