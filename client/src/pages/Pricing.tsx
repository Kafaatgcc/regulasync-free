import { Link } from "wouter";
import { Check, HelpCircle, Building2, Users, Globe, TrendingUp } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PLAN_PRICING, MONTHLY_PRICE_PERIOD, ANNUAL_PRICE_PERIOD, ANNUAL_BILLING_EXPLANATION, USER_BILLING_EXPLANATION, formatGBP, planTotalPence } from "@shared/planPricing";

const pricingTiers = [
  {
    name: "Core",
    description: "Essential governance tools for small compliance teams",
    price: formatGBP(PLAN_PRICING.core.monthlyPence),
    period: MONTHLY_PRICE_PERIOD,
    annualPrice: `${formatGBP(PLAN_PRICING.core.annualPence)}${ANNUAL_PRICE_PERIOD}`,
    icon: Users,
    color: "slate",
    badge: "Proposed Early Access",
    features: [
      { text: "Per-user licensing", tooltip: USER_BILLING_EXPLANATION },
      { text: "3 regulatory frameworks (FCA, PRA, ICO)", tooltip: "Core UK regulatory coverage" },
      { text: "Policy management", tooltip: "Create, version, and manage compliance policies" },
      { text: "Basic audit trail (SVAC)", tooltip: "Tamper-evident design; integrity and coverage require validation" },
      { text: "Compliance dashboard", tooltip: "Real-time compliance status overview" },
      { text: "UK regulatory feeds", tooltip: "FCA, PRA, ICO regulatory updates" },
      { text: "PDF report exports", tooltip: "Generate board-ready compliance reports" },
      { text: "Email support (proposed)", tooltip: "Response targets will be confirmed in agreed service terms" },
    ],
    cta: "Request Early Access",
    popular: false,
    targetUsers: "UK SMEs, small compliance teams",
  },
  {
    name: "Professional",
    description: "Advanced AI-powered compliance for growing organisations",
    price: formatGBP(PLAN_PRICING.professional.monthlyPence),
    period: MONTHLY_PRICE_PERIOD,
    annualPrice: `${formatGBP(PLAN_PRICING.professional.annualPence)}${ANNUAL_PRICE_PERIOD}`,
    icon: Building2,
    color: "blue",
    badge: "Most Popular",
    features: [
      { text: "Per-user licensing", tooltip: USER_BILLING_EXPLANATION },
      { text: "Unlimited regulatory frameworks", tooltip: "All UK and relevant EU frameworks" },
      { text: "AI policy drafting", tooltip: "AI-generated policy drafts aligned to regulations" },
      { text: "Predictive risk engine", tooltip: "Illustrative heuristic risk scenarios requiring human review" },
      { text: "SVAC audit trail", tooltip: "Hash-linked records; integrity and coverage require validation" },
      { text: "Board-ready reports", tooltip: "Automated executive and board reporting" },
      { text: "Delegation of authority workflows", tooltip: "7-level approval chain automation" },
      { text: "Slack/Teams integration (planned)", tooltip: "Proposed connectivity; timing to be confirmed" },
      { text: "Priority support (proposed)", tooltip: "Response targets will be confirmed in agreed service terms" },
    ],
    cta: "Request Early Access",
    popular: true,
    targetUsers: "UK financial services and professional services firms",
  },
  {
    name: "Enterprise",
    description: "Full platform access for large regulated organisations",
    price: formatGBP(PLAN_PRICING.enterprise.monthlyPence),
    period: MONTHLY_PRICE_PERIOD,
    annualPrice: `${formatGBP(PLAN_PRICING.enterprise.annualPence)}${ANNUAL_PRICE_PERIOD}`,
    icon: Globe,
    color: "purple",
    badge: "Full Capability",
    features: [
      { text: "Per-user licensing", tooltip: USER_BILLING_EXPLANATION },
      { text: "All Professional features", tooltip: "Complete platform access" },
      { text: "White-label configuration", tooltip: "Custom branding and domain" },
      { text: "API access & webhooks (planned)", tooltip: "Production connectivity requires implementation and validation" },
      { text: "Custom regulatory frameworks", tooltip: "Bespoke regulatory coverage" },
      { text: "Dedicated account manager (proposed)", tooltip: "Staffing and service arrangements to be agreed" },
      { text: "Service-level terms (planned)", tooltip: "No production uptime guarantee is evidenced in this prototype" },
      { text: "Custom onboarding package", tooltip: "Guided implementation and training" },
    ],
    cta: "Contact Sales",
    popular: false,
    targetUsers: "Large regulated firms, multi-entity organisations",
  },
];

