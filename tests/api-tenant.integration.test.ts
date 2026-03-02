import { describe, expect, it } from "vitest";
import { createApp } from "../src/api/endpoints.js";
import { InMemorySecurityEventLogger } from "../src/security/events.js";
import { RentalsRepository } from "../src/repositories/rentals-repository.js";
import { BikesRepository } from "../src/repositories/bikes-repository.js";
import { DocumentsRepository } from "../src/repositories/documents-repository.js";
import { TenantAccessDeniedError } from "../src/security/tenant-guard.js";

function buildApp() {
  const logger = new InMemorySecurityEventLogger();
  return {
    logger,
    app: createApp({
      logger,
      rentalsRepo: new RentalsRepository([
        { id: "r1", tenantId: "tenant-A", clientId: "c1", bikeId: "b1", totalRub: 100 },
        { id: "r2", tenantId: "tenant-B", clientId: "c2", bikeId: "b2", totalRub: 200 },
      ]),
      bikesRepo: new BikesRepository([
        { id: "b1", tenantId: "tenant-A", model: "M1", status: "available" },
        { id: "b2", tenantId: "tenant-B", model: "M2", status: "available" },
      ]),
      documentsRepo: new DocumentsRepository([
        { id: "d1", tenantId: "tenant-A", name: "contract-a" },
        { id: "d2", tenantId: "tenant-B", name: "contract-b" },
      ]),
    }),
  };
}

describe("api tenant integration", () => {
  it("read deny by tenant scoping for rentals/documents", () => {
    const { app } = buildApp();
    const req = { headers: { "x-tenant-id": "tenant-A" }, auth: { tenantId: "tenant-A" } };

    const rentals = app.listRentals(req);
    const docs = app.listDocuments(req);

    expect(rentals.map((r) => r.id)).toEqual(["r1"]);
    expect(docs.map((d) => d.id)).toEqual(["d1"]);
  });

  it("write deny when cross-tenant bike update attempted", () => {
    const { app, logger } = buildApp();
    const req = { headers: { "x-tenant-id": "tenant-A" }, auth: { tenantId: "tenant-A" } };

    expect(() => app.updateBikeStatus(req, "b2", "rented")).toThrow(TenantAccessDeniedError);
    expect(logger.events[0]?.type).toBe("TENANT_MISMATCH");
  });

  it("write deny when cross-tenant rental update attempted", () => {
    const { app, logger } = buildApp();
    const req = { headers: { "x-tenant-id": "tenant-A" }, auth: { tenantId: "tenant-A" } };

    expect(() => app.updateRentalTotal(req, "r2", 123.45)).toThrow(TenantAccessDeniedError);
    expect(logger.events[0]?.type).toBe("TENANT_MISMATCH");
  });
});
