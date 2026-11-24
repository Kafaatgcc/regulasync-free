/**
 * RegulaSync Subscription Plans
 *
 * 3-Tier Subscription Model (aligned with UK Innovator Founder Visa financial model):
 * - Core:         £90 per user/month  — Small compliance teams
 * - Professional: £175 per user/month — Growing compliance functions
 * - Enterprise:   £350 per user/month — Large regulated firms
 * Annual licence rates are 12 × monthly rates. No included-user bundles or automatic discounts.
 *
 * To activate payments:
 * 1. Claim Stripe sandbox at the provided link
 * 2. Create products in Stripe Dashboard matching these IDs
 * 3. Update priceId fields with real Stripe Price IDs
 */

import { PLAN_PRICING, formatGBP } from "../../shared/planPricing";

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number; // in pence per user/month
  priceYearly: number; // in pence per user/year, exactly 12 × monthly
  billingUnit: "user";
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
    description: "Core licence for one user. Each licensed user is billed separately; no user bundle is included.",
    priceMonthly: PLAN_PRICING.core.monthlyPence,
    priceYearly: PLAN_PRICING.core.annualPence,
    billingUnit: PLAN_PRICING.core.billingUnit,
    maxPolicies: 10,
    gapAnalysisLimit: 25,
    auditRetentionDays: 365,
    badge: "14-Day Free Trial",
    features: [
      { name: "Per-user licensing (each user billed separately)", included: true },
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
    description: "Professional licence for one user. Each licensed user is billed separately; no user bundle is included.",
    priceMonthly: PLAN_PRICING.professional.monthlyPence,
    priceYearly: PLAN_PRICING.professional.annualPence,
    billingUnit: PLAN_PRICING.professional.billingUnit,
    maxPolicies: 50,
    gapAnalysisLimit: 100,
    auditRetentionDays: 1095, // 3 years
    recommended: true,
    badge: "Most Popular",
    features: [
      { name: "Per-user licensing (each user billed separately)", included: true },
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
    description: "Enterprise licence for one user. Each licensed user is billed separately; no user bundle is included.",
    priceMonthly: PLAN_PRICING.enterprise.monthlyPence,
    priceYearly: PLAN_PRICING.enterprise.annualPence,
    billingUnit: PLAN_PRICING.enterprise.billingUnit,
    maxPolicies: -1, // Unlimited
    gapAnalysisLimit: -1, // Unlimited
    auditRetentionDays: 2555, // 7 years
    badge: "Best Value",
    features: [
      { name: "Per-user licensing (each user billed separately)", included: true },
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
  return formatGBP(priceInPence);
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
  _currentUsers: number,
  currentPolicies: number
): boolean {
  // User count is a billing quantity, not an included-seat quota. Keep the argument
  // for compatibility; this helper checks only non-seat plan limits.
  const policiesOk = plan.maxPolicies === -1 || currentPolicies <= plan.maxPolicies;
  return policiesOk;
}

// Feature comparison matrix for pricing page
export const FEATURE_COMPARISON = [
  { feature: "User licensing", core: "Per user", professional: "Per user", enterprise: "Per user" },
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
  core_monthly: "price_core_monthly",         // Replace with real ID: £90 per user/month
  core_yearly: "price_core_yearly",           // Replace with real ID: £1,080 per user/year
  professional_monthly: "price_professional_monthly", // Replace with real ID: £175 per user/month
  professional_yearly: "price_professional_yearly",   // Replace with real ID: £2,100 per user/year
  enterprise_monthly: "price_enterprise_monthly",     // Replace with real ID: £350 per user/month
  enterprise_yearly: "price_enterprise_yearly",       // Replace with real ID: £4,200 per user/year
};
