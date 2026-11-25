import { readFileSync } from "node:fs";
import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  PLAN_PRICING,
  MONTHLY_PRICE_PERIOD,
  ANNUAL_PRICE_PERIOD,
  ANNUAL_BILLING_EXPLANATION,
  USER_BILLING_EXPLANATION,
  formatGBP,
  planTotalPence,
} from "../shared/planPricing";
import {
  SUBSCRIPTION_PLANS,
  FEATURE_COMPARISON,
  getPlanById,
  getAnnualSavings,
  getAnnualSavingsPercentage,
  isWithinPlanLimits,
} from "./stripe/products";

// All Stripe and database operations are mocked: no environment overrides, network or DB writes.
const checkoutMocks = vi.hoisted(() => ({
  create: vi.fn(),
  customerCreate: vi.fn(),
  getDb: vi.fn(),
}));
vi.mock("./db", () => ({ getDb: checkoutMocks.getDb }));
vi.mock("stripe", () => ({
  default: class MockStripe {
    customers = { create: checkoutMocks.customerCreate };
    checkout = { sessions: { create: checkoutMocks.create } };
  },
}));
import { createCheckoutSession } from "./stripe/stripeService";

const expectedRates = [
  { id: "core", monthly: 9000, annual: 108000, label: "£90", annualLabel: "£1,080", policies: 10, gaps: 25 },
  { id: "professional", monthly: 17500, annual: 210000, label: "£175", annualLabel: "£2,100", policies: 50, gaps: 100 },
  { id: "enterprise", monthly: 35000, annual: 420000, label: "£350", annualLabel: "£4,200", policies: -1, gaps: -1 },
] as const;

const source = (relativePath: string) => readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
const surfaces = [
  "client/src/pages/Pricing.tsx",
  "client/src/pages/SubscriptionPlans.tsx",
  "client/src/pages/Terms.tsx",
  "client/src/pages/DocumentationHub.tsx",
  "client/src/components/GuidedTour.tsx",
];

