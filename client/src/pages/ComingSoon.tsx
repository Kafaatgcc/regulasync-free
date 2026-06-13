import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AnimatedLogo from "@/components/AnimatedLogo";
import { 
  Shield, 
  Zap, 
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,

} from "lucide-react";

// Demo credentials
const DEMO_EMAIL = "demo@regulasync.co.uk";
const DEMO_PASSWORD = "RS@Demo#2026!Uk";

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate a brief loading state
    setTimeout(() => {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        // Set demo mode and dispatch event to notify App.tsx
        localStorage.setItem('demoMode', 'true');
        localStorage.setItem('regulasync_demo_access', 'true');
        // Dispatch custom event to trigger re-render in App.tsx
        window.dispatchEvent(new Event('regulasync-access-changed'));
        // Small delay to ensure state updates, then redirect
        setTimeout(() => {
          window.location.href = '/landing';
        }, 100);
      } else {
        setError("Invalid credentials. Please check your demo access details.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] -top-[50px] sm:-top-[100px] -right-[50px] sm:-right-[100px] rounded-full bg-gradient-to-br from-amber-500/10 to-amber-500/5 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] -bottom-[25px] sm:-bottom-[50px] -left-[25px] sm:-left-[50px] rounded-full bg-gradient-to-br from-amber-500/10 to-amber-500/5 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute w-[150px] sm:w-[200px] h-[150px] sm:h-[200px] top-1/2 left-[5%] sm:left-[10%] rounded-full bg-gradient-to-br from-amber-500/5 to-amber-500/3 animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <AnimatedLogo size="md" animate={true} />
          <span className="text-2xl sm:text-3xl font-bold text-white">
            Regula<span className="text-amber-500">Sync</span>
          </span>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
          <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
          LAUNCHING SOON
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight whitespace-nowrap">
          AI-Powered Governance Automation
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-400 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed px-2">
          Transforming regulatory compliance for UK businesses. 
          Automated policy management, real-time regulatory updates, and intelligent audit trails.
        </p>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-2">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 border border-white/10 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg">
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
            <span className="text-xs sm:text-sm text-slate-300">AI-Powered</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 border border-white/10 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg">
            <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
            <span className="text-xs sm:text-sm text-slate-300">Enterprise Security</span>
          </div>
        </div>

        {/* Demo Access Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 mx-2 sm:mx-0">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-semibold text-white">Access Demo Platform</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6">
            Enter your demo credentials to explore the full RegulaSync platform.
          </p>

          <form onSubmit={handleDemoAccess} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2 text-left">
              <Label htmlFor="email" className="text-xs sm:text-sm text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="demo@regulasync.co.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 text-sm sm:text-base h-10 sm:h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2 text-left">
              <Label htmlFor="password" className="text-xs sm:text-sm text-slate-300">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 text-sm sm:text-base h-10 sm:h-11"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 sm:p-3">
                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#0f172a] font-semibold h-10 sm:h-11 text-sm sm:text-base"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Access Demo
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Contact Section */}
        <div className="text-center mb-6 sm:mb-8 px-2">
          <p className="text-xs sm:text-sm text-slate-400 mb-2 sm:mb-3">
            Interested in learning more about RegulaSync?
          </p>
          <a 
            href="mailto:hello@regulasync.co.uk" 
            className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors text-sm sm:text-base"
          >
            <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            hello@regulasync.co.uk
          </a>
        </div>


      </div>
    </div>
  );
}
