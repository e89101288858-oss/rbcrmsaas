import { describe, expect, it } from "vitest";
import { roundRub } from "../src/finance/rub.js";

describe("RUB round half up (2 decimals)", () => {
  it("rounds positive values", () => {
    expect(roundRub(10.234)).toBe(10.23);
    expect(roundRub(10.235)).toBe(10.24);
  });

  it("rounds negative values symmetrically", () => {
    expect(roundRub(-10.234)).toBe(-10.23);
    expect(roundRub(-10.235)).toBe(-10.24);
  });
});