const faqs = [
  {
    question: "How will early access work?",
    answer: "Early access is proposed for Q2 2027. Register interest to discuss a pilot; availability, duration, included features and any payment requirements must be confirmed in writing. No active 14-day or no-card Professional trial is currently offered.",
  },
  {
    question: "Can I change plans later?",
    answer: "Plan changes are intended to be supported under the proposed Q2 2027 commercial terms. Upgrade and downgrade availability, timing and charges must be agreed before paid-service activation; immediate changes are not currently promised.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: `${ANNUAL_BILLING_EXPLANATION} These are proposed Q2 2027 billing terms, subject to written confirmation before paid-service activation.`,
  },
  {
    question: "What payment methods are planned?",
    answer: "Payment acceptance is not confirmed for this pre-launch prototype. Available payment methods and any Enterprise invoicing arrangements will be confirmed in the agreed commercial terms before paid-service activation, proposed for Q2 2027.",
  },
  {
    question: "Is there a setup fee?",
    answer: "Setup fees and onboarding arrangements are not yet confirmed. Any Core, Professional or Enterprise implementation charges will be set out in a written quote under the proposed Q2 2027 commercial terms.",
  },
  {
    question: "How are users counted?",
    answer: `${USER_BILLING_EXPLANATION} The proposed monthly total is the plan's per-user rate multiplied by the number of licensed users. This page previews proposed licence prices, not an activated paid-service offer; contact sales to discuss proposed team terms.`,
  },
  {
    question: "What's the minimum contract term?",
    answer: "The proposed Q2 2027 model is monthly billing for monthly plans and yearly billing at 12 × the monthly per-user rate for annual plans. Minimum terms, cancellation rights and activation dates must be confirmed in the agreed commercial terms before purchase.",
  },
  {
    question: "Do you offer volume discounts?",
    answer: "Published proposed rates apply per user. Any bespoke Q2 2027 commercial terms must be confirmed in a written quote; no volume discount is assumed.",
  },
];

