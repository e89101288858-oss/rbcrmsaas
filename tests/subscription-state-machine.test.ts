import { describe, expect, it } from "vitest";
import { transitionSubscription, type Subscription } from "../src/billing/subscriptions.js";

describe("subscription state machine", () => {
  const base: Subscription = {
    tenantId: "t1",
    plan: "BASIC",
    state: "trial",
  };

  it("allows valid transition trial -> active", () => {
    const next = transitionSubscription(base, "active");
    expect(next.state).toBe("active");
  });

  it("denies invalid transition canceled -> active", () => {
    const canceled: Subscription = { ...base, state: "canceled" };
    expect(() => transitionSubscription(canceled, "active")).toThrow("Invalid subscription transition");
  });
});
