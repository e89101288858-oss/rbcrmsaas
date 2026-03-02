import { roundRub } from "../finance/rub.js";
import type { Bike, Document, Rental } from "../domain/types.js";
import { RentalsRepository } from "../repositories/rentals-repository.js";
import { BikesRepository } from "../repositories/bikes-repository.js";
import { DocumentsRepository } from "../repositories/documents-repository.js";
import type { RequestLike } from "../security/tenant-middleware.js";
import { tenantGuardMiddleware } from "../security/tenant-middleware.js";
import { TenantServiceHelper } from "../security/tenant-service-helper.js";
import type { SecurityEventLogger } from "../security/events.js";

type AppDeps = {
  logger: SecurityEventLogger;
  rentalsRepo: RentalsRepository;
  bikesRepo: BikesRepository;
  documentsRepo: DocumentsRepository;
};

export function createApp(deps: AppDeps) {
  const middleware = tenantGuardMiddleware(deps.logger);
  const helper = new TenantServiceHelper(deps.logger);

  return {
    listRentals(req: RequestLike): Rental[] {
      const guarded = middleware(req);
      const tenantId = guarded.context!.tenantId!;
      return deps.rentalsRepo.list(helper.tenantQuery(tenantId).where);
    },

    updateBikeStatus(req: RequestLike, bikeId: string, status: Bike["status"]): Bike {
      const guarded = middleware(req);
      const tenantId = guarded.context!.tenantId!;
      const bike = deps.bikesRepo.getById(bikeId);
      if (!bike) throw new Error("Bike not found");

      helper.mustWrite(tenantId, "bike", bike);
      const next = { ...bike, status };
      return deps.bikesRepo.save(next);
    },

    listDocuments(req: RequestLike): Document[] {
      const guarded = middleware(req);
      const tenantId = guarded.context!.tenantId!;
      return deps.documentsRepo.list(helper.tenantQuery(tenantId).where);
    },

    updateRentalTotal(req: RequestLike, rentalId: string, totalRub: number): Rental {
      const guarded = middleware(req);
      const tenantId = guarded.context!.tenantId!;
      const rental = deps.rentalsRepo.getById(rentalId);
      if (!rental) throw new Error("Rental not found");

      helper.mustWrite(tenantId, "rental", rental);
      const next = { ...rental, totalRub: roundRub(totalRub) };
      return deps.rentalsRepo.save(next);
    },
  };
}
