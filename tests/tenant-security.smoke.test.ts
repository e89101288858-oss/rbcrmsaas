import { describe, expect, it } from "vitest";
import { InMemorySecurityEventLogger } from "../src/security/events.js";
import { tenantGuardMiddleware } from "../src/security/tenant-middleware.js";
import { TenantServiceHelper } from "../src/security/tenant-service-helper.js";
import { TenantAccessDeniedError } from "../src/security/tenant-guard.js";

describe("tenant security smoke", () => {
  it("denies cross-tenant read for rentals", () => {
    const logger = new InMemorySecurityEventLogger();
    const helper = new TenantServiceHelper(logger);

    const rental = { id: "r1", tenantId: "tenant-B" };

    expect(() => helper.mustRead("tenant-A", "rental", rental)).toThrow(TenantAccessDeniedError);
    expect(logger.events[0]?.type).toBe("TENANT_MISMATCH");
  });

  it("denies cross-tenant write for bikes", () => {
    const logger = new InMemorySecurityEventLogger();
    const helper = new TenantServiceHelper(logger);

    const bike = { id: "b1", tenantId: "tenant-B" };

    expect(() => helper.mustWrite("tenant-A", "bike", bike)).toThrow(TenantAccessDeniedError);
    expect(logger.events[0]?.type).toBe("TENANT_MISMATCH");
  });

  it("builds mandatory tenant predicate for documents repo/query", () => {
    const logger = new InMemorySecurityEventLogger();
    const helper = new TenantServiceHelper(logger);

    const query = helper.tenantQuery("tenant-A");
    expect(query).toEqual({ where: { tenantId: "tenant-A" } });
  });

  it("middleware enforces tenant from auth-context", () => {
    const logger = new InMemorySecurityEventLogger();
    const middleware = tenantGuardMiddleware(logger);

    const req = middleware({ headers: {}, auth: { tenantId: "tenant-A" } });
    expect(req.context?.tenantId).toBe("tenant-A");
  });

  it("normalizes header case and rejects mismatch with auth tenant", () => {
    const logger = new InMemorySecurityEventLogger();
    const middleware = tenantGuardMiddleware(logger);

    expect(() =>
      middleware({ headers: { "X-Tenant-Id": "tenant-B" }, auth: { tenantId: "tenant-A" } }),
    ).toThrow(TenantAccessDeniedError);
    expect(logger.events[0]?.type).toBe("TENANT_MISMATCH");
  });

  it("logs TENANT_CONTEXT_MISSING when auth tenant is absent", () => {
    const logger = new InMemorySecurityEventLogger();
    const middleware = tenantGuardMiddleware(logger);

    expect(() => middleware({ headers: { "x-tenant-id": "tenant-A" } })).toThrow(TenantAccessDeniedError);
    expect(logger.events[0]?.type).toBe("TENANT_CONTEXT_MISSING");
  });
});
