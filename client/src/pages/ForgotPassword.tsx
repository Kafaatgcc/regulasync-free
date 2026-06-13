import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const forgotMutation = trpc.passwordAuth.forgotPassword.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    forgotMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Shield className="h-5 w-5 text-[#0f172a]" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">RegulaSync</span>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {submitted ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-slate-400 text-sm mb-6">
                If an account exists for <span className="text-white font-medium">{email}</span>, we've sent a password reset link. Check your inbox.
              </p>
              <Link href="/login">
                <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-1">Reset your password</h1>
                <p className="text-slate-400 text-sm">Enter your email and we'll send you a reset link.</p>
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
                  disabled={forgotMutation.isPending}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#0f172a] font-semibold h-11"
                >
                  {forgotMutation.isPending ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Sending...</span>
                  ) : "Send reset link"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link href="/login" className="text-sm text-slate-400 hover:text-slate-300 flex items-center justify-center gap-1 transition-colors">
                  <ArrowLeft className="h-3 w-3" />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
