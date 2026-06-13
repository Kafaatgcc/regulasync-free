import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, User, KeyRound, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AcceptInvite() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") || "";

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const inviteInfo = trpc.passwordAuth.getInviteInfo.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const acceptMutation = trpc.passwordAuth.acceptInvite.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("regulasync_demo_access", "true");
      toast.success(`Welcome to RegulaSync, ${data.user.name}!`);
      setTimeout(() => { window.location.href = "/dashboard"; }, 500);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    acceptMutation.mutate({ token, name, password });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Invalid Invite Link</h1>
          <p className="text-slate-400 mb-4">This invite link is missing or invalid.</p>
          <Button onClick={() => setLocation("/login")} className="bg-amber-500 hover:bg-amber-600 text-[#0f172a]">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (inviteInfo.isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (inviteInfo.error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Invite Link Invalid</h1>
          <p className="text-slate-400 mb-4">{inviteInfo.error.message}</p>
          <Button onClick={() => setLocation("/login")} className="bg-amber-500 hover:bg-amber-600 text-[#0f172a]">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const info = inviteInfo.data;

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Shield className="h-5 w-5 text-[#0f172a]" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">RegulaSync</span>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span className="text-sm text-green-400 font-medium">You've been invited!</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Set up your account</h1>
            <p className="text-slate-400 text-sm">
              You've been invited as <span className="text-amber-400 font-medium capitalize">{info?.role?.replace(/_/g, " ")}</span>
              {info?.department && <> in <span className="text-amber-400 font-medium">{info.department}</span></>}
            </p>
            <p className="text-slate-500 text-xs mt-1">{info?.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm text-slate-300">Your full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm text-slate-300">Create password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 h-11"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm text-slate-300">Confirm password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 h-11"
                  required
                />
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
              disabled={acceptMutation.isPending}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#0f172a] font-semibold h-11 mt-2 active:scale-[0.97] transition-all"
            >
              {acceptMutation.isPending ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating account...</span>
              ) : (
                <span className="flex items-center gap-2">Activate account <ArrowRight className="h-4 w-4" /></span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
