import { useState } from "react";
import { Link } from "wouter";
import { Check, HelpCircle, Building2, Users, Globe, TrendingUp, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const pricingTiers = [
  {
    name: "Core",
    description: "Essential governance tools for small compliance teams",
    price: "£90",
    period: "/month",
    annualPrice: "£900/year",
    savings: "2 months free",
    icon: Users,
    color: "slate",
    badge: "14-Day Free Trial",
    features: [
      { text: "Up to 5 users", tooltip: "Team collaboration for small compliance teams" },
      { text: "3 regulatory frameworks (FCA, PRA, ICO)", tooltip: "Core UK regulatory coverage" },
      { text: "Policy management", tooltip: "Create, version, and manage compliance policies" },
      { text: "Basic audit trail (SVAC)", tooltip: "Cryptographic tamper-resistant audit records" },
      { text: "Compliance dashboard", tooltip: "Real-time compliance status overview" },
      { text: "UK regulatory feeds", tooltip: "FCA, PRA, ICO regulatory updates" },
      { text: "PDF report exports", tooltip: "Generate board-ready compliance reports" },
      { text: "Email support", tooltip: "Response within 48 hours" },
    ],
    cta: "Start Free Trial",
    popular: false,
    targetUsers: "UK SMEs, small compliance teams",
  },
  {
    name: "Professional",
    description: "Advanced AI-powered compliance for growing organisations",
    price: "£175",
    period: "/month",
    annualPrice: "£1,750/year",
    savings: "2 months free",
    icon: Building2,
    color: "blue",
    badge: "Most Popular",
    features: [
      { text: "Up to 25 users", tooltip: "Full team collaboration" },
      { text: "Unlimited regulatory frameworks", tooltip: "All UK and relevant EU frameworks" },
      { text: "AI policy drafting", tooltip: "AI-generated policy drafts aligned to regulations" },
      { text: "Predictive risk engine", tooltip: "AI-powered risk scoring and forecasting" },
      { text: "Full SVAC audit trail", tooltip: "Complete cryptographic audit chain" },
      { text: "Board-ready reports", tooltip: "Automated executive and board reporting" },
      { text: "Delegation of authority workflows", tooltip: "7-level approval chain automation" },
      { text: "Slack/Teams integration", tooltip: "Compliance alerts in your existing tools" },
      { text: "Priority support", tooltip: "Response within 24 hours" },
    ],
    cta: "Start Free Trial",
    popular: true,
    targetUsers: "UK financial services and professional services firms",
  },
  {
    name: "Enterprise",
    description: "Full platform access for large regulated organisations",
    price: "£350",
    period: "/month",
    annualPrice: "£3,500/year",
    savings: "2 months free",
    icon: Globe,
    color: "purple",
    badge: "Full Capability",
    features: [
      { text: "Unlimited users", tooltip: "Organisation-wide access" },
      { text: "All Professional features", tooltip: "Complete platform access" },
      { text: "White-label configuration", tooltip: "Custom branding and domain" },
      { text: "API access & webhooks", tooltip: "Full integration with enterprise systems" },
      { text: "Custom regulatory frameworks", tooltip: "Bespoke regulatory coverage" },
      { text: "Dedicated account manager", tooltip: "Named support contact" },
      { text: "SLA-backed support", tooltip: "99.9% uptime guarantee" },
      { text: "Custom onboarding package", tooltip: "Guided implementation and training" },
    ],
    cta: "Contact Sales",
    popular: false,
    targetUsers: "Large regulated firms, multi-entity organisations",
  },
];

const faqs = [
  {
    question: "What's included in the free trial?",
    answer: "Our 14-day free trial includes full access to all Professional tier features. No credit card required to start.",
  },
  {
    question: "Can I change plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: "Yes, annual billing saves you approximately 17% compared to monthly billing across all tiers.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, bank transfers, and can arrange invoicing for Enterprise customers.",
  },
  {
    question: "Is there a setup fee?",
    answer: "Core and Professional tiers have no setup fees. Enterprise implementations include a custom onboarding package.",
  },
  {
    question: "How does user counting work?",
    answer: "Users are counted as active accounts that can log into the platform. You can add or remove users at any time.",
  },
  {
    question: "What's the minimum contract term?",
    answer: "Monthly plans have no minimum term. Annual plans are billed yearly with the 17% discount applied.",
  },
  {
    question: "Do you offer volume discounts?",
    answer: "Yes, organisations with 50+ users are eligible for volume discounts. Contact our sales team for details.",
  },
];

const marketStats = [
  { label: "UK Compliance Market", value: "£33.9B", growth: "Growing annually" },
  { label: "Average SME Compliance Cost", value: "£47K", growth: "Per year, manual process" },
  { label: "Target UK Firms", value: "5,500+", growth: "FCA/PRA regulated SMEs" },
];

export default function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user } = useAuth();
  
  const createCheckout = trpc.billing.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error("Failed to start checkout", { description: error.message });
      setLoadingPlan(null);
    },
  });

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      return;
    }
    
    setLoadingPlan(planId);
    createCheckout.mutate({
      planId: planId.toLowerCase(),
      billingPeriod: "yearly",
      trialDays: 14,
    });
  };

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
            Replace a £47,000/year manual compliance burden from as little as £90/month.
          </p>
          <p className="text-sm text-slate-500">
            Prices shown in GBP. VAT may apply for UK customers.
          </p>
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
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                        <span className="text-slate-500">{tier.period}</span>
                      </div>
                      {tier.annualPrice && (
                        <div className="mt-2 text-sm">
                          <span className="text-slate-600">{tier.annualPrice}</span>
                          {tier.savings && (
                            <span className="ml-2 text-green-600 font-medium">{tier.savings}</span>
                          )}
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
                      <Link href="/#request-demo">
                        <Button 
                          className="w-full"
                          variant="outline"
                        >
                          {tier.cta}
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        className={`w-full ${tier.popular ? 'bg-[#1e3a5f] hover:bg-[#2d5a87]' : ''}`}
                        variant={tier.popular ? 'default' : 'outline'}
                        disabled={loadingPlan === tier.name.toLowerCase()}
                        onClick={() => handleSubscribe(tier.name)}
                      >
                        {loadingPlan === tier.name.toLowerCase() ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          tier.cta
                        )}
                      </Button>
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
            <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Example Pricing</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-500 mb-2">Small Team</div>
                <div className="text-2xl font-bold text-slate-900">£90<span className="text-sm font-normal">/month</span></div>
                <div className="text-xs text-slate-500">Core Plan — up to 5 users</div>
              </div>
              <div className="p-4 bg-[#1e3a5f]/5 rounded-lg border border-[#1e3a5f]/20">
                <div className="text-sm text-slate-500 mb-2">Growing Team</div>
                <div className="text-2xl font-bold text-[#1e3a5f]">£175<span className="text-sm font-normal">/month</span></div>
                <div className="text-xs text-slate-500">Professional Plan — up to 25 users</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-500 mb-2">Large Organisation</div>
                <div className="text-2xl font-bold text-slate-900">£350<span className="text-sm font-normal">/month</span></div>
                <div className="text-xs text-slate-500">Enterprise Plan — unlimited users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Opportunity Section */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Growing Market Opportunity</h3>
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
            Source: Grand View Research, GlobeNewswire, Market Research Reports
          </p>
        </div>
      </section>

      {/* Early Access Banner */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-[#b87333]/10 to-[#1e3a5f]/10 rounded-2xl p-8 text-center border border-[#b87333]/20">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Early Access Program</h3>
            <p className="text-slate-600 mb-6">
              Join our pilot program and receive <strong>50% off</strong> your first year, 
              plus direct input into product development and priority feature requests.
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
