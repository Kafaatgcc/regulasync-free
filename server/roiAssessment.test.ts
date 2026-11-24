import { describe, expect, it } from "vitest";
import {
  calculateRoi,
  DEFAULT_ROI_INPUTS,
  getRoiInputErrors,
  type RoiInputs,
} from "../shared/roiCalculator";

const scenario = (overrides: Partial<RoiInputs> = {}): RoiInputs => ({
  ...DEFAULT_ROI_INPUTS,
  ...overrides,
});

describe("assessment ROI estimator", () => {
  it("reproduces the conservative default without fines or double-counted labor", () => {
    const result = calculateRoi(scenario());
    expect(result.monthlyLicenseCost).toBe(450);
    expect(result.annualLicenseCost).toBe(5400);
    expect(result.yearOneTotalCost).toBe(10400);
    expect(result.baselineAnnualHours).toBe(1440);
    expect(result.annualHoursSaved).toBe(360);
    expect(result.remainingAnnualHours).toBe(1080);
    expect(result.annualTimeValue).toBe(14400);
    expect(result.annualCashSavings).toBe(7200);
    expect(result.annualOpportunityValue).toBe(7200);
    expect(result.annualOpportunityHours).toBe(180);
    expect(result.yearOneNetSavings).toBe(-3200);
    expect(result.financialRoiPercent).toBeCloseTo(-30.76923076923077, 10);
    expect(result.netMonthlySavings).toBe(150);
    expect(result.paybackStatus).toBe("recoverable");
    expect(result.paybackMonths).toBeCloseTo(33.333333333333336, 10);
  });

  it.each([
    ["core", 90, 5400],
    ["professional", 175, 10500],
    ["enterprise", 350, 21000],
  ] as const)("prices %s at £%i per seat/month over all 12 months", (plan, monthlySeatPrice, annualCost) => {
    const result = calculateRoi(scenario({ plan }));
    expect(result.monthlyLicenseCost).toBe(5 * monthlySeatPrice);
    expect(result.annualLicenseCost).toBe(annualCost);
    expect(result.yearOneTotalCost).toBe(annualCost + 5000);
  });

  it("does not multiply aggregate team or audit hours by licensed seats", () => {
    const fiveSeats = calculateRoi(scenario());
    const tenSeats = calculateRoi(scenario({ seats: 10 }));
    expect(tenSeats.annualLicenseCost).toBe(fiveSeats.annualLicenseCost * 2);
    expect(tenSeats.annualHoursSaved).toBe(fiveSeats.annualHoursSaved);
    expect(tenSeats.annualCashSavings).toBe(fiveSeats.annualCashSavings);
  });

  it("excludes opportunity time and future cost avoidance from cash ROI", () => {
    const result = calculateRoi(scenario({ cashRealizationPercent: 0 }));
    expect(result.annualTimeValue).toBe(14400);
    expect(result.annualOpportunityValue).toBe(14400);
    expect(result.annualCashSavings).toBe(0);
    expect(result.yearOneNetSavings).toBe(-10400);
    expect(result.financialRoiPercent).toBe(-100);
    expect(result.paybackStatus).toBe("no-payback");
    expect(result.paybackMonths).toBeNull();
  });

  it("can show positive first-year ROI when explicitly supported by higher cash realization", () => {
    const result = calculateRoi(scenario({ cashRealizationPercent: 100 }));
    expect(result.annualCashSavings).toBe(14400);
    expect(result.annualOpportunityValue).toBe(0);
    expect(result.yearOneNetSavings).toBe(4000);
    expect(result.financialRoiPercent).toBeCloseTo(38.46153846153847, 10);
    expect(result.netMonthlySavings).toBe(750);
    expect(result.paybackMonths).toBeCloseTo(6.666666666666667, 10);
  });

  it("uses implementation cost divided by net monthly savings, not licence cost divided by gross savings", () => {
    const result = calculateRoi(scenario());
    expect(result.paybackMonths).toBe(5000 / (7200 / 12 - 450));
    expect(result.paybackMonths).not.toBe(5400 / (7200 / 12));
  });

  it("has no payback when net recurring savings are exactly zero", () => {
    const result = calculateRoi(scenario({ teamHoursPerMonth: 90 }));
    expect(result.netMonthlySavings).toBe(0);
    expect(result.paybackStatus).toBe("no-payback");
    expect(result.paybackMonths).toBeNull();
  });

  it("has no payback when recurring savings are negative, even with zero setup cost", () => {
    const result = calculateRoi(scenario({ implementationCost: 0, cashRealizationPercent: 0 }));
    expect(result.netMonthlySavings).toBe(-450);
    expect(result.paybackStatus).toBe("no-payback");
    expect(result.paybackMonths).toBeNull();
  });

  it("distinguishes no setup cost from an invented instant payback", () => {
    const result = calculateRoi(scenario({ implementationCost: 0 }));
    expect(result.yearOneTotalCost).toBe(5400);
    expect(result.yearOneNetSavings).toBe(1800);
    expect(result.paybackStatus).toBe("no-setup-cost");
    expect(result.paybackMonths).toBeNull();
  });

  it("increases first-year cost and extends payback when implementation cost increases", () => {
    const result = calculateRoi(scenario({ implementationCost: 10000 }));
    expect(result.yearOneTotalCost).toBe(15400);
    expect(result.yearOneNetSavings).toBe(-8200);
    expect(result.paybackMonths).toBeCloseTo(66.66666666666667, 10);
  });

  it.each([
    { timeSavingPercent: 0 },
    { teamHoursPerMonth: 0 },
    { hourlyCost: 0 },
  ])("returns no fictitious savings when a savings factor is zero: %j", overrides => {
    const result = calculateRoi(scenario(overrides));
    expect(result.annualCashSavings).toBe(0);
    expect(result.financialRoiPercent).toBe(-100);
    expect(result.paybackStatus).toBe("no-payback");
  });

  it.each([
    { seats: 0 },
    { seats: -1 },
    { seats: 1.5 },
    { seats: Number.MAX_SAFE_INTEGER + 1 },
    { hourlyCost: -1 },
    { teamHoursPerMonth: -1 },
    { implementationCost: -1 },
    { timeSavingPercent: -1 },
    { timeSavingPercent: 101 },
    { cashRealizationPercent: -1 },
    { cashRealizationPercent: 101 },
    { hourlyCost: NaN },
    { teamHoursPerMonth: Infinity },
    { implementationCost: Infinity },
    { seats: NaN },
    { timeSavingPercent: NaN },
    { cashRealizationPercent: Infinity },
  ])("rejects invalid inputs instead of clamping them silently: %j", overrides => {
    const inputs = scenario(overrides);
    expect(getRoiInputErrors(inputs).length).toBeGreaterThan(0);
    expect(() => calculateRoi(inputs)).toThrow(RangeError);
  });

  it("rejects an unsupported plan", () => {
    expect(() => calculateRoi(scenario({ plan: "invalid" as RoiInputs["plan"] }))).toThrow("valid subscription plan");
  });

  it("withholds overflowing calculations instead of displaying Infinity or capping returns", () => {
    expect(() => calculateRoi(scenario({ teamHoursPerMonth: Number.MAX_VALUE }))).toThrow("calculation range");
  });

  it("does not cap a valid high return or round intermediate arithmetic", () => {
    const result = calculateRoi(scenario({ seats: 1, implementationCost: 0, hourlyCost: 40.125, cashRealizationPercent: 100 }));
    expect(result.annualCashSavings).toBe(360 * 40.125);
    expect(result.financialRoiPercent).toBeGreaterThan(1000);
    expect(result.financialRoiPercent).toBe((360 * 40.125 - 1080) / 1080 * 100);
  });
});
