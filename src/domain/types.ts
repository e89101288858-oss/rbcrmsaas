export type TenantEntity = {
  id: string;
  tenantId: string;
};

export type Rental = TenantEntity & {
  clientId: string;
  bikeId: string;
  totalRub: number;
};

export type Bike = TenantEntity & {
  model: string;
  status: "available" | "rented" | "service";
};

export type Document = TenantEntity & {
  rentalId?: string;
  name: string;
};
