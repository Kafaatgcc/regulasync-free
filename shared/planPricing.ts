/** Published GBP licence rates. Annual billing is exactly 12 monthly payments per user. */
const licenceRate = (monthlyPence: number) => ({
  monthlyPence,
  annualPence: monthlyPence * 12,
  billingUnit: "user" as const,
});

export const PLAN_PRICING = {
  core: licenceRate(9000),
  professional: licenceRate(17500),
  enterprise: licenceRate(35000),
} as const;

export type PlanId = keyof typeof PLAN_PRICING;

export const MONTHLY_PRICE_PERIOD = " per user/month";
export const ANNUAL_PRICE_PERIOD = " per user/year";
export const ANNUAL_BILLING_EXPLANATION =
  "Annual billing is 12 × the monthly per-user rate, with no automatic discount.";
export const USER_BILLING_EXPLANATION =
  "Each licensed user is billed separately; prices do not include a bundle of users.";

export function formatGBP(priceInPence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(priceInPence / 100);
}

/** Illustrative team totals only; licence quantities must be positive whole numbers. */
export function planTotalPence(
  planId: PlanId,
  licensedUsers: number,
  billingPeriod: "monthly" | "yearly" = "monthly"
): number {
  if (!Number.isSafeInteger(licensedUsers) || licensedUsers < 1) {
    throw new Error("Licensed users must be a positive whole number");
  }
  const price = PLAN_PRICING[planId];
  return (billingPeriod === "yearly" ? price.annualPence : price.monthlyPence) * licensedUsers;
}
