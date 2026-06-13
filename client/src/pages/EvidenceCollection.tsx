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
import { CheckCircle, Cloud, Database, FileCheck, Plus, RefreshCw, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  collected: "bg-blue-100 text-blue-800",
  verified: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  pending_review: "bg-yellow-100 text-yellow-800",
};

const sourceIcons: Record<string, any> = {
  microsoft365: Cloud,
  google_workspace: Cloud,
  aws: Database,
  api: RefreshCw,
  automated: Shield,
  manual: FileCheck,
};

const evidenceTypeLabels: Record<string, string> = {
  access_log: "Access Log",
  training_certificate: "Training Certificate",
  policy_acknowledgment: "Policy Acknowledgment",
  audit_report: "Audit Report",
  test_result: "Test Result",
  screenshot: "Screenshot",
  document: "Document",
  api_response: "API Response",
};

export default function EvidenceCollection() {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    evidenceType: "document" as const,
    source: "manual" as const,
    relatedControlId: "",
    fileUrl: "",
    expiresAt: "",
  });

  const { data: items = [], isLoading, refetch } = trpc.evidence.list.useQuery({});
  const { data: summary } = trpc.evidence.summary.useQuery();

  const createItem = trpc.evidence.create.useMutation({
    onSuccess: () => {
      refetch();
      setAddOpen(false);
      setForm({ title: "", description: "", evidenceType: "document", source: "manual", relatedControlId: "", fileUrl: "", expiresAt: "" });
      toast.success("Evidence collected", { description: "Evidence item has been recorded and linked to the audit trail." });
    },
    onError: (e) => toast.error(e.message),
  });

  const verifyItem = trpc.evidence.verify.useMutation({
    onSuccess: () => { refetch(); toast.success("Evidence verified", { description: "Item has been cryptographically verified." }); },
    onError: (e) => toast.error(e.message),
  });

  const simulateAuto = trpc.evidence.simulateAutoCollection.useMutation({
    onSuccess: () => { refetch(); toast.success("Auto-collection complete", { description: "Evidence has been automatically collected from connected systems." }); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="h-7 w-7 text-blue-600" /> Evidence Collection
          </h1>
          <p className="text-gray-500 mt-1">Automated and manual evidence gathering for audit readiness</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => simulateAuto.mutate()} disabled={simulateAuto.isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${simulateAuto.isPending ? "animate-spin" : ""}`} />
            Auto-Collect
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" /> Add Evidence</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add Evidence Item</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Q1 2026 Staff Training Certificates" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Evidence Type</Label>
                    <Select value={form.evidenceType} onValueChange={v => setForm(f => ({ ...f, evidenceType: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(evidenceTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Source</Label>
                    <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Upload</SelectItem>
                        <SelectItem value="microsoft365">Microsoft 365</SelectItem>
                        <SelectItem value="google_workspace">Google Workspace</SelectItem>
                        <SelectItem value="aws">AWS</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="automated">Automated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Control ID</Label><Input value={form.relatedControlId} onChange={e => setForm(f => ({ ...f, relatedControlId: e.target.value }))} placeholder="e.g. FCA-7.3.1" /></div>
                  <div><Label>Expires At</Label><Input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} /></div>
                </div>
                <div><Label>File URL</Label><Input value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="https://..." /></div>
                <Button className="w-full" onClick={() => createItem.mutate(form)} disabled={!form.title || createItem.isPending}>
                  {createItem.isPending ? "Saving..." : "Add Evidence"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Items", value: summary.total || 0, color: "text-blue-600" },
            { label: "Verified", value: (summary.byStatus as any)?.verified || 0, color: "text-green-600" },
            { label: "Pending Review", value: (summary.byStatus as any)?.pending_review || 0, color: "text-yellow-500" },
            { label: "Expired", value: (summary.byStatus as any)?.expired || 0, color: "text-red-600" },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-6"><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></CardContent></Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Connected Evidence Sources</CardTitle><CardDescription>Automated evidence collection from integrated systems</CardDescription></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {[
              { name: "Microsoft 365", icon: Cloud, color: "text-blue-600" },
              { name: "Google Workspace", icon: Cloud, color: "text-red-500" },
              { name: "AWS CloudTrail", icon: Database, color: "text-orange-500" },
              { name: "REST APIs", icon: RefreshCw, color: "text-green-600" },
            ].map(s => (
              <div key={s.name} className="flex items-center gap-2 px-4 py-2 border rounded-full bg-gray-50">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-sm font-medium">{s.name}</span>
                <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Evidence Repository</CardTitle><CardDescription>All collected evidence items with verification status</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading evidence items...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No evidence collected yet</p>
              <p className="text-sm mt-1">Add evidence manually or click Auto-Collect to gather from connected systems</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item: any) => {
                const Icon = sourceIcons[item.source] || FileCheck;
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">{evidenceTypeLabels[item.evidenceType] || item.evidenceType} · {item.source}{item.relatedControlId && ` · ${item.relatedControlId}`}</p>
                        {item.collectedAt && <p className="text-xs text-gray-400 mt-0.5">Collected {formatDistanceToNow(new Date(item.collectedAt), { addSuffix: true })}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[item.status] || "bg-gray-100 text-gray-800"}>{item.status?.replace(/_/g, " ")}</Badge>
                      {item.status === "collected" && (
                        <Button size="sm" variant="outline" onClick={() => verifyItem.mutate({ id: item.id })}>
                          <CheckCircle className="h-3 w-3 mr-1" /> Verify
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
