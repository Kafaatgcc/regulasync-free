import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Zap, Building2, Globe } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

const PLANS = [
  {
    id: "core",
    name: "Core",
    tagline: "For small compliance teams getting started",
    price: "£90",
    period: "/month",
    highlight: false,
    icon: Zap,
    color: "text-slate-400",
    borderColor: "border-border",
    features: [
      { label: "Up to 5 users", included: true },
      { label: "3 regulatory frameworks", included: true },
      { label: "Core policy management", included: true },
      { label: "Basic audit trail", included: true },
      { label: "Email support", included: true },
      { label: "AI policy drafting", included: false },
      { label: "Predictive risk engine", included: false },
      { label: "Board-ready reports", included: false },
      { label: "Slack/Teams integration", included: false },
      { label: "API access", included: false },
      { label: "Webhooks", included: false },
      { label: "White-label configuration", included: false },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "For growing compliance functions",
    price: "£175",
    period: "/month",
    highlight: true,
    icon: Building2,
    color: "text-blue-400",
    borderColor: "border-blue-500/50",
    features: [
      { label: "Up to 25 users", included: true },
      { label: "Unlimited frameworks", included: true },
      { label: "Full policy management", included: true },
      { label: "Full audit trail", included: true },
      { label: "Priority support", included: true },
      { label: "AI policy drafting", included: true },
      { label: "Predictive risk engine", included: true },
      { label: "Board-ready reports", included: true },
      { label: "Slack/Teams integration", included: true },
      { label: "API access", included: false },
      { label: "Webhooks", included: false },
      { label: "White-label configuration", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For large regulated firms requiring full capability",
    price: "£350",
    period: "",
    highlight: false,
    icon: Globe,
    color: "text-amber-400",
    borderColor: "border-amber-500/40",
    features: [
      { label: "Unlimited users", included: true },
      { label: "Unlimited frameworks", included: true },
      { label: "Full policy management", included: true },
      { label: "Full audit trail", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "AI policy drafting", included: true },
      { label: "Predictive risk engine", included: true },
      { label: "Board-ready reports", included: true },
      { label: "Slack/Teams integration", included: true },
      { label: "API access", included: true },
      { label: "Webhooks", included: true },
      { label: "White-label configuration", included: true },
    ],
  },
];

const FEATURE_COMPARISON = [
  { category: "Users & Access", features: [
    { name: "Users", starter: "5", professional: "25", enterprise: "Unlimited" },
    { name: "Roles", starter: "5", professional: "5", enterprise: "5 + Custom" },
    { name: "SSO / SAML", starter: "—", professional: "—", enterprise: "✓" },
  ]},
  { category: "Compliance", features: [
    { name: "Regulatory frameworks", starter: "3", professional: "Unlimited", enterprise: "Unlimited" },
    { name: "Obligation mapping", starter: "Basic", professional: "Full", enterprise: "Full" },
    { name: "Gap analysis", starter: "Manual", professional: "AI-assisted", enterprise: "AI-assisted" },
    { name: "Compliance score", starter: "✓", professional: "✓", enterprise: "✓" },
  ]},
  { category: "AI Features", features: [
    { name: "AI Policy Copilot", starter: "—", professional: "✓", enterprise: "✓" },
    { name: "Predictive risk engine", starter: "—", professional: "✓", enterprise: "✓" },
    { name: "Regulatory intelligence feed", starter: "Weekly", professional: "Real-time", enterprise: "Real-time" },
    { name: "Smart audit search", starter: "—", professional: "✓", enterprise: "✓" },
  ]},
  { category: "Reporting", features: [
    { name: "Board-ready reports", starter: "—", professional: "✓", enterprise: "✓" },
    { name: "Audit export (PDF/CSV)", starter: "✓", professional: "✓", enterprise: "✓" },
    { name: "ESG reporting", starter: "—", professional: "✓", enterprise: "✓" },
    { name: "Custom report templates", starter: "—", professional: "—", enterprise: "✓" },
  ]},
  { category: "Integrations", features: [
    { name: "Slack/Teams notifications", starter: "—", professional: "✓", enterprise: "✓" },
    { name: "REST API access", starter: "—", professional: "—", enterprise: "✓" },
    { name: "Outbound webhooks", starter: "—", professional: "—", enterprise: "✓" },
    { name: "White-label / custom domain", starter: "—", professional: "—", enterprise: "✓" },
  ]},
  { category: "Support", features: [
    { name: "Support channel", starter: "Email", professional: "Priority email", enterprise: "Dedicated manager" },
    { name: "SLA", starter: "48h", professional: "24h", enterprise: "4h" },
    { name: "Onboarding assistance", starter: "Self-serve", professional: "Guided", enterprise: "White-glove" },
  ]},
];

export default function SubscriptionPlans() {
  const { user } = useAuth();
  const { data: orgs } = trpc.superAdmin.listOrgs.useQuery(undefined, { enabled: user?.role === "super_admin" });

  const currentPlan = "professional"; // Would come from org data in production

  return (
    <div className="space-y-12 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Subscription Plans</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Choose the plan that fits your compliance function. All plans include a 30-day free trial.
          No credit card required.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = plan.id === currentPlan;
          return (
            <Card
              key={plan.id}
              className={`bg-card border-2 relative ${plan.borderColor} ${plan.highlight ? "shadow-lg shadow-blue-500/10" : ""}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white text-xs px-3">Most Popular</Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-600 text-white text-xs px-3">Current Plan</Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${plan.color}`} />
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((f) => (
                    <div key={f.label} className="flex items-center gap-2">
                      {f.included
                        ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        : <XCircle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                      }
                      <span className={`text-sm ${f.included ? "text-foreground" : "text-muted-foreground/50"}`}>
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  className={`w-full ${
                    isCurrent ? "bg-muted text-muted-foreground cursor-default" :
                    plan.highlight ? "bg-blue-600 hover:bg-blue-700 text-white" :
                    plan.id === "enterprise" ? "bg-amber-600 hover:bg-amber-700 text-white" :
                    "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                  disabled={isCurrent}
                  onClick={() => {
                    if (plan.id === "enterprise") {
                      toast.info("Contact sales@regulasync.co.uk for Enterprise pricing");
                    } else {
                      toast.info("Billing integration coming soon. Contact sales@regulasync.co.uk");
                    }
                  }}
                >
                  {isCurrent ? "Current Plan" :
                   plan.id === "enterprise" ? "Contact Sales" :
                   "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Full Feature Comparison</h2>
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 text-muted-foreground font-medium">Feature</th>
                  <th className="text-center p-4 text-slate-400 font-medium">Core</th>
                  <th className="text-center p-4 text-blue-400 font-medium">Professional</th>
                  <th className="text-center p-4 text-amber-400 font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_COMPARISON.map((section) => (
                  <>
                    <tr key={section.category} className="bg-muted/20">
                      <td colSpan={4} className="p-3 pl-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {section.category}
                      </td>
                    </tr>
                    {section.features.map((f) => (
                      <tr key={f.name} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                        <td className="p-3 pl-4 text-foreground">{f.name}</td>
                        <td className="p-3 text-center text-muted-foreground">
                          {f.starter === "✓" ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> :
                           f.starter === "—" ? <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" /> :
                           f.starter}
                        </td>
                        <td className="p-3 text-center text-muted-foreground">
                          {f.professional === "✓" ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> :
                           f.professional === "—" ? <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" /> :
                           f.professional}
                        </td>
                        <td className="p-3 text-center text-muted-foreground">
                          {f.enterprise === "✓" ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> :
                           f.enterprise === "—" ? <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" /> :
                           f.enterprise}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* CTA */}
      <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20">
        <h3 className="text-xl font-bold text-foreground mb-2">Need a custom solution?</h3>
        <p className="text-muted-foreground mb-4">
          Enterprise clients receive custom pricing, dedicated onboarding, and SLA-backed support.
        </p>
        <Button
          className="bg-amber-600 hover:bg-amber-700 text-white"
          onClick={() => toast.info("Contact sales@regulasync.co.uk for Enterprise pricing")}
        >
          Talk to Sales
        </Button>
      </div>
    </div>
  );
}
