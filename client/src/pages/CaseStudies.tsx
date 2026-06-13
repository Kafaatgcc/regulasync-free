import { Link } from "wouter";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { ArrowRight, Building2, Shield, Clock, TrendingUp, Users, FileText, AlertTriangle, CheckCircle, Briefcase, Heart, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const caseStudies = [
  {
    id: "asset-manager",
    title: "Mid-Size Asset Manager",
    subtitle: "FCA-Regulated Investment Firm",
    industry: "Financial Services",
    icon: Building2,
    challenge: "A typical UK-based asset manager with £500M AUM faces challenges with manual compliance processes across investment approval workflows. Delegation of authority matrices maintained in spreadsheets lead to approval delays and audit concerns.",
    challenges: [
      "Manual tracking of 200+ approval thresholds across 15 investment strategies",
      "Inconsistent application of FCA COBS requirements",
      "3-week average audit preparation time",
      "Multiple instances of approvals exceeding delegated limits",
    ],
    solution: "RegulaSync can automate the firm's entire delegation of authority framework, creating real-time validation rules that check every investment decision against the appropriate approval thresholds and regulatory requirements.",
    results: [
      { metric: "Up to 85%", label: "Projected reduction in approval time" },
      { metric: "100%", label: "Target compliance with DoA thresholds" },
      { metric: "~3 days", label: "Target audit preparation time" },
      { metric: "Zero", label: "Target regulatory breaches" },
    ],
    quote: "RegulaSync will be able to transform governance from a reactive burden into a proactive advantage, giving boards real-time visibility into compliance status.",
    quoteAuthor: "Projected Outcome",
    color: "blue" },
  {
    id: "insurance-broker",
    title: "Regional Insurance Broker",
    subtitle: "Lloyd's of London Coverholder",
    industry: "Insurance",
    icon: Shield,
    challenge: "Lloyd's coverholders managing £50M+ in premiums face challenges maintaining consistent underwriting governance across regional offices. Binding authority agreements require strict adherence to coverage limits and approval hierarchies.",
    challenges: [
      "Inconsistent application of binding authority limits across multiple offices",
      "Manual tracking of aggregate exposure limits",
      "Difficulty demonstrating governance to Lloyd's during audits",
      "Risk of exceeding authority without proper escalation",
    ],
    solution: "RegulaSync can implement automated rule enforcement for binding authority limits, creating a unified governance layer that validates every policy against the firm's authority matrix and aggregate limits in real-time.",
    results: [
      { metric: "100%", label: "Target binding authority compliance" },
      { metric: "Up to 60%", label: "Projected faster policy processing" },
      { metric: "Real-time", label: "Aggregate exposure monitoring" },
      { metric: "Improved", label: "Lloyd's audit readiness" },
    ],
    quote: "RegulaSync will provide real-time visibility into binding authority usage, enabling firms to confidently demonstrate governance to Lloyd's at any moment.",
    quoteAuthor: "Projected Outcome",
    color: "purple" },
  {
    id: "healthcare-trust",
    title: "NHS Foundation Trust",
    subtitle: "Acute Care Hospital Group",
    industry: "Healthcare",
    icon: Heart,
    challenge: "Large NHS Trusts with 5,000+ staff often struggle to maintain consistent governance across clinical and administrative decision-making. Procurement approvals, clinical protocols, and HR policies operate in silos with inconsistent enforcement.",
    challenges: [
      "Fragmented approval processes across multiple departments",
      "Difficulty tracking compliance with NHS Standing Financial Instructions",
      "Manual audit trails for CQC inspections",
      "Inconsistent application of clinical governance protocols",
    ],
    solution: "RegulaSync can unify a Trust's governance framework, creating automated workflows for procurement approvals, clinical protocol compliance, and HR policy enforcement with complete audit trails for regulatory inspections.",
    results: [
      { metric: "Up to 70%", label: "Projected reduction in approval time" },
      { metric: "Complete", label: "Audit trail for CQC compliance" },
      { metric: "Up to 40%", label: "Projected admin reduction" },
      { metric: "Unified", label: "Cross-departmental enforcement" },
    ],
    quote: "RegulaSync will provide the unified view of governance needed for NHS Trusts, making CQC preparation straightforward with automatic documentation.",
    quoteAuthor: "Projected Outcome",
    color: "green" },
  {
    id: "property-developer",
    title: "Commercial Property Developer",
    subtitle: "UK Real Estate Investment",
    industry: "Property Development",
    icon: Briefcase,
    challenge: "Property development companies managing £200M+ portfolios face governance challenges across investment approval processes. Multiple stakeholders need to approve acquisitions, but manual processes create delays and inconsistent documentation.",
    challenges: [
      "Complex multi-stage approval process for property acquisitions",
      "Inconsistent documentation across investment committee decisions",
      "Difficulty tracking delegated authority for regional managers",
      "Manual compliance with investor reporting requirements",
    ],
    solution: "RegulaSync can automate the investment approval workflow, creating structured decision gates with automatic escalation based on deal size, risk profile, and strategic fit criteria.",
    results: [
      { metric: "Up to 50%", label: "Projected faster decisions" },
      { metric: "100%", label: "Target documentation compliance" },
      { metric: "Real-time", label: "Investment committee visibility" },
      { metric: "Automated", label: "Investor reporting generation" },
    ],
    quote: "RegulaSync will give investment committees complete confidence that every deal follows the governance framework, with automated documentation for investor relations.",
    quoteAuthor: "Projected Outcome",
    color: "amber" },
];

const industryStats = [
  { industry: "Financial Services", stat: "£2.1B", description: "Annual UK compliance costs" },
  { industry: "Healthcare", stat: "40%", description: "Time spent on governance admin" },
  { industry: "Insurance", stat: "£500M", description: "Lloyd's governance penalties (5yr)" },
];

export default function CaseStudies() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b87333]/10 text-[#b87333] text-sm font-medium mb-6">
            <FileText className="w-4 h-4" />
            Use Cases & Scenarios
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            How RegulaSync Can Transform Governance
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Explore how organisations across regulated industries can use RegulaSync 
            to transform their governance, compliance, and audit readiness.
          </p>
          <p className="text-sm text-slate-500 mt-4 bg-amber-50 px-4 py-2 rounded-lg inline-block">
            These scenarios represent projected use cases based on market research and industry analysis.
          </p>
        </div>
      </section>

      {/* Industry Stats */}
      <section className="py-12 px-4 bg-[#1e3a5f]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            {industryStats.map((item, index) => (
              <div key={index}>
                <div className="text-3xl font-bold mb-2">{item.stat}</div>
                <div className="text-sm text-white/60 mb-1">{item.industry}</div>
                <div className="text-sm text-white/80">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-16">
            {caseStudies.map((study, index) => {
              const IconComponent = study.icon;
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600",
                purple: "bg-purple-100 text-purple-600",
                green: "bg-green-100 text-green-600",
                amber: "bg-amber-100 text-amber-600" };
              const borderClasses = {
                blue: "border-blue-200",
                purple: "border-purple-200",
                green: "border-green-200",
                amber: "border-amber-200" };
              
              return (
                <div key={study.id} className={`bg-white rounded-2xl shadow-lg border ${borderClasses[study.color as keyof typeof borderClasses]} overflow-hidden`}>
                  {/* Header */}
                  <div className="p-8 border-b bg-slate-50">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className={`w-16 h-16 rounded-xl ${colorClasses[study.color as keyof typeof colorClasses]} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-medium text-slate-500 mb-1">{study.industry}</div>
                        <h2 className="text-2xl font-bold text-slate-900">{study.title}</h2>
                        <p className="text-slate-600">{study.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Challenge */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                          The Challenge
                        </h3>
                        <p className="text-slate-600 mb-4">{study.challenge}</p>
                        <ul className="space-y-2">
                          {study.challenges.map((challenge, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Solution */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          The Solution
                        </h3>
                        <p className="text-slate-600">{study.solution}</p>
                      </div>
                    </div>

                    {/* Results */}
                    <div className="mt-8 pt-8 border-t">
                      <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#1e3a5f]" />
                        Projected Results
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {study.results.map((result, i) => (
                          <div key={i} className="text-center p-4 bg-slate-50 rounded-lg">
                            <div className="text-2xl font-bold text-[#1e3a5f]">{result.metric}</div>
                            <div className="text-xs text-slate-600 mt-1">{result.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quote */}
                    <div className="mt-8 p-6 bg-[#1e3a5f]/5 rounded-xl border border-[#1e3a5f]/10">
                      <p className="text-slate-700 italic mb-3">"{study.quote}"</p>
                      <p className="text-sm text-slate-500">— {study.quoteAuthor}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Target Industries */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
            Industries We Serve
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Financial Services", icon: Building2 },
              { name: "Insurance", icon: Shield },
              { name: "Healthcare", icon: Heart },
              { name: "Property Development", icon: Briefcase },
              { name: "Education", icon: GraduationCap },
              { name: "Professional Services", icon: Users },
              { name: "Public Sector", icon: Building2 },
              { name: "Manufacturing", icon: Building2 },
            ].map((industry, index) => {
              const IconComponent = industry.icon;
              return (
                <div key={index} className="bg-white rounded-lg p-6 text-center border shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center mx-auto mb-3">
                    <IconComponent className="w-6 h-6 text-[#1e3a5f]" />
                  </div>
                  <div className="text-sm font-medium text-slate-700">{industry.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#1e3a5f]">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-6">See How RegulaSync Can Help Your Organisation</h2>
          <p className="text-xl text-white/80 mb-8">
            Schedule a personalised demo to explore how governance automation 
            can transform your compliance and audit readiness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#request-demo">
              <Button size="lg" className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                Request a Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