describe("assessment per-user plan pricing", () => {
  it.each(expectedRates)("publishes $id monthly and undiscounted annual rates", ({ id, monthly, annual, label, annualLabel, policies, gaps }) => {
    expect(PLAN_PRICING[id]).toEqual({ monthlyPence: monthly, annualPence: annual, billingUnit: "user" });
    const plan = getPlanById(id)!;
    expect(plan.priceMonthly).toBe(monthly);
    expect(plan.priceYearly).toBe(annual);
    expect(plan.priceYearly).toBe(plan.priceMonthly * 12);
    expect(plan.billingUnit).toBe("user");
    expect(plan).not.toHaveProperty("maxUsers");
    expect(plan.maxPolicies).toBe(policies);
    expect(plan.gapAnalysisLimit).toBe(gaps);
    expect(getAnnualSavings(plan)).toBe(0);
    expect(getAnnualSavingsPercentage(plan)).toBe(0);
    expect(formatGBP(monthly)).toBe(label);
    expect(formatGBP(annual)).toBe(annualLabel);
    expect(plan.description).toContain("licence for one user");
    expect(plan.features[0].name).toContain("each user billed separately");
  });

  it("makes pricing units and the annual calculation explicit", () => {
    expect(MONTHLY_PRICE_PERIOD).toContain("per user/month");
    expect(ANNUAL_PRICE_PERIOD).toContain("per user/year");
    expect(ANNUAL_BILLING_EXPLANATION).toContain("12 ×");
    expect(ANNUAL_BILLING_EXPLANATION).toContain("no automatic discount");
    expect(USER_BILLING_EXPLANATION).toContain("do not include a bundle");
    expect(SUBSCRIPTION_PLANS).toHaveLength(3);
    expect(getPlanById("unknown")).toBeUndefined();
  });

  it("calculates illustrative team totals, not seat bundles", () => {
    expect(formatGBP(planTotalPence("core", 5))).toBe("£450");
    expect(formatGBP(planTotalPence("professional", 10))).toBe("£1,750");
    expect(formatGBP(planTotalPence("enterprise", 20))).toBe("£7,000");
    expect(planTotalPence("core", 5, "yearly")).toBe(planTotalPence("core", 5) * 12);
    expect(planTotalPence("professional", 25)).toBe(17500 * 25);
  });

  it.each([0, -1, 1.5, NaN, Infinity])("rejects invalid licensed-user quantity %s", (quantity) => {
    expect(() => planTotalPence("core", quantity)).toThrow("positive whole number");
  });

  it("retains non-seat quotas without implying free additional users", () => {
    const core = getPlanById("core")!;
    const professional = getPlanById("professional")!;
    expect(isWithinPlanLimits(core, 100, 10)).toBe(true);
    expect(isWithinPlanLimits(core, 1, 11)).toBe(false);
    expect(isWithinPlanLimits(professional, 100, 50)).toBe(true);
    expect(isWithinPlanLimits(professional, 1, 51)).toBe(false);
    expect(isWithinPlanLimits(getPlanById("enterprise")!, 100, 1000)).toBe(true);
    expect(FEATURE_COMPARISON[0]).toEqual({ feature: "User licensing", core: "Per user", professional: "Per user", enterprise: "Per user" });
  });

  it.each(surfaces)("keeps %s aligned to the shared rates and removes bundle/discount copy", (path) => {
    const text = source(path);
    expect(text).toContain("@shared/planPricing");
    expect(text).toContain("USER_BILLING_EXPLANATION");
    expect(text).toContain("ANNUAL_BILLING_EXPLANATION");
    expect(text).not.toMatch(/up to (5|25) users|unlimited users|2 months free|two months free|17%|50% off/i);
    for (const { id } of expectedRates) expect(text).toContain(`PLAN_PRICING.${id}.monthlyPence`);
    expect(text).not.toMatch(/£(?:90|175|350)\s*(?:\/month|per month)/);
  });

  it("labels cost context illustrative and removes guaranteed replacement/ROI wording", () => {
    const pricing = source("client/src/pages/Pricing.tsx");
    expect(pricing).not.toContain("Replace a £47,000/year");
    expect(pricing).not.toContain("Source: Grand View Research");
    expect(pricing).toContain("A £47,000 annual budget is illustrative only");
    expect(pricing).toContain("No savings or ROI are guaranteed");
    expect(pricing).toContain("Illustrative Team Pricing");
    expect(pricing).toContain("Request Early Access");
    expect(pricing).toContain("opens the inquiry form, not payment checkout");
    expect(pricing).not.toContain("billing.createCheckout");
    expect(pricing).not.toContain("trialDays: 14");
  });

  it("does not present a fabricated current subscription on the plan comparison", () => {
    const comparison = source("client/src/pages/SubscriptionPlans.tsx");
    expect(comparison).not.toMatch(/currentPlan\s*=\s*["']professional/);
    expect(comparison).not.toContain("Current Plan");
    expect(comparison).toContain("does not show a live subscription");
    expect(comparison).toContain("Enquire About Plan");
  });
});

describe("single-user checkout uses the corrected catalog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const query = { from: vi.fn(), where: vi.fn(), limit: vi.fn().mockResolvedValue([{ stripeCustomerId: "cus_mock" }]) };
    query.from.mockReturnValue(query);
    query.where.mockReturnValue(query);
    checkoutMocks.getDb.mockResolvedValue({ select: vi.fn().mockReturnValue(query) });
    checkoutMocks.create.mockResolvedValue({ url: "https://checkout.invalid/mock", id: "cs_mock" });
  });

  for (const { id, monthly, annual } of expectedRates) {
    it.each([
      { period: "monthly" as const, amount: monthly, interval: "month" },
      { period: "yearly" as const, amount: annual, interval: "year" },
    ])(`${id} $period bills one explicit user licence at $amount pence`, async ({ period, amount, interval }) => {
      const result = await createCheckoutSession({
        userId: 123,
        email: "mock@example.invalid",
        planId: id,
        billingPeriod: period,
        origin: "https://example.invalid",
      });
      expect(result).toEqual({ url: "https://checkout.invalid/mock", sessionId: "cs_mock" });
      const request = checkoutMocks.create.mock.calls[0][0];
      expect(request.line_items).toHaveLength(1);
      expect(request.line_items[0].quantity).toBe(1);
      expect(request.line_items[0].price_data.unit_amount).toBe(amount);
      expect(request.line_items[0].price_data.recurring.interval).toBe(interval);
      expect(request.line_items[0].price_data.product_data.description).toContain("licence for one user");
      expect(request.metadata.plan_id).toBe(id);
      expect(request.metadata.billing_period).toBe(period);
    });
  }

  it("rejects unknown plans before checkout or customer creation", async () => {
    await expect(createCheckoutSession({ userId: 123, email: "mock@example.invalid", planId: "unknown", billingPeriod: "monthly", origin: "https://example.invalid" })).rejects.toThrow("Invalid plan");
    expect(checkoutMocks.create).not.toHaveBeenCalled();
    expect(checkoutMocks.customerCreate).not.toHaveBeenCalled();
  });
});
