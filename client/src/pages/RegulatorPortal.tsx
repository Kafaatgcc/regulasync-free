import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, ExternalLink, Eye, EyeOff, Plus, Shield, Trash2 } from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";

const SCOPE_OPTIONS = [
  { id: "compliance_scores", label: "Compliance Scores" },
  { id: "policy_status", label: "Policy Status" },
  { id: "audit_trail", label: "Audit Trail" },
  { id: "regulatory_updates", label: "Regulatory Updates" },
  { id: "gap_analysis", label: "Gap Analysis" },
];

export default function RegulatorPortal() {
  
  
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    regulatorName: "",
    regulatorEmail: "",
    accessScope: SCOPE_OPTIONS.map(s => s.id),
    validDays: 365,
  });
  const [newGrant, setNewGrant] = useState<any>(null);

  const { data: grants = [], isLoading, refetch } = trpc.regulatorPortal.listGrants.useQuery();

  const grantAccess = trpc.regulatorPortal.grantAccess.useMutation({
    onSuccess: (data) => {
      refetch();
      setNewGrant(data);
      toast.success("Access granted", { description: "Regulator portal access has been created." });
    },
    onError: (e) => toast.error(e.message),
  });

  const revokeAccess = trpc.regulatorPortal.revokeAccess.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Access revoked", { description: "Regulator portal access has been revoked." });
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleScope = (scopeId: string) => {
    setForm(f => ({
      ...f,
      accessScope: f.accessScope.includes(scopeId)
        ? f.accessScope.filter(s => s !== scopeId)
        : [...f.accessScope, scopeId],
    }));
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("Copied", { description: "Access token copied to clipboard." });
  };

  const copyPortalUrl = (token: string) => {
    const url = `${window.location.origin}/regulator-portal/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Copied", { description: "Portal URL copied to clipboard." });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-7 w-7 text-indigo-600" /> Regulator Portal
          </h1>
          <p className="text-gray-500 mt-1">Grant FCA, ICO, and PRA direct read-only access to your live compliance data — eliminating traditional audit cycles</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" /> Grant Access
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Grant Regulator Portal Access</DialogTitle>
            </DialogHeader>
            {newGrant ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-medium text-green-800 mb-2">Access Granted Successfully</p>
                  <p className="text-sm text-green-600 mb-3">Share this access token securely with the regulator. It will not be shown again.</p>
                  <div className="flex items-center gap-2 p-2 bg-white rounded border">
                    <p className="font-mono text-xs text-gray-700 truncate flex-1">{newGrant.accessToken}</p>
                    <Button size="sm" variant="ghost" onClick={() => copyToken(newGrant.accessToken)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button className="w-full mt-3" variant="outline" onClick={() => copyPortalUrl(newGrant.accessToken)}>
                    <ExternalLink className="h-4 w-4 mr-2" /> Copy Portal URL
                  </Button>
                </div>
                <Button className="w-full" onClick={() => { setNewGrant(null); setAddOpen(false); }}>Done</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Regulatory Body *</Label>
                  <Input
                    value={form.regulatorName}
                    onChange={e => setForm(f => ({ ...f, regulatorName: e.target.value }))}
                    placeholder="e.g. Financial Conduct Authority (FCA)"
                  />
                </div>
                <div>
                  <Label>Regulator Email</Label>
                  <Input
                    value={form.regulatorEmail}
                    onChange={e => setForm(f => ({ ...f, regulatorEmail: e.target.value }))}
                    placeholder="supervisor@fca.org.uk"
                  />
                </div>
                <div>
                  <Label>Access Scope</Label>
                  <div className="space-y-2 mt-2">
                    {SCOPE_OPTIONS.map(opt => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <Checkbox
                          id={opt.id}
                          checked={form.accessScope.includes(opt.id)}
                          onCheckedChange={() => toggleScope(opt.id)}
                        />
                        <label htmlFor={opt.id} className="text-sm cursor-pointer">{opt.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Valid for (days)</Label>
                  <Input
                    type="number"
                    value={form.validDays}
                    onChange={e => setForm(f => ({ ...f, validDays: Number(e.target.value) }))}
                    min={1}
                    max={730}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => grantAccess.mutate(form)}
                  disabled={!form.regulatorName || form.accessScope.length === 0 || grantAccess.isPending}
                >
                  {grantAccess.isPending ? "Generating Access..." : "Grant Portal Access"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* How it works */}
      <Card className="bg-indigo-50 border-indigo-100">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Zero Paperwork", desc: "Regulators access live, real-time compliance data without requesting documents or scheduling audits" },
              { title: "Granular Control", desc: "You control exactly what each regulator can see — revoke access instantly at any time" },
              { title: "Immutable Audit Trail", desc: "Every regulator access is logged in the cryptographic audit chain for accountability" },
            ].map(s => (
              <div key={s.title}>
                <p className="font-semibold text-indigo-900">{s.title}</p>
                <p className="text-sm text-indigo-700 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Grants */}
      <Card>
        <CardHeader>
          <CardTitle>Active Access Grants</CardTitle>
          <CardDescription>All regulator portal access grants and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading grants...</div>
          ) : grants.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No access grants created yet</p>
              <p className="text-sm mt-1">Grant your first regulator access to enable continuous compliance visibility</p>
            </div>
          ) : (
            <div className="space-y-3">
              {grants.map((grant: any) => {
                const isExpired = grant.expiresAt && isPast(new Date(grant.expiresAt));
                return (
                  <div key={grant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{grant.regulatorName}</p>
                        <p className="text-sm text-gray-500">
                          {grant.regulatorEmail || "No email"}
                          {grant.expiresAt && ` · Expires ${format(new Date(grant.expiresAt), "dd MMM yyyy")}`}
                        </p>
                        {grant.lastAccessedAt && (
                          <p className="text-xs text-gray-400">
                            Last accessed {formatDistanceToNow(new Date(grant.lastAccessedAt), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={grant.isActive && !isExpired ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {isExpired ? "Expired" : grant.isActive ? "Active" : "Revoked"}
                      </Badge>
                      {grant.isActive && !isExpired && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200"
                          onClick={() => revokeAccess.mutate({ id: grant.id })}
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
