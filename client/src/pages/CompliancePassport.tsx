import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Award, CheckCircle, Copy, ExternalLink, QrCode, Shield, XCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  revoked: "bg-gray-100 text-gray-800",
};

export default function CompliancePassport() {
  
  
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const { data: passports = [], isLoading, refetch } = trpc.passports.list.useQuery();

  const issuePassport = trpc.passports.issue.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Passport issued", { description: "Your compliance passport has been generated and cryptographically signed." });
    },
    onError: (e) => toast.error(e.message),
  });

  const [verifyLoading, setVerifyLoading] = useState(false);
  const utils = trpc.useUtils();
  const doVerify = async () => {
    if (!verifyHash.trim()) return;
    setVerifyLoading(true);
    try {
      const result = await utils.client.passports.verify.query({ passportHash: verifyHash.trim() });
      setVerifyResult(result);
    } catch {
      setVerifyResult({ valid: false });
    } finally {
      setVerifyLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied", { description: "Passport hash copied to clipboard." });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="h-7 w-7 text-blue-600" /> Compliance Passports
          </h1>
          <p className="text-gray-500 mt-1">Cryptographically-signed, verifiable proof of compliance — no PDFs, no manual audits</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => issuePassport.mutate({})}
          disabled={issuePassport.isPending}
        >
          <Shield className="h-4 w-4 mr-2" />
          {issuePassport.isPending ? "Generating..." : "Issue New Passport"}
        </Button>
      </div>

      {/* How it works */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Issue Passport", desc: "RegulaSync analyses your current compliance posture and generates a cryptographically-signed passport" },
              { step: "2", title: "Share Securely", desc: "Share the passport hash with regulators, partners, or auditors — no sensitive data exposed" },
              { step: "3", title: "Instant Verification", desc: "Anyone with the hash can instantly verify your compliance status without contacting you" },
            ].map(s => (
              <div key={s.step} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{s.step}</div>
                <div>
                  <p className="font-medium text-gray-900">{s.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verify Passport */}
      <Card>
        <CardHeader>
          <CardTitle>Verify a Passport</CardTitle>
          <CardDescription>Enter a passport hash to verify its authenticity and compliance status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={verifyHash}
              onChange={e => setVerifyHash(e.target.value)}
              placeholder="Enter passport hash..."
              className="font-mono text-sm"
            />
            <Button
              onClick={doVerify}
              disabled={!verifyHash || verifyLoading}
            >
              {verifyLoading ? "Verifying..." : "Verify"}
            </Button>
          </div>
          {verifyResult && (
            <div className={`mt-4 p-4 rounded-lg border ${verifyResult.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center gap-2">
                {verifyResult.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <p className={`font-medium ${verifyResult.valid ? "text-green-800" : "text-red-800"}`}>
                  {verifyResult.valid ? "Passport Valid — Compliance Verified" : "Invalid or Expired Passport"}
                </p>
              </div>
              {verifyResult.valid && verifyResult.passport && (
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Overall Score</p>
                    <p className="font-bold text-gray-900">{verifyResult.passport.overallScore}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Valid Until</p>
                    <p className="font-bold text-gray-900">{verifyResult.passport.validUntil ? format(new Date(verifyResult.passport.validUntil), "dd MMM yyyy") : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Frameworks</p>
                    <p className="font-bold text-gray-900">{(verifyResult.passport.frameworks || []).join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Issued</p>
                    <p className="font-bold text-gray-900">{verifyResult.passport.issuedAt ? format(new Date(verifyResult.passport.issuedAt), "dd MMM yyyy") : "N/A"}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issued Passports */}
      <Card>
        <CardHeader>
          <CardTitle>Your Compliance Passports</CardTitle>
          <CardDescription>All issued passports with their current validity status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading passports...</div>
          ) : passports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No passports issued yet</p>
              <p className="text-sm mt-1">Issue your first compliance passport to share verifiable proof of compliance</p>
            </div>
          ) : (
            <div className="space-y-4">
              {passports.map((passport: any) => (
                <div key={passport.id} className="border rounded-lg p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Award className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">Compliance Passport #{passport.id}</p>
                          <Badge className={statusColors[passport.status] || "bg-gray-100 text-gray-800"}>
                            {passport.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Issued {passport.issuedAt ? formatDistanceToNow(new Date(passport.issuedAt), { addSuffix: true }) : "recently"}
                          {passport.validUntil && ` · Valid until ${format(new Date(passport.validUntil), "dd MMM yyyy")}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">{passport.overallScore}%</p>
                      <p className="text-xs text-gray-400">Compliance Score</p>
                    </div>
                  </div>

                  {passport.frameworks && passport.frameworks.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {passport.frameworks.map((f: string) => (
                        <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                  )}

                  {passport.passportHash && (
                    <div className="mt-3 flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                      <QrCode className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <p className="font-mono text-xs text-gray-600 truncate flex-1">{passport.passportHash}</p>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(passport.passportHash)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
