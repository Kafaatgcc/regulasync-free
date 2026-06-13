import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Briefcase, Users, MapPin, Clock, TrendingUp, Heart, Zap, Globe, GraduationCap, Coffee, Laptop } from "lucide-react";

export default function Careers() {
  const openPositions = [
    {
      title: "Senior Full-Stack Engineer",
      department: "Engineering",
      location: "London, UK (Hybrid)",
      type: "Full-time",
      description: "Build and scale our AI-powered governance platform using React, Node.js, and Python.",
      requirements: ["5+ years experience", "React/TypeScript", "Node.js/Python", "Cloud infrastructure"],
      priority: "Hiring Now"
    },
    {
      title: "AI/ML Engineer",
      department: "Engineering",
      location: "London, UK (Hybrid)",
      type: "Full-time",
      description: "Develop machine learning models for regulatory analysis and compliance recommendations.",
      requirements: ["3+ years ML experience", "NLP expertise", "Python/PyTorch", "Production ML systems"],
      priority: "Hiring Now"
    },
    {
      title: "Product Manager - Compliance",
      department: "Product",
      location: "London, UK",
      type: "Full-time",
      description: "Drive product strategy for our compliance monitoring and regulatory intelligence features.",
      requirements: ["5+ years product experience", "RegTech/FinTech background", "FCA knowledge", "B2B SaaS"],
      priority: "Q2 2026"
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "London, UK",
      type: "Full-time",
      description: "Ensure our enterprise customers achieve their governance automation goals.",
      requirements: ["3+ years CSM experience", "Financial services background", "Technical aptitude", "Relationship building"],
      priority: "Q2 2026"
    },
    {
      title: "Sales Development Representative",
      department: "Sales",
      location: "London, UK",
      type: "Full-time",
      description: "Generate and qualify leads from financial services and regulated industries.",
      requirements: ["1-2 years SDR experience", "B2B SaaS sales", "Financial services interest", "CRM proficiency"],
      priority: "Q2 2026"
    },
    {
      title: "Compliance Specialist",
      department: "Product",
      location: "London, UK",
      type: "Full-time",
      description: "Provide regulatory expertise to shape our product and support enterprise customers.",
      requirements: ["5+ years compliance experience", "FCA/PRA knowledge", "Policy writing", "Risk management"],
      priority: "Q2 2026"
    }
  ];

  const benefits = [
    { icon: Laptop, title: "Flexible Working", description: "Hybrid model with 2-3 days in our London office" },
    { icon: Heart, title: "Health & Wellness", description: "Private health insurance and mental health support" },
    { icon: GraduationCap, title: "Learning Budget", description: "£2,000 annual budget for courses and conferences" },
    { icon: Coffee, title: "Team Events", description: "Regular team lunches, offsites, and social events" },
    { icon: TrendingUp, title: "Equity Options", description: "Share in our success with employee stock options" },
    { icon: Globe, title: "25 Days Holiday", description: "Plus bank holidays and your birthday off" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#1e3a5f] to-[#2d5a87] text-white">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-sm">We're Growing - Join Our Team</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Build the Future of<br />Governance Automation
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Join a mission-driven team transforming how organizations manage compliance, 
            risk, and governance. We're building technology that makes a real difference.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400" />
              <span>London, UK</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-400" />
              <span>Growing Team</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              <span>Series A Stage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Plans */}
      <section className="py-16 px-6 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Growth Journey</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're on an ambitious path to transform governance automation in the UK and beyond.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border">
              <div className="text-4xl font-bold text-primary mb-2">6</div>
              <div className="font-medium mb-1">Team Size in Year 1</div>
              <p className="text-sm text-muted-foreground">
                CTO, Software Developer, AI/ML Developer, UI/UX Designer, Compliance Officer, Sales & Marketing
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border">
              <div className="text-4xl font-bold text-primary mb-2">8</div>
              <div className="font-medium mb-1">Team Size by Year 2</div>
              <p className="text-sm text-muted-foreground">
                Adding Accountant and expanding Sales & Marketing team
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border">
              <div className="text-4xl font-bold text-primary mb-2">13</div>
              <div className="font-medium mb-1">Team Size by Year 3</div>
              <p className="text-sm text-muted-foreground">
                Scaling engineering, design, and sales teams for growth
              </p>
            </div>
          </div>

          <div className="mt-8 bg-amber-50 dark:bg-amber-950/30 p-6 rounded-xl border border-amber-200 dark:border-amber-900">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  Creating Jobs in the UK Tech Sector
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  RegulaSync is committed to building a world-class team in London. Our growth plans 
                  will create high-skilled jobs in software engineering, AI/ML, product management, 
                  and customer success. We're proud to contribute to the UK's thriving RegTech ecosystem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
            <p className="text-muted-foreground">
              Join us in building the future of governance automation
            </p>
          </div>

          <div className="space-y-4">
            {openPositions.map((job, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        job.priority === "Hiring Now" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      }`}>
                        {job.priority}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-3">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.type}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.requirements.map((req, i) => (
                        <span key={i} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button className="w-full md:w-auto">
                      Apply Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Don't see a role that fits? We're always looking for talented people.
            </p>
            <Button variant="outline">
              Send Speculative Application
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Join RegulaSync?</h2>
            <p className="text-muted-foreground">
              We offer competitive benefits and a supportive work environment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-xl border">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Culture</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  At RegulaSync, we believe in building products that genuinely help organizations 
                  navigate complex regulatory environments. We're a team of problem-solvers who 
                  care deeply about our customers' success.
                </p>
                <p>
                  We value transparency, continuous learning, and work-life balance. Our hybrid 
                  working model gives you flexibility while maintaining the collaboration and 
                  connection that comes from working together in person.
                </p>
                <p>
                  We're building a diverse and inclusive team where everyone can do their best work. 
                  We welcome applications from candidates of all backgrounds and experiences.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] p-8 rounded-2xl text-white">
              <h3 className="text-xl font-semibold mb-6">Our Values</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <div>
                    <div className="font-medium">Customer Obsession</div>
                    <div className="text-sm text-white/70">We succeed when our customers succeed</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <div>
                    <div className="font-medium">Build with Integrity</div>
                    <div className="text-sm text-white/70">We do the right thing, even when it's hard</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <div>
                    <div className="font-medium">Move Fast, Stay Focused</div>
                    <div className="text-sm text-white/70">We ship quickly but never compromise on quality</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">4</span>
                  </div>
                  <div>
                    <div className="font-medium">Learn & Grow Together</div>
                    <div className="text-sm text-white/70">We invest in each other's development</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-[#1e3a5f] text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
          <p className="text-white/80 mb-8">
            Join us in transforming how organizations manage governance and compliance. 
            We're looking for passionate people who want to build something meaningful.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-[#1e3a5f] hover:bg-white/90">
              View Open Positions
            </Button>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Learn About Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
