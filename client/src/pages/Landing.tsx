import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AnimatedLogo, { AnimatedLogoSplash } from "@/components/AnimatedLogo";
import RegulatoryFeed from "@/components/RegulatoryFeed";
import { toast } from "sonner";
import { Link } from "wouter";
import PublicFooter from "@/components/PublicFooter";
import { 
  Shield, 
  GitBranch, 
  BarChart3, 
  Brain, 
  FileCheck, 
  Clock,
  CheckCircle2,
  ArrowRight,
  Building2,
  Lock,
  Zap,
  Send,
  Mail,
  User,
  Building,
  Phone,
  Linkedin,
  Twitter,
  Moon,
  Sun,
  Menu,
  X,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Landing() {

  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasGateAccess = typeof window !== "undefined" && localStorage.getItem("regulasync_demo_access") === "true";
  const [showSplash, setShowSplash] = useState(!hasGateAccess);
  const [contentVisible, setContentVisible] = useState(hasGateAccess);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOpeningDemo, setIsOpeningDemo] = useState(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setTimeout(() => setContentVisible(true), 100);
  };

  const openPreparedDemo = () => {
    if (!hasGateAccess) {
      window.location.assign("/");
      return;
    }
    setIsOpeningDemo(true);
    window.location.assign("/dashboard");
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const submitDemoRequest = trpc.demoRequests.submit.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your interest! Our team will contact you within 24 hours.");
      setFormData({ name: "", email: "", company: "", phone: "", message: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitDemoRequest.mutateAsync({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phone: formData.phone || undefined,
        message: formData.message || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <>
      {/* Animated Splash Screen */}
      {showSplash && <AnimatedLogoSplash onComplete={handleSplashComplete} />}
      
      <div className={`min-h-screen bg-background transition-opacity duration-500 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto h-16 flex items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <AnimatedLogo size="sm" animate={true} className="shrink-0" />
            <span className="truncate text-lg font-bold text-navy sm:text-xl">RegulaSync</span>
          </div>
          <div className="hidden xl:flex items-center gap-1">
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => scrollToSection('features')}
            >
              Features
            </Button>
            <Button 
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => scrollToSection('how-it-works')}
            >
              How It Works
            </Button>
            <Button 
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => scrollToSection('request-demo')}
            >
              Request Demo
            </Button>
            <Link href="/pricing">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Pricing
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                About
              </Button>
            </Link>
            <Link href="/integrations">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Integrations
              </Button>
            </Link>
          </div>
          <div className="hidden xl:flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openPreparedDemo}
              disabled={isOpeningDemo}
              className="border-copper text-navy hover:bg-copper/10"
            >
              {isOpeningDemo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4 text-copper" />}
              Head of Compliance Demo
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleTheme?.()}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Toggle colour theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link href="/login">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Log In
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-1 xl:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={openPreparedDemo}
              disabled={isOpeningDemo}
              className="border-copper px-2 text-xs text-navy sm:px-3"
            >
              {isOpeningDemo ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              <span className="ml-1.5 sm:hidden">Demo</span>
              <span className="ml-1.5 hidden sm:inline">Head of Compliance</span>
            </Button>
            <button
              type="button"
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Toggle site navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t bg-background px-4 py-3 shadow-lg xl:hidden">
            <div className="mx-auto grid max-w-xl gap-1">
              <Button variant="ghost" className="justify-start" onClick={() => scrollToSection('features')}>Features</Button>
              <Button variant="ghost" className="justify-start" onClick={() => scrollToSection('how-it-works')}>How It Works</Button>
              <Button variant="ghost" className="justify-start" onClick={() => scrollToSection('request-demo')}>Request Demo</Button>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}><Button variant="ghost" className="w-full justify-start">Pricing</Button></Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}><Button variant="ghost" className="w-full justify-start">About</Button></Link>
              <Link href="/integrations" onClick={() => setMobileMenuOpen(false)}><Button variant="ghost" className="w-full justify-start">Integrations</Button></Link>
              <div className="mt-2 flex gap-2 border-t pt-3">
                <Button variant="outline" className="flex-1" onClick={() => toggleTheme?.()}>
                  {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  Theme
                </Button>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1"><Button className="w-full">Log In</Button></Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                <Zap className="h-4 w-4" />
                AI-Powered Governance Automation
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                Transform Your{" "}
                <span className="text-copper">Governance</span>{" "}
                Operations
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                RegulaSync automates policy enforcement, delegation of authority, 
                and compliance monitoring with AI-driven intelligence. Reduce risk, 
                ensure compliance, and streamline decision-making across your organization.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  size="lg"
                  onClick={openPreparedDemo}
                  disabled={isOpeningDemo}
                  className="bg-primary px-6 text-base hover:bg-primary/90 sm:px-8 sm:text-lg"
                >
                  {isOpeningDemo ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                  Open Head of Compliance Demo
                  {!isOpeningDemo && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => scrollToSection('request-demo')}
                  className="px-6 text-base sm:px-8 sm:text-lg"
                >
                  Request Demo
                </Button>
                <Link href="/login" className="sm:hidden">
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                  >
                    Account login
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3 sm:pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">AI-Powered Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Real-time Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Automated Compliance</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>
              <div className="relative rounded-2xl border bg-card p-4 shadow-2xl sm:p-6 lg:p-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Compliance Dashboard</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Live</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="rounded-xl bg-secondary/50 p-2 text-center sm:p-4">
                      <div className="text-xl font-bold text-primary sm:text-3xl">94%</div>
                      <div className="text-xs text-muted-foreground mt-1">Compliance Score</div>
                    </div>
                    <div className="rounded-xl bg-secondary/50 p-2 text-center sm:p-4">
                      <div className="text-xl font-bold text-copper sm:text-3xl">127</div>
                      <div className="text-xs text-muted-foreground mt-1">Active Policies</div>
                    </div>
                    <div className="rounded-xl bg-secondary/50 p-2 text-center sm:p-4">
                      <div className="text-xl font-bold text-green-600 sm:text-3xl">12</div>
                      <div className="text-xs text-muted-foreground mt-1">Pending Reviews</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm">AML Policy Review</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Approved</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                        <span className="text-sm">Data Retention Update</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Pending</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Q4 Risk Assessment</span>
                      </div>
                      <span className="text-xs text-muted-foreground">In Progress</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold">85%</div>
              <div className="text-sm opacity-80 mt-2">Reduction in Compliance Time</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold">99.9%</div>
              <div className="text-sm opacity-80 mt-2">Audit Trail Accuracy</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold">60%</div>
              <div className="text-sm opacity-80 mt-2">Faster Policy Approvals</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold">24/7</div>
              <div className="text-sm opacity-80 mt-2">Automated Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comprehensive Governance Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage governance, risk, and compliance in one unified platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Shield}
              title="Policy Management"
              description="Create, track, and automate policies with intelligent workflow management and version control."
            />
            <FeatureCard 
              icon={GitBranch}
              title="Delegation of Authority"
              description="Visual approval chains and authority matrices that ensure proper governance at every level."
            />
            <FeatureCard 
              icon={BarChart3}
              title="Compliance Monitoring"
              description="Real-time compliance tracking across departments with automated alerts and risk indicators."
            />
            <FeatureCard 
              icon={Brain}
              title="AI Recommendations"
              description="Intelligent suggestions for policy updates, risk mitigation, and compliance improvements."
            />
            <FeatureCard 
              icon={FileCheck}
              title="Self-Validating Audit Cache"
              description="Immutable audit trail with blockchain-inspired hash verification for complete transparency."
            />
            <FeatureCard 
              icon={Clock}
              title="Regulatory Updates"
              description="Stay ahead with real-time regulatory monitoring and impact analysis for your policies."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How RegulaSync Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform transforms governance operations in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard 
              number="01"
              title="Connect & Configure"
              description="Import your existing policies and configure your organizational structure and authority matrix."
            />
            <StepCard 
              number="02"
              title="Automate & Monitor"
              description="Set up automated workflows, approval chains, and compliance monitoring rules."
            />
            <StepCard 
              number="03"
              title="Analyze & Optimize"
              description="Receive AI-powered insights and recommendations to continuously improve governance."
            />
          </div>
        </div>
      </section>

      {/* Target Industries */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Regulated Industries
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trusted by organizations in the most demanding regulatory environments
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <IndustryCard icon={Building2} title="Financial Services" />
            <IndustryCard icon={Shield} title="Insurance" />
            <IndustryCard icon={Lock} title="Healthcare" />
            <IndustryCard icon={FileCheck} title="Legal & Professional" />
          </div>
        </div>
      </section>

      {/* Early Access Partners Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b87333]/10 text-[#b87333] text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              Early Access Program
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Our Pilot Program
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're partnering with forward-thinking organisations to shape the future of governance automation. 
              Be among the first to experience RegulaSync.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-lg border text-center">
              <div className="w-16 h-16 bg-[#1e3a5f]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-[#1e3a5f]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Financial Services</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Seeking pilot partners in banking, asset management, and insurance sectors
              </p>
              <div className="inline-flex items-center gap-2 text-sm text-[#b87333] font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                2 Spots Available
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg border text-center">
              <div className="w-16 h-16 bg-[#1e3a5f]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileCheck className="w-8 h-8 text-[#1e3a5f]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Professional Services</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Law firms, accountancies, and consultancies with complex governance needs
              </p>
              <div className="inline-flex items-center gap-2 text-sm text-[#b87333] font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                3 Spots Available
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg border text-center">
              <div className="w-16 h-16 bg-[#1e3a5f]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-[#1e3a5f]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Regulated Enterprises</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Healthcare, energy, and property development organisations
              </p>
              <div className="inline-flex items-center gap-2 text-sm text-[#b87333] font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                4 Spots Available
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] rounded-2xl p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Early Access Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>50% discount on first year subscription</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Direct input into product roadmap</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Priority support and dedicated onboarding</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Featured as founding partner (optional)</span>
                  </li>
                </ul>
              </div>
              <div className="text-center md:text-right">
                <p className="text-white/80 mb-4">
                  Limited to 10 pilot partners for Q2 2026 launch
                </p>
                <Button 
                  size="lg" 
                  className="bg-[#b87333] hover:bg-[#a06329] text-white"
                  onClick={() => document.getElementById('request-demo')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Apply for Early Access
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live UK Regulatory Feed */}
      <RegulatoryFeed />

      {/* Request Demo Form Section */}
      <section id="request-demo" className="py-24 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Request a Personalized Demo
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                See how RegulaSync can transform your organization's governance operations. 
                Our team will provide a tailored demonstration based on your specific industry 
                and compliance requirements.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Personalized Walkthrough</h4>
                    <p className="text-sm text-muted-foreground">Tailored to your industry and compliance needs</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">ROI Assessment</h4>
                    <p className="text-sm text-muted-foreground">Understand the potential savings and efficiency gains</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Implementation Roadmap</h4>
                    <p className="text-sm text-muted-foreground">Clear path to deployment and integration</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card border rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Full Name *
                    </label>
                    <Input 
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Work Email *
                    </label>
                    <Input 
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      Company *
                    </label>
                    <Input 
                      placeholder="Company Ltd"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Phone Number
                    </label>
                    <Input 
                      type="tel"
                      placeholder="+44 20 1234 5678"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tell us about your compliance challenges</label>
                  <Textarea 
                    placeholder="What governance or compliance challenges are you looking to solve?"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      Request Demo
                      <Send className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By submitting this form, you agree to our privacy policy. 
                  We'll respond within 24 hours.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Governance?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join forward-thinking organizations that are automating compliance 
            and reducing governance risk with RegulaSync.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="px-6 text-base sm:px-8 sm:text-lg"
            onClick={openPreparedDemo}
            disabled={isOpeningDemo}
          >
            {isOpeningDemo ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
            Start Head of Compliance Demo
          </Button>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
    </>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-6">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function IndustryCard({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="p-6 rounded-xl border bg-card text-center hover:border-primary/50 transition-colors">
      <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
      <h3 className="font-medium">{title}</h3>
    </div>
  );
}
