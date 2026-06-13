import { Link } from "wouter";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Shield, Lock, Server, FileCheck, Eye, Users, Globe, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const certifications = [
  {
    name: "ISO 27001",
    status: "Planned",
    description: "RegulaSync plans to pursue Information Security Management System certification",
    timeline: "Target: Q3 2026",
    icon: Shield },
  {
    name: "SOC 2 Type II",
    status: "Planned",
    description: "RegulaSync plans to pursue Service Organisation Control audit for security, availability, and confidentiality",
    timeline: "Target: Q4 2026",
    icon: FileCheck },
  {
    name: "GDPR Compliant Design",
    status: "In Development",
    description: "RegulaSync is being designed with GDPR compliance principles built into the architecture",
    timeline: "From Launch",
    icon: Lock },
  {
    name: "Cyber Essentials Plus",
    status: "Planned",
    description: "RegulaSync plans to pursue UK Government-backed cyber security certification",
    timeline: "Target: Q2 2026",
    icon: CheckCircle2 },
];

const securityFeatures = [
  {
    title: "Data Encryption",
    description: "All data encrypted at rest (AES-256) and in transit (TLS 1.3). Database encryption with customer-managed keys available for Enterprise.",
    icon: Lock },
  {
    title: "Access Control",
    description: "Role-based access control (RBAC), multi-factor authentication (MFA), and single sign-on (SSO) integration with major identity providers.",
    icon: Users },
  {
    title: "Audit Logging",
    description: "Comprehensive audit trails with tamper-evident logging. All user actions recorded with timestamps and IP addresses.",
    icon: Eye },
  {
    title: "Infrastructure Security",
    description: "Hosted on enterprise-grade cloud infrastructure. Regular security reviews and vulnerability assessments planned as part of our security roadmap.",
    icon: Server },
  {
    title: "Data Residency",
    description: "UK data residency options available. All customer data stored within UK/EU data centres for regulatory compliance.",
    icon: Globe },
  {
    title: "Incident Response",
    description: "Security monitoring with defined incident response procedures. We are committed to timely breach notification in line with applicable data protection requirements.",
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
            Built from the ground up for regulated industries. RegulaSync implements 
            enterprise-grade security controls to protect your most sensitive governance data.
          </p>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-600">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">UK Data Centres</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Privacy by Design</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">24/7 Monitoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Certifications & Compliance
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            We are committed to achieving and maintaining industry-leading security certifications 
            to meet the requirements of regulated financial services organisations.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert) => {
              const IconComponent = cert.icon;
              const isDesignedFor = cert.status === "Designed For";
              const isRoadmap = cert.status === "Roadmap";
              return (
                <Card key={cert.name} className="border shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <IconComponent className={`w-8 h-8 ${isDesignedFor ? 'text-green-600' : isRoadmap ? 'text-amber-500' : 'text-slate-400'}`} />
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        isDesignedFor ? 'bg-green-100 text-green-700' : 
                        isRoadmap ? 'bg-amber-100 text-amber-700' : 
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
                      {cert.timeline}
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
            Security Architecture
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Our security-first approach ensures your governance data is protected 
            at every layer of the platform.
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
            RegulaSync is designed to help organisations meet the requirements of 
            UK financial services regulators.
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
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
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
                RegulaSync is fully committed to compliance with the UK GDPR and Data Protection Act 2018. 
                We act as a data processor on behalf of our customers and implement appropriate technical 
                and organisational measures to ensure the security of personal data.
              </p>
              
              <h4 className="font-semibold text-slate-900 mb-2">Key Commitments:</h4>
              <ul className="space-y-2 text-slate-600 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Data Processing Agreements (DPAs) available for all customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Data minimisation principles applied throughout the platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Right to erasure and data portability supported</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>72-hour breach notification commitment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Regular privacy impact assessments conducted</span>
                </li>
              </ul>

              <h4 className="font-semibold text-slate-900 mb-2">Sub-processors:</h4>
              <p className="text-slate-600">
                We maintain a list of approved sub-processors and notify customers of any changes. 
                All sub-processors are contractually bound to equivalent data protection standards.
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
            Our security team is available to answer questions about our security practices, 
            provide documentation, or discuss your specific compliance requirements.
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