const marketStats = [
  { label: "Illustrative manual compliance budget", value: "£47K", growth: "Annual assumption, not a verified average" },
  { label: "Illustrative Core team", value: "5 users", growth: "Each user licensed separately" },
  { label: "Illustrative Core licence cost", value: formatGBP(planTotalPence("core", 5)), growth: "Team total per month; VAT may apply" },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-4">
            Three tiers built specifically for UK regulated businesses.
            Per-user licensing starts at {formatGBP(PLAN_PRICING.core.monthlyPence)} per user/month.
            RegulaSync supports compliance workflows; it does not replace your compliance responsibilities or guarantee savings.
          </p>
          <p className="text-sm text-slate-500">
            Prices shown in GBP. VAT may apply for UK customers. {USER_BILLING_EXPLANATION}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            {ANNUAL_BILLING_EXPLANATION} Request Early Access opens the inquiry form, not payment checkout. Trial, payment and activation terms must be confirmed before purchase.
          </p>
          <p className="text-sm text-amber-800 mt-3">Pre-launch proposed pricing and features for Q2 2027. Production integrations, support terms and payment activation are subject to confirmation; this assessment prototype is not a live paid-service offer.</p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => {
              const IconComponent = tier.icon;
              return (
                <Card
                  key={tier.name}
                  className={`relative overflow-hidden ${tier.popular ? 'border-2 border-[#1e3a5f] shadow-xl scale-105' : 'border shadow-lg'}`}
                >
                  {tier.popular && (
                    <div className="absolute top-0 right-0 bg-[#1e3a5f] text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        tier.color === 'blue' ? 'bg-[#1e3a5f]/10' :
                        tier.color === 'purple' ? 'bg-purple-100' : 'bg-slate-100'
                      }`}>
                        <IconComponent className={`w-6 h-6 ${
                          tier.color === 'blue' ? 'text-[#1e3a5f]' :
                          tier.color === 'purple' ? 'text-purple-600' : 'text-slate-600'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{tier.name}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-sm">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="flex flex-wrap items-baseline gap-1">
                        <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                        <span className="text-slate-500">{tier.period}</span>
                      </div>
                      {tier.annualPrice && (
                        <div className="mt-2 text-sm">
                          <span className="text-slate-600">{tier.annualPrice}</span>
                        </div>
                      )}
                      <div className="mt-3 text-xs text-slate-500 bg-slate-50 rounded px-2 py-1">
                        Ideal for: {tier.targetUsers}
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-700 flex items-center gap-1">
                            {feature.text}
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{feature.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                        </li>
                      ))}
                    </ul>

                    {tier.cta === "Contact Sales" ? (
                      <Link href="/contact">
                        <Button
                          className="w-full"
                          variant="outline"
                        >
                          {tier.cta}
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/contact?plan=${tier.name.toLowerCase()}`}>
                        <Button
                          className={`w-full ${tier.popular ? 'bg-[#1e3a5f] hover:bg-[#2d5a87]' : ''}`}
                          variant={tier.popular ? 'default' : 'outline'}
                        >
                          {tier.cta}
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Calculator Example */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg border p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Illustrative Team Pricing</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-500 mb-2">Small Team</div>
                <div className="text-2xl font-bold text-slate-900">{formatGBP(planTotalPence("core", 5))}<span className="text-sm font-normal">/month total</span></div>
                <div className="text-xs text-slate-500">Core — 5 × {formatGBP(PLAN_PRICING.core.monthlyPence)} per user/month</div>
              </div>
              <div className="p-4 bg-[#1e3a5f]/5 rounded-lg border border-[#1e3a5f]/20">
                <div className="text-sm text-slate-500 mb-2">Growing Team</div>
                <div className="text-2xl font-bold text-[#1e3a5f]">{formatGBP(planTotalPence("professional", 10))}<span className="text-sm font-normal">/month total</span></div>
                <div className="text-xs text-slate-500">Professional — 10 × {formatGBP(PLAN_PRICING.professional.monthlyPence)} per user/month</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-500 mb-2">Large Organisation</div>
                <div className="text-2xl font-bold text-slate-900">{formatGBP(planTotalPence("enterprise", 20))}<span className="text-sm font-normal">/month total</span></div>
                <div className="text-xs text-slate-500">Enterprise — 20 × {formatGBP(PLAN_PRICING.enterprise.monthlyPence)} per user/month</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Opportunity Section */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Illustrative Cost Context</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {marketStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm border">
                <div className="text-3xl font-bold text-[#1e3a5f] mb-2">{stat.value}</div>
                <div className="text-sm text-slate-600 mb-2">{stat.label}</div>
                <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  {stat.growth}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 mt-6">
            These are planning examples, not customer results or verified market statistics.
            A £47,000 annual budget is illustrative only; licence costs do not imply that this budget can be eliminated.
            Actual outcomes depend on team size, implementation and retained compliance work. No savings or ROI are guaranteed.
          </p>
        </div>
      </section>

      {/* Early Access Banner */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-[#b87333]/10 to-[#1e3a5f]/10 rounded-2xl p-8 text-center border border-[#b87333]/20">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Early Access Program</h3>
            <p className="text-slate-600 mb-6">
              Register interest in a pilot to discuss your team's needs and provide product feedback.
              Availability and any commercial terms must be confirmed in writing; no discount is assumed.
            </p>
            <Link href="/#request-demo">
              <Button size="lg" className="bg-[#b87333] hover:bg-[#a06329]">
                Apply for Early Access
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-50 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-sm text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-20 px-4 bg-[#1e3a5f]">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Need a Custom Solution?</h2>
          <p className="text-xl text-white/80 mb-8">
            Our Enterprise plan can be tailored to your organisation's specific governance requirements,
            compliance frameworks, and integration needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#request-demo">
              <Button size="lg" className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                Schedule a Consultation
              </Button>
            </Link>
            <Link href="/security">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Security Details
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
