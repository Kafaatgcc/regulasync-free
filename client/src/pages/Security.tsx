import { Link } from "wouter";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Shield, Lock, Server, FileCheck, Eye, Users, Globe, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const assurancePlans = [
  {
    name: "ISO 27001",
    status: "Planned",
    description: "Planned information security management system certification; no certificate is evidenced here.",
    plannedPhase: "Security management system preparation",
    icon: Shield },
  {
    name: "SOC 2 Type II",
    status: "Planned",
    description: "Planned independent attestation report, not a certification; no SOC 2 report is evidenced here.",
    plannedPhase: "Operating effectiveness review",
    icon: FileCheck },
  {
    name: "UK GDPR Obligations",
    status: "Ongoing obligation",
    description: "UK GDPR is a legal obligation, not a certification. Relevant duties apply regardless of planned privacy work.",
    plannedPhase: "Privacy governance review",
    icon: Lock },
  {
    name: "Cyber Essentials Plus",
    status: "Planned",
    description: "Planned Cyber Essentials preparation followed by independent Cyber Essentials Plus assessment; neither certificate is evidenced here.",
    plannedPhase: "Foundation controls and technical verification",
    icon: CheckCircle2 },
];

const securityFeatures = [
  {
    title: "Data Encryption",
    description: "Planned review of encryption in transit and at rest, including hosting and database configuration. Algorithm, key-management and deployment guarantees require verification.",
    icon: Lock },
  {
    title: "Access Control",
    description: "Planned validation of role-based access controls and account security. MFA and SSO are roadmap considerations, not assurances of current availability.",
    icon: Users },
  {
    title: "Audit Logging",
    description: "The prototype illustrates audit-trail workflows. Coverage, retention and tamper resistance require validation before production assurance claims can be made.",
    icon: Eye },
  {
    title: "Infrastructure Security",
    description: "Infrastructure configuration reviews and vulnerability assessments are planned. Hosting alone does not demonstrate independently assessed platform security.",
    icon: Server },
  {
    title: "Data Residency",
    description: "Hosting locations, subprocessors and international transfers need verification before production use. No UK-only or UK/EU-only data residency guarantee is made here.",
    icon: Globe },
  {
    title: "Incident Response",
    description: "Monitoring coverage and incident response procedures are planned review areas. Notification responsibilities must reflect applicable law, processing roles and customer contracts.",
    icon: AlertTriangle },
];

const regulatoryCompliance = [
  {
    regulator: "Financial Conduct Authority (FCA)",
    requirements: [
      "SM&CR compliance tracking",
      "Conduct risk monitoring",
      "Regulatory reporting support",
      "Policy version control",
    ] },
  {
    regulator: "Prudential Regulation Authority (PRA)",
    requirements: [
      "Operational resilience documentation",
      "Risk management frameworks",
      "Board governance records",
      "Capital adequacy tracking",
    ] },
  {
    regulator: "Information Commissioner's Office (ICO)",
    requirements: [
      "Data protection impact assessments",
      "Subject access request management",
      "Consent management",
      "Data retention policies",
    ] },
  {
    regulator: "Bank of England",
    requirements: [
      "Stress testing documentation",
      "Recovery planning records",
      "Regulatory submission tracking",
      "Compliance attestations",
    ] },
];

export default function Security() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#1e3a5f] to-[#2d5a87] text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Security & Compliance
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            RegulaSync is a prototype for regulated governance workflows. This page outlines
            planned security and assurance work, not certified controls or a compliance guarantee.
          </p>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-600">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Encryption Review Planned</span>
            </div>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Residency Review Planned</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Privacy Review Planned</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Monitoring Review Planned</span>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Planned Assurance & Legal Obligations
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Certifications and independent reports are future plans, subject to scope, evidence and assessment.
            No certification or SOC 2 report is evidenced here. Prototype checklist progress is illustrative only,
            not actual certification readiness or proof of legal compliance. No calendar dates are committed.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {assurancePlans.map((cert) => {
              const IconComponent = cert.icon;
              const isPlanned = cert.status === "Planned";
              return (
                <Card key={cert.name} className="border shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <IconComponent className={`w-8 h-8 ${isPlanned ? 'text-amber-500' : 'text-slate-400'}`} />
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        isPlanned ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {cert.status}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{cert.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-2">{cert.description}</p>
                    <p className="text-xs text-slate-500">
                      Planned phase: {cert.plannedPhase}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Planned Security Reviews
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            These are review priorities, not independently verified production controls.
            Demo screens and illustrative data do not establish operational security assurance.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div key={feature.title} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-[#1e3a5f]" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Regulatory Support */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            UK Regulatory Support
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Illustrative governance workflow areas for review against relevant UK regulatory requirements.
            This is not regulator approval, a legal assessment or a guarantee of compliance;
            organisations remain responsible for their obligations.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {regulatoryCompliance.map((reg) => (
              <Card key={reg.regulator} className="border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-[#1e3a5f]">{reg.regulator}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {reg.requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                        <FileCheck className="w-4 h-4 text-primary flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Data Protection Commitment
          </h2>
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="prose prose-slate max-w-none">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Our GDPR Commitment</h3>
              <p className="text-slate-600 mb-6">
                UK GDPR and the Data Protection Act 2018 impose legal obligations; they are not certifications.
                Applicable duties must be met for relevant processing now, not deferred until a roadmap phase.
                Before production processing, roles, contracts and technical and organisational measures
                require review. The prototype does not demonstrate complete legal compliance.
              </p>

              <h4 className="font-semibold text-slate-900 mb-2">Planned Review Areas:</h4>
              <ul className="space-y-2 text-slate-600 mb-6">
                <li className="flex items-start gap-2">
                  <FileCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Confirm processing roles and prepare appropriate data processing agreements</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Review data minimisation, lawful processing and retention requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Validate procedures for data subject rights, including erasure and portability where applicable</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Document breach response and notification responsibilities under applicable law and contracts</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Assess when data protection impact assessments and a data protection officer are required</span>
                </li>
              </ul>

              <h4 className="font-semibold text-slate-900 mb-2">Sub-processor Review:</h4>
              <p className="text-slate-600">
                Planned work includes verifying subprocessors, processing locations, contractual safeguards
                and applicable customer notification requirements. No approved sub-processor register or
                executed customer safeguards are evidenced on this page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Contact */}
      <section className="py-20 px-4 bg-[#1e3a5f]">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Security Questions?</h2>
          <p className="text-xl text-white/80 mb-8">
            Contact us to discuss the prototype, planned security reviews and your evidence requirements.
            Any production assurance claims will need supporting documentation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#request-demo">
              <Button size="lg" className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                Request Security Documentation
              </Button>
            </Link>
            <a href="mailto:security@regulasync.com">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Security Team
              </Button>
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
