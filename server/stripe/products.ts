/**
 * RegulaSync Subscription Plans
 *
 * 3-Tier Subscription Model (aligned with UK Innovator Founder Visa financial model):
 * - Core:         £90/month  — Small compliance teams (up to 5 users)
 * - Professional: £175/month — Growing compliance functions (up to 25 users)
 * - Enterprise:   £350/month — Large regulated firms (unlimited users)
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
    id: "core",
    name: "Core",
    description: "Essential governance tools for small compliance teams",
    priceMonthly: 9000, // £90
    priceYearly: 90000, // £900 (2 months free)
    maxUsers: 5,
    maxPolicies: 10,
    gapAnalysisLimit: 25,
    auditRetentionDays: 365,
    badge: "30-Day Free Trial",
    features: [
      { name: "Up to 5 users", included: true },
      { name: "3 regulatory frameworks (FCA, PRA, ICO)", included: true },
      { name: "Core policy management", included: true },
      { name: "Basic SVAC audit trail", included: true },
      { name: "Compliance dashboard", included: true },
      { name: "PDF reports", included: true },
      { name: "Email support", included: true },
      { name: "AI policy drafting", included: false },
      { name: "Predictive risk engine", included: false },
      { name: "Board-ready reports", included: false },
      { name: "Slack/Teams integration", included: false },
      { name: "API access", included: false },
      { name: "Webhooks", included: false },
      { name: "White-label configuration", included: false },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "Advanced features for growing compliance functions",
    priceMonthly: 17500, // £175
    priceYearly: 175000, // £1,750 (2 months free)
    maxUsers: 25,
    maxPolicies: 50,
    gapAnalysisLimit: 100,
    auditRetentionDays: 1095, // 3 years
    recommended: true,
    badge: "Most Popular",
    features: [
      { name: "Up to 25 users", included: true },
      { name: "Unlimited regulatory frameworks", included: true },
      { name: "Full policy management", included: true },
      { name: "Full SVAC audit trail (3 years)", included: true },
      { name: "AI policy drafting", included: true },
      { name: "Predictive risk engine", included: true },
      { name: "Board-ready reports", included: true },
      { name: "Slack/Teams integration", included: true },
      { name: "Priority email & phone support", included: true },
      { name: "API access", included: false },
      { name: "Webhooks", included: false },
      { name: "White-label configuration", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Full platform access for large regulated firms",
    priceMonthly: 35000, // £350
    priceYearly: 350000, // £3,500 (2 months free)
    maxUsers: -1, // Unlimited
    maxPolicies: -1, // Unlimited
    gapAnalysisLimit: -1, // Unlimited
    auditRetentionDays: 2555, // 7 years
    badge: "Best Value",
    features: [
      { name: "Unlimited users", included: true },
      { name: "Unlimited regulatory frameworks", included: true },
      { name: "Full policy management", included: true },
      { name: "Full SVAC audit trail (7 years)", included: true },
      { name: "AI policy drafting", included: true },
      { name: "Predictive risk engine", included: true },
      { name: "Board-ready reports", included: true },
      { name: "Slack/Teams integration", included: true },
      { name: "REST API access", included: true },
      { name: "Outbound webhooks", included: true },
      { name: "White-label configuration", included: true },
      { name: "Custom domain", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "SLA-backed support (4h response)", included: true },
      { name: "SSO/SAML integration", included: true },
      { name: "UK GDPR data residency", included: true },
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
  { feature: "Users", core: "5", professional: "25", enterprise: "Unlimited" },
  { feature: "Regulatory frameworks", core: "3", professional: "Unlimited", enterprise: "Unlimited" },
  { feature: "AI Gap Analyses/month", core: "25", professional: "100", enterprise: "Unlimited" },
  { feature: "SVAC Audit Trail Retention", core: "1 year", professional: "3 years", enterprise: "7 years" },
  { feature: "AI Policy Drafting", core: "❌", professional: "✅", enterprise: "✅" },
  { feature: "Predictive Risk Engine", core: "❌", professional: "✅", enterprise: "✅" },
  { feature: "Board-Ready Reports", core: "❌", professional: "✅", enterprise: "✅" },
  { feature: "Slack/Teams Integration", core: "❌", professional: "✅", enterprise: "✅" },
  { feature: "REST API Access", core: "❌", professional: "❌", enterprise: "✅" },
  { feature: "Outbound Webhooks", core: "❌", professional: "❌", enterprise: "✅" },
  { feature: "White-Label / Custom Domain", core: "❌", professional: "❌", enterprise: "✅" },
  { feature: "SSO/SAML", core: "❌", professional: "❌", enterprise: "✅" },
  { feature: "Dedicated Account Manager", core: "❌", professional: "❌", enterprise: "✅" },
  { feature: "SLA Guarantee", core: "❌", professional: "❌", enterprise: "4h response" },
  { feature: "SMCR Module", core: "❌", professional: "✅", enterprise: "✅" },
  { feature: "Consumer Duty Templates", core: "❌", professional: "✅", enterprise: "✅" },
];

// Stripe Price IDs - Update these after creating products in Stripe Dashboard
export const STRIPE_PRICE_IDS = {
  core_monthly: "price_core_monthly",         // Replace with real ID: £90/mo
  core_yearly: "price_core_yearly",           // Replace with real ID: £900/yr
  professional_monthly: "price_professional_monthly", // Replace with real ID: £175/mo
  professional_yearly: "price_professional_yearly",   // Replace with real ID: £1,750/yr
  enterprise_monthly: "price_enterprise_monthly",     // Replace with real ID: £350/mo
  enterprise_yearly: "price_enterprise_yearly",       // Replace with real ID: £3,500/yr
};
