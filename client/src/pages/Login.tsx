import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Mail, KeyRound, ArrowRight, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.passwordAuth.loginWithPassword.useMutation({
    onSuccess: (data) => {
      // Set localStorage flag for backward compat with ProtectedRoute
      localStorage.setItem("regulasync_demo_access", "true");
      toast.success(`Welcome back, ${data.user.name || data.user.email}!`);
      // Redirect based on role
      const role = data.user.role;
      if (role === "super_admin" || role === "company_admin" || role === "admin") {
        setLocation("/dashboard");
      } else {
        setLocation("/dashboard");
      }
      // Force page reload to pick up new session cookie
      setTimeout(() => window.location.reload(), 100);
    },
    onError: (err) => {
      setError(err.message || "Invalid email or password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ email, password });
  };

  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Shield className="h-5 w-5 text-[#0f172a]" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">RegulaSync</span>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Sign in to your account</h1>
            <p className="text-slate-400 text-sm">Enter your credentials to access the platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-slate-300">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.co.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 h-11"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm text-slate-300">Password</Label>
                <Link href="/forgot-password" className="text-xs text-amber-500 hover:text-amber-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 h-11"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#0f172a] font-semibold h-11 mt-2 active:scale-[0.97] transition-all"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Manus OAuth */}
          <a
            href={loginUrl}
            className="flex items-center justify-center gap-2 w-full h-11 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 hover:text-white transition-all font-medium"
          >
            <Shield className="h-4 w-4 text-amber-500" />
            Sign in with Manus
          </a>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <p className="text-xs text-amber-400 font-medium mb-2">Demo Accounts</p>
          <div className="space-y-1 text-xs text-slate-400">
            <div className="flex justify-between"><span>Super Admin:</span><span className="text-slate-300 font-mono">superadmin@regulasync.co.uk</span></div>
            <div className="flex justify-between"><span>Company Admin:</span><span className="text-slate-300 font-mono">admin@acmecorp.co.uk</span></div>
            <div className="flex justify-between"><span>Compliance Mgr:</span><span className="text-slate-300 font-mono">compliance@acmecorp.co.uk</span></div>
            <div className="flex justify-between"><span>Password (all):</span><span className="text-slate-300 font-mono">Demo@2026!</span></div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          © 2026 RegulaSync Ltd · <a href="/privacy-policy" className="hover:text-slate-400 transition-colors">Privacy</a> · <a href="/terms" className="hover:text-slate-400 transition-colors">Terms</a>
        </p>
      </div>
    </div>
  );
}
