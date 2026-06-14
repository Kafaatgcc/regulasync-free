import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, KeyRound, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, ChevronLeft } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const utils = trpc.useUtils();
  const loginMutation = trpc.passwordAuth.loginWithPassword.useMutation({
    onSuccess: async (data) => {
      toast.success(`Welcome back, ${data.user.name || data.user.email}!`);
      await utils.auth.me.invalidate();
      setLocation("/dashboard");
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

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      {/* Top navigation bar with logo and back link */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/">
          <a className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium">
            <ChevronLeft className="h-4 w-4" />
            Back to RegulaSync
          </a>
        </Link>
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="RegulaSync"
            className="h-8 w-8 object-contain"
          />
          <span className="text-white font-bold text-lg tracking-tight">
            Regula<span className="text-amber-500">Sync</span>
          </span>
        </div>
        <div className="w-[120px]" /> {/* spacer for centering */}
      </nav>

      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Centred login card */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
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
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            © 2026 RegulaSync Ltd ·{" "}
            <a href="/privacy-policy" className="hover:text-slate-400 transition-colors">Privacy</a>
            {" · "}
            <a href="/terms" className="hover:text-slate-400 transition-colors">Terms</a>
          </p>
        </div>
      </div>
    </div>
  );
}
