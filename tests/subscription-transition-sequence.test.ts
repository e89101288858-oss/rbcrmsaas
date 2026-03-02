import { describe, expect, it } from "vitest";
import { transitionSubscription } from "../src/billing/subscriptions.js";

describe("subscription transition sequence", () => {
  it("trial -> active -> past_due -> canceled", () => {
    const trial = { tenantId: "t1", plan: "BASIC" as const, state: "trial" as const };
    const active = transitionSubscription(trial, "active");
    const pastDue = transitionSubscription(active, "past_due");
    const canceled = transitionSubscription(pastDue, "canceled");

    expect(active.state).toBe("active");
    expect(pastDue.state).toBe("past_due");
    expect(canceled.state).toBe("canceled");
  });
});
