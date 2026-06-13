import { Link } from "wouter";
import { Linkedin, Mail, Award, Building2, GraduationCap, Target, Users, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              About RegulaSync
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Building the future of governance automation for regulated industries, 
              founded on 18 years of real-world compliance and operational excellence experience.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#1e3a5f]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-[#1e3a5f]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Our Mission</h3>
                <p className="text-slate-600">
                  To transform how organisations manage governance by embedding policy logic 
                  directly into daily operations, reducing risk and ensuring consistent compliance.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#b87333]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-[#b87333]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Our Vision</h3>
                <p className="text-slate-600">
                  To become the leading governance automation platform for regulated industries 
                  worldwide, starting with the UK financial services sector.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#708090]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-[#708090]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Our Values</h3>
                <p className="text-slate-600">
                  Transparency, accountability, and innovation guide everything we build. 
                  We believe governance should enable growth, not hinder it.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Meet the Founder</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              RegulaSync was founded by an industry veteran with deep expertise in governance, 
              compliance, and operational excellence across leading global organisations.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-5 gap-0">
              {/* Profile Image Area */}
              <div className="md:col-span-2 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] p-12 flex flex-col items-center justify-center text-white">
                <div className="w-48 h-48 rounded-full overflow-hidden mb-6 border-4 border-white/30">
                  <img 
                    src="/founder-baidaa-housen.jpg" 
                    alt="Baidaa Housen - Founder & CEO of RegulaSync"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2">Baidaa Housen</h3>
                <p className="text-white/80 mb-6">Founder & CEO</p>
                <div className="flex gap-4">
                  <a href="mailto:baidaa@regulasync.com" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Mail className="w-5 h-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/baidaa-housen-84355844" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Bio Content */}
              <div className="md:col-span-3 p-12">
                <div className="prose prose-slate max-w-none">
                  <p className="text-lg text-slate-700 mb-6">
                    With <strong>18 years of experience</strong> in executive support, governance coordination, 
                    compliance, and operational strategy across leading UAE institutions, I bring deep domain 
                    knowledge in transforming complex organisational rules into clear, executable processes.
                  </p>
                  <p className="text-slate-600 mb-8">
                    Throughout my career at <strong>Mubadala Investment Company</strong>, <strong>Mubadala Capital</strong>, 
                    and <strong>Mubadala Energy</strong>, I witnessed first-hand how fragmented governance processes, 
                    siloed compliance functions, and manual policy enforcement contribute to risk exposure, 
                    inefficiency, and audit challenges. This experience directly informed the creation of RegulaSync.
                  </p>
                </div>

                {/* Credentials */}
                <div className="grid sm:grid-cols-2 gap-6 mt-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-[#1e3a5f]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Global MBA</h4>
                      <p className="text-sm text-slate-600">Ascencia Business School, College de Paris</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#b87333]/10 flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-[#b87333]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Certified Chief of Staff</h4>
                      <p className="text-sm text-slate-600">One of only 17 accredited professionals in the GCC</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#708090]/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-[#708090]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Mubadala Group</h4>
                      <p className="text-sm text-slate-600">Investment Company, Capital & Energy divisions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">18+ Years Experience</h4>
                      <p className="text-sm text-slate-600">Governance, compliance & operational strategy</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Areas */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Areas of Expertise</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Governance & Regulatory Alignment",
              "Board Functions Coordination",
              "Legal & Compliance Workflows",
              "Cross-functional Execution",
              "Digital Transformation",
              "Operational Governance at Scale",
              "FCA Regulatory Frameworks",
              "UAE Corporate Governance",
              "Risk Management & Audit"
            ].map((expertise, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="w-2 h-2 rounded-full bg-[#b87333]" />
                <span className="text-slate-700">{expertise}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Creation Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Creating Jobs in the UK</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              RegulaSync is committed to building a world-class team in London and contributing to the UK's thriving tech ecosystem.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-4xl font-bold text-[#1e3a5f] mb-2">6</div>
              <p className="text-slate-600 text-sm">Team size Year 1 (2026)</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-4xl font-bold text-[#1e3a5f] mb-2">8</div>
              <p className="text-slate-600 text-sm">Team size Year 2 (2027)</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-4xl font-bold text-[#1e3a5f] mb-2">13</div>
              <p className="text-slate-600 text-sm">Team size Year 3 (2028)</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-4xl font-bold text-[#b87333] mb-2">London</div>
              <p className="text-slate-600 text-sm">UK Headquarters</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">High-Skilled Job Creation</h3>
                <p className="text-slate-600">
                  Our growth plans will create high-skilled jobs in software engineering, AI/ML, product management, 
                  sales, and customer success. We're building a diverse team of professionals who are passionate 
                  about transforming governance for regulated industries.
                </p>
                <Link href="/careers">
                  <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
                    View Open Positions
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#1e3a5f]">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Join Our Early Access Program</h2>
          <p className="text-xl text-white/80 mb-8">
            Be among the first organisations to experience the future of governance automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#request-demo">
              <Button size="lg" className="bg-[#b87333] hover:bg-[#a06329] text-white">
                Request a Demo
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
