export type AccessErrorCode = "TENANT_DENIED" | "PLAN_DENIED";

export class TenantDeniedError extends Error {
  readonly code: AccessErrorCode = "TENANT_DENIED";

  constructor(message = "Tenant access denied") {
    super(message);
    this.name = "TenantDeniedError";
  }
}

export class PlanDeniedError extends Error {
  readonly code: AccessErrorCode = "PLAN_DENIED";

  constructor(message: string) {
    super(message);
    this.name = "PlanDeniedError";
  }
}
