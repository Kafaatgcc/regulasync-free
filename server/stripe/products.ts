/**
 * RegulaSync Subscription Plans
 * 
 * 4-Tier Subscription Model:
 * - Starter: £19/month - Solo compliance officers
 * - Core: £39/month - Small teams (1-5 users)
 * - Professional: £99/month - Growing teams (up to 25 users)
 * - Enterprise: £199/month - Large organizations (unlimited)
 * 
 * To activate payments:
 * 1. Claim Stripe sandbox at the provided link
 * 2. Create products in Stripe Dashboard matching these IDs
 * 3. Update priceId fields with real Stripe Price IDs
 */

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number; // in pence
  priceYearly: number; // in pence (2 months free)
  maxUsers: number; // -1 = unlimited
  maxPolicies: number; // -1 = unlimited
  gapAnalysisLimit: number; // -1 = unlimited
  auditRetentionDays: number;
  features: PlanFeature[];
  recommended?: boolean;
  badge?: string;
  stripePriceId?: string; // Update with real Stripe Price ID after creating products
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for solo compliance officers getting started",
    priceMonthly: 1900, // £19
    priceYearly: 19000, // £190 (2 months free)
    maxUsers: 1,
    maxPolicies: 2,
    gapAnalysisLimit: 5,
    auditRetentionDays: 30,
    badge: "14-Day Free Trial",
    features: [
      { name: "Compliance Policies", included: true, limit: "2 policies" },
      { name: "Team Members", included: true, limit: "1 user" },
      { name: "AI Gap Analysis", included: true, limit: "5/month" },
      { name: "Audit Trail", included: true, limit: "30 days" },
      { name: "Hash Verification", included: false },
      { name: "Regulatory Feeds", included: true, limit: "UK only" },
      { name: "Compliance Dashboard", included: true },
      { name: "PDF Reports", included: true },
      { name: "Email Support", included: true },
      { name: "API Access", included: false },
      { name: "SSO Integration", included: false },
    ],
  },
  {
    id: "core",
    name: "Core",
    description: "Essential governance tools for small compliance teams",
    priceMonthly: 3900, // £39
    priceYearly: 39000, // £390 (2 months free)
    maxUsers: 5,
    maxPolicies: 10,
    gapAnalysisLimit: 25,
    auditRetentionDays: 365,
    features: [
      { name: "Compliance Policies", included: true, limit: "10 policies" },
      { name: "Team Members", included: true, limit: "5 users" },
      { name: "AI Gap Analysis", included: true, limit: "25/month" },
      { name: "Audit Trail", included: true, limit: "1 year" },
      { name: "Hash Verification", included: true },
      { name: "Regulatory Feeds", included: true, limit: "UK + EU" },
      { name: "Compliance Dashboard", included: true },
      { name: "PDF & CSV Reports", included: true },
      { name: "Priority Email Support", included: true },
      { name: "Delegation Workflows", included: true },
      { name: "Compliance Calendar", included: true },
      { name: "API Access", included: false },
      { name: "SSO Integration", included: false },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "Advanced features for growing compliance teams",
    priceMonthly: 9900, // £99
    priceYearly: 99000, // £990 (2 months free)
    maxUsers: 25,
    maxPolicies: 50,
    gapAnalysisLimit: 100,
    auditRetentionDays: 1095, // 3 years
    recommended: true,
    badge: "Most Popular",
    features: [
      { name: "Compliance Policies", included: true, limit: "50 policies" },
      { name: "Team Members", included: true, limit: "25 users" },
      { name: "AI Gap Analysis", included: true, limit: "100/month" },
      { name: "Audit Trail", included: true, limit: "3 years" },
      { name: "Hash Verification", included: true },
      { name: "Regulatory Feeds", included: true, limit: "Global" },
      { name: "Advanced Analytics", included: true },
      { name: "All Export Formats", included: true },
      { name: "Priority Phone & Email", included: true },
      { name: "Full Workflow Automation", included: true },
      { name: "API Access", included: true, limit: "10,000 calls/month" },
      { name: "SMCR Module", included: true },
      { name: "Consumer Duty Templates", included: true },
      { name: "99.5% SLA", included: true },
      { name: "SSO Integration", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Full platform access for large organizations",
    priceMonthly: 19900, // £199
    priceYearly: 199000, // £1,990 (2 months free)
    maxUsers: -1, // Unlimited
    maxPolicies: -1, // Unlimited
    gapAnalysisLimit: -1, // Unlimited
    auditRetentionDays: 2555, // 7 years
    badge: "Best Value",
    features: [
      { name: "Compliance Policies", included: true, limit: "Unlimited" },
      { name: "Team Members", included: true, limit: "Unlimited" },
      { name: "AI Gap Analysis", included: true, limit: "Unlimited" },
      { name: "Audit Trail", included: true, limit: "7 years" },
      { name: "Hash Verification", included: true },
      { name: "Regulatory Feeds", included: true, limit: "Global + Custom" },
      { name: "Enterprise Analytics", included: true },
      { name: "Custom Reports", included: true },
      { name: "Dedicated Account Manager", included: true },
      { name: "Full Workflow Automation", included: true },
      { name: "Unlimited API Access", included: true },
      { name: "All Compliance Modules", included: true },
      { name: "SSO/SAML Integration", included: true },
      { name: "Custom Branding", included: true },
      { name: "Data Residency Options", included: true },
      { name: "99.9% SLA Guarantee", included: true },
      { name: "Quarterly Business Reviews", included: true },
    ],
  },
];

// Helper functions
export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
}

export function formatPrice(priceInPence: number): string {
  return `£${(priceInPence / 100).toFixed(0)}`;
}

export function getAnnualSavings(plan: SubscriptionPlan): number {
  const monthlyTotal = plan.priceMonthly * 12;
  return monthlyTotal - plan.priceYearly;
}

export function getAnnualSavingsPercentage(plan: SubscriptionPlan): number {
  const monthlyTotal = plan.priceMonthly * 12;
  return Math.round(((monthlyTotal - plan.priceYearly) / monthlyTotal) * 100);
}

export function isWithinPlanLimits(
  plan: SubscriptionPlan,
  currentUsers: number,
  currentPolicies: number
): boolean {
  const usersOk = plan.maxUsers === -1 || currentUsers <= plan.maxUsers;
  const policiesOk = plan.maxPolicies === -1 || currentPolicies <= plan.maxPolicies;
  return usersOk && policiesOk;
}

// Feature comparison matrix for pricing page
export const FEATURE_COMPARISON = [
  { feature: "Compliance Policies", starter: "2", core: "10", professional: "50", enterprise: "Unlimited" },
  { feature: "Team Members", starter: "1", core: "5", professional: "25", enterprise: "Unlimited" },
  { feature: "AI Gap Analyses/month", starter: "5", core: "25", professional: "100", enterprise: "Unlimited" },
  { feature: "Audit Trail Retention", starter: "30 days", core: "1 year", professional: "3 years", enterprise: "7 years" },
  { feature: "Hash Verification", starter: "❌", core: "✅", professional: "✅", enterprise: "✅" },
  { feature: "Regulatory Feeds", starter: "UK only", core: "UK + EU", professional: "Global", enterprise: "Global + Custom" },
  { feature: "API Access", starter: "❌", core: "❌", professional: "✅", enterprise: "✅" },
  { feature: "SSO/SAML", starter: "❌", core: "❌", professional: "❌", enterprise: "✅" },
  { feature: "Dedicated Support", starter: "❌", core: "❌", professional: "❌", enterprise: "✅" },
  { feature: "SLA Guarantee", starter: "❌", core: "❌", professional: "99.5%", enterprise: "99.9%" },
  { feature: "SMCR Module", starter: "❌", core: "❌", professional: "✅", enterprise: "✅" },
  { feature: "Consumer Duty Templates", starter: "❌", core: "❌", professional: "✅", enterprise: "✅" },
  { feature: "Custom Branding", starter: "❌", core: "❌", professional: "❌", enterprise: "✅" },
];

// Stripe Price IDs - Update these after creating products in Stripe Dashboard
export const STRIPE_PRICE_IDS = {
  starter_monthly: "price_starter_monthly", // Replace with real ID
  starter_yearly: "price_starter_yearly",
  core_monthly: "price_core_monthly",
  core_yearly: "price_core_yearly",
  professional_monthly: "price_professional_monthly",
  professional_yearly: "price_professional_yearly",
  enterprise_monthly: "price_enterprise_monthly",
  enterprise_yearly: "price_enterprise_yearly",
};
