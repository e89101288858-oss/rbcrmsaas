export type PlanCode = "FREE" | "BASIC" | "PRO";

export type PlanLimits = {
  bikes: number;
  activeRentals: number;
  documentsThisMonth: number;
  clients: number;
  paymentsThisMonth: number;
};

export const PLAN_LIMITS: Record<PlanCode, PlanLimits> = {
  FREE: {
    bikes: 5,
    activeRentals: 20,
    documentsThisMonth: 100,
    clients: 100,
    paymentsThisMonth: 200,
  },
  BASIC: {
    bikes: 30,
    activeRentals: 300,
    documentsThisMonth: 2000,
    clients: 5000,
    paymentsThisMonth: 10000,
  },
  PRO: {
    bikes: 500,
    activeRentals: 5000,
    documentsThisMonth: 50000,
    clients: 100000,
    paymentsThisMonth: 200000,
  },
};

export function listPlans() {
  return Object.entries(PLAN_LIMITS).map(([code, limits]) => ({
    code: code as PlanCode,
    limits,
  }));
}
