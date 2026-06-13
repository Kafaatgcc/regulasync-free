import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Building2, CheckCircle, Plus, Shield, XCircle } from "lucide-react";

const riskColors: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

const riskScoreColor = (score: number) => {
  if (score >= 75) return "text-red-600";
  if (score >= 50) return "text-orange-500";
  if (score >= 25) return "text-yellow-500";
  return "text-green-600";
};

export default function VendorRisk() {
  const [addOpen, setAddOpen] = useState(false);
  const [assessOpen, setAssessOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", website: "", contactEmail: "", contactName: "", industry: "", country: "United Kingdom", riskTier: "medium" as const, notes: "" });
  const [responses, setResponses] = useState<Record<string, string>>({});

  const { data: vendors = [], isLoading, refetch } = trpc.vendors.list.useQuery();
  const { data: questionnaire = [] } = trpc.vendors.getQuestionnaire.useQuery();

  const createVendor = trpc.vendors.create.useMutation({
    onSuccess: () => {
      refetch();
      setAddOpen(false);
      setForm({ name: "", website: "", contactEmail: "", contactName: "", industry: "", country: "United Kingdom", riskTier: "medium", notes: "" });
      toast.success("Vendor added", { description: "Third-party vendor has been registered for risk assessment." });
    },
    onError: (e) => toast.error(e.message),
  });

  const submitAssessment = trpc.vendors.submitAssessment.useMutation({
    onSuccess: () => {
      refetch();
      setAssessOpen(false);
      setResponses({});
      toast.success("Assessment complete", { description: "Vendor risk score has been calculated and saved." });
    },
    onError: (e) => toast.error(e.message),
  });

  const stats = {
    total: vendors.length,
    critical: vendors.filter((v: any) => v.riskTier === "critical").length,
    high: vendors.filter((v: any) => v.riskTier === "high").length,
    assessed: vendors.filter((v: any) => v.lastAssessmentDate).length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Third-Party Risk Management</h1>
          <p className="text-gray-500 mt-1">Monitor and assess vendor compliance risk across your supply chain</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" /> Add Vendor</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Register New Vendor</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Acme Ltd" />
                </div>
                <div>
                  <Label>Risk Tier</Label>
                  <Select value={form.riskTier} onValueChange={v => setForm(f => ({ ...f, riskTier: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Contact Name</Label><Input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} /></div>
                <div><Label>Contact Email</Label><Input value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Industry</Label><Input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} /></div>
                <div><Label>Country</Label><Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} /></div>
              </div>
              <div><Label>Website</Label><Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
              <Button className="w-full" onClick={() => createVendor.mutate(form)} disabled={!form.name || createVendor.isPending}>
                {createVendor.isPending ? "Registering..." : "Register Vendor"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Vendors", value: stats.total, icon: Building2, color: "text-blue-600" },
          { label: "Critical Risk", value: stats.critical, icon: XCircle, color: "text-red-600" },
          { label: "High Risk", value: stats.high, icon: AlertTriangle, color: "text-orange-500" },
          { label: "Assessed", value: stats.assessed, icon: CheckCircle, color: "text-green-600" },
        ].map(s => (
          <Card key={s.label}><CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Registered Vendors</CardTitle><CardDescription>All third-party vendors and their current risk status</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No vendors registered yet</p>
              <p className="text-sm mt-1">Add your first third-party vendor to begin risk assessment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vendors.map((vendor: any) => (
                <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{vendor.name}</p>
                      <p className="text-sm text-gray-500">{vendor.industry || "Unknown industry"} · {vendor.country || "Unknown country"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {vendor.riskScore !== null && vendor.riskScore !== undefined && (
                      <div className="text-right">
                        <p className={`text-lg font-bold ${riskScoreColor(vendor.riskScore)}`}>{vendor.riskScore}</p>
                        <p className="text-xs text-gray-400">Risk Score</p>
                      </div>
                    )}
                    <Badge className={riskColors[vendor.riskTier] || riskColors.medium}>{vendor.riskTier?.toUpperCase() || "MEDIUM"}</Badge>
                    <Button size="sm" variant="outline" onClick={() => { setSelectedVendorId(vendor.id); setAssessOpen(true); }}>
                      <Shield className="h-3 w-3 mr-1" /> Assess
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={assessOpen} onOpenChange={setAssessOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Vendor Risk Assessment Questionnaire</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {questionnaire.map((q: any) => (
              <div key={q.id} className="p-4 border rounded-lg">
                <div className="flex items-start gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">{q.category}</Badge>
                  <Badge variant="outline" className="text-xs">{q.weight} pts</Badge>
                </div>
                <p className="font-medium text-sm mb-3">{q.question}</p>
                <Select value={responses[q.id] || ""} onValueChange={v => setResponses(r => ({ ...r, [q.id]: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select response..." /></SelectTrigger>
                  <SelectContent>
                    {q.options.map((opt: any) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <Button
              className="w-full"
              onClick={() => selectedVendorId && submitAssessment.mutate({ vendorId: selectedVendorId, responses })}
              disabled={submitAssessment.isPending || Object.keys(responses).length < questionnaire.length}
            >
              {submitAssessment.isPending ? "Calculating..." : `Submit (${Object.keys(responses).length}/${questionnaire.length} answered)`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
