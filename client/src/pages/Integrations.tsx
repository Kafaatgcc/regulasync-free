import { Link } from "wouter";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { ArrowRight, Check, Building2, Database, FileText, Shield, Zap, Globe, Lock, Server, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const currentIntegrations = [
  {
    name: "REST API",
    category: "Core Platform",
    description: "Proposed external API connectivity; supported endpoints and production access will be confirmed",
    status: "Prototype / planned",
    icon: Server },
  {
    name: "Webhook Events",
    category: "Core Platform",
    description: "Proposed event notifications; production webhook delivery is not yet confirmed",
    status: "Prototype / planned",
    icon: Zap },
  {
    name: "CSV/Excel Import",
    category: "Data Import",
    description: "Prototype spreadsheet workflows; supported formats and data types depend on the demonstrated module",
    status: "Prototype / planned",
    icon: FileText },
  {
    name: "PDF Export",
    category: "Reporting",
    description: "Prototype reporting/export workflows; available outputs depend on the demonstrated module",
    status: "Prototype / planned",
    icon: FileText },
];

const plannedIntegrations = [
  {
    name: "Microsoft 365",
    category: "Productivity",
    description: "Sync policies with SharePoint, integrate with Teams for approvals, and connect to Azure AD for SSO",
    timeline: "Planned — timing to be confirmed",
    icon: Cloud },
  {
    name: "Google Workspace",
    category: "Productivity",
    description: "Google Drive policy storage, Gmail notifications, and Google SSO authentication",
    timeline: "Planned — timing to be confirmed",
    icon: Cloud },
  {
    name: "Salesforce",
    category: "CRM",
    description: "Sync compliance data with customer records, automate governance workflows in sales processes",
    timeline: "Planned — timing to be confirmed",
    icon: Database },
  {
    name: "SAP",
    category: "ERP",
    description: "Connect to SAP for procurement approvals, financial controls, and HR governance workflows",
    timeline: "Planned — timing to be confirmed",
    icon: Building2 },
  {
    name: "Oracle",
    category: "ERP",
    description: "Integration with Oracle Financials for approval thresholds and delegation of authority",
    timeline: "Planned — timing to be confirmed",
    icon: Database },
  {
    name: "Workday",
    category: "HRIS",
    description: "Sync employee data, automate HR policy compliance, and manage role-based access",
    timeline: "Planned — timing to be confirmed",
    icon: Building2 },
];

const ukRegulatoryIntegrations = [
  {
    name: "FCA Reporting (Planned)",
    description: "Proposed reporting support, subject to regulator requirements and technical validation; no live regulatory submissions",
    regulator: "FCA",
    timeline: "Planned — timing to be confirmed" },
  {
    name: "PRA Reporting",
    description: "Prudential reporting integration for banks and insurers",
    regulator: "PRA",
    timeline: "Planned — timing to be confirmed" },
  {
    name: "Companies House API",
    description: "Automated company information verification and filing status checks",
    regulator: "Companies House",
    timeline: "Planned — timing to be confirmed" },
  {
    name: "ICO Registration",
    description: "Data protection registration verification and compliance tracking",
    regulator: "ICO",
    timeline: "Planned — timing to be confirmed" },
  {
    name: "HMRC MTD",
    description: "Making Tax Digital integration for financial compliance workflows",
    regulator: "HMRC",
    timeline: "Planned — timing to be confirmed" },
];

const securityFeatures = [
  { text: "Security-first integration design", icon: Shield },
  { text: "Encrypted transport — integration design target", icon: Lock },
  { text: "OAuth / SAML support — planned, subject to validation", icon: Lock },
  { text: "Integration audit logging — design target", icon: FileText },
  { text: "Data hosting/residency to be confirmed for each deployment", icon: Globe },
];

export default function Integrations() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Integration Ecosystem
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Connect RegulaSync to Your Existing Systems
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Explore proposed connectivity for enterprise tools and UK regulatory workflows. RegulaSync is pre-launch; these roadmap items are not claims of live third-party connections.
          </p>
        </div>
      </section>

      {/* Current Integrations */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Prototype Tooling and Planned Connectivity</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentIntegrations.map((integration, index) => {
              const IconComponent = integration.icon;
              return (
                <Card key={index} className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <span className="text-xs text-green-600 font-medium">{integration.status}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{integration.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* UK Regulatory Integrations */}
      <section className="py-16 px-4 bg-[#1e3a5f]/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">UK Regulatory Integrations</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Proposed regulatory connectivity only. No live direct reporting, regulator endorsement or verified connection is implied.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ukRegulatoryIntegrations.map((integration, index) => (
              <Card key={index} className="border shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1e3a5f] bg-[#1e3a5f]/10 px-2 py-1 rounded">
                      {integration.regulator}
                    </span>
                    <span className="text-xs text-amber-600 font-medium">
                      {integration.timeline}
                    </span>
                  </div>
                  <CardTitle className="text-lg mt-3">{integration.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{integration.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Integrations */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Enterprise System Integrations</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Connect RegulaSync with your existing enterprise applications for unified governance
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plannedIntegrations.map((integration, index) => {
              const IconComponent = integration.icon;
              return (
                <Card key={index} className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          <span className="text-xs text-slate-500">{integration.category}</span>
                        </div>
                      </div>
                      <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                        {integration.timeline}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{integration.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Integration Security Design Targets</h2>
            <p className="text-slate-600">
              Planned controls require implementation and verification before production use
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-4 border">
                  <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-[#1e3a5f]" />
                  </div>
                  <span className="text-sm text-slate-700">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partner Program */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Integration Partner Program</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Are you a technology vendor or systems integrator? Partner with RegulaSync to
              deliver governance automation solutions to your clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                  Become a Partner
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/api-docs">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Explore Prototype API Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Integration CTA */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Need a Custom Integration?</h2>
          <p className="text-slate-600 mb-8">
            Discuss Enterprise integration requirements with us. Scope, feasibility, delivery timing and any additional fees will be agreed separately.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-[#b87333] hover:bg-[#a06329]">
              Discuss Your Requirements
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
