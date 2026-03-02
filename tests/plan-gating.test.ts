import { describe, expect, it } from "vitest";
import { assertPlanAllows } from "../src/billing/gating.js";
import { PlanDeniedError } from "../src/errors/access-errors.js";

describe("plan gating", () => {
  it("denies when plan limit exceeded", () => {
    expect(() =>
      assertPlanAllows(
        { tenantId: "t1", plan: "FREE", state: "active" },
        {
          tenantId: "t1",
          bikes: 5,
          activeRentals: 0,
          documentsThisMonth: 0,
          clients: 0,
          paymentsThisMonth: 0,
        },
        "bikes",
        1,
      ),
    ).toThrow(PlanDeniedError);
  });

  it("denies for past_due subscription", () => {
    expect(() =>
      assertPlanAllows(
        { tenantId: "t1", plan: "PRO", state: "past_due" },
        {
          tenantId: "t1",
          bikes: 0,
          activeRentals: 0,
          documentsThisMonth: 0,
          clients: 0,
          paymentsThisMonth: 0,
        },
        "bikes",
        1,
      ),
    ).toThrow("Subscription state does not allow product access");
  });
});
