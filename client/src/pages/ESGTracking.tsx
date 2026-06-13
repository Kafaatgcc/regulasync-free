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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Leaf, Target, Users } from "lucide-react";

const statusColors: Record<string, string> = {
  on_track: "bg-green-100 text-green-800",
  at_risk: "bg-yellow-100 text-yellow-800",
  off_track: "bg-red-100 text-red-800",
  achieved: "bg-blue-100 text-blue-800",
};

const categoryIcons: Record<string, any> = {
  environmental: Leaf,
  social: Users,
  governance: Target,
};

const categoryColors: Record<string, string> = {
  environmental: "text-green-600 bg-green-50",
  social: "text-blue-600 bg-blue-50",
  governance: "text-purple-600 bg-purple-50",
};

export default function ESGTracking() {
  const [addOpen, setAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [form, setForm] = useState({
    reportingPeriod: new Date().getFullYear().toString(),
    category: "environmental" as const,
    metricName: "",
    metricValue: "",
    unit: "",
    target: "",
    status: "on_track" as const,
    regulatoryFramework: "",
    notes: "",
  });

  const { data: metrics = [], isLoading, refetch } = trpc.esg.list.useQuery(
    activeTab !== "all" ? { category: activeTab as any } : {}
  );
  const { data: summary } = trpc.esg.summary.useQuery();
  const { data: frameworkMetricsRaw } = trpc.esg.frameworkMetrics.useQuery();
  const frameworkMetrics = frameworkMetricsRaw
    ? [
        ...(frameworkMetricsRaw.environmental || []).map((m: any) => ({ ...m, category: "environmental" })),
        ...(frameworkMetricsRaw.social || []).map((m: any) => ({ ...m, category: "social" })),
        ...(frameworkMetricsRaw.governance || []).map((m: any) => ({ ...m, category: "governance" })),
      ]
    : [];

  const seedData = trpc.esg.seed.useMutation({
    onSuccess: () => { refetch(); toast.success("ESG data seeded", { description: "Sample ESG metrics have been loaded." }); },
  });

  const createMetric = trpc.esg.create.useMutation({
    onSuccess: () => {
      refetch();
      setAddOpen(false);
      setForm({ reportingPeriod: new Date().getFullYear().toString(), category: "environmental", metricName: "", metricValue: "", unit: "", target: "", status: "on_track", regulatoryFramework: "", notes: "" });
      toast.success("Metric recorded", { description: "ESG metric has been saved to the database." });
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = activeTab === "all" ? metrics : metrics.filter((m: any) => m.category === activeTab);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Leaf className="h-7 w-7 text-green-600" /> ESG & Sustainability Tracking
          </h1>
          <p className="text-gray-500 mt-1">Environmental, Social, and Governance metrics aligned with UK regulatory frameworks</p>
        </div>
        <div className="flex gap-2">
          {metrics.length === 0 && (
            <Button variant="outline" onClick={() => seedData.mutate()} disabled={seedData.isPending}>
              {seedData.isPending ? "Loading..." : "Load Sample Data"}
            </Button>
          )}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700"><span className="mr-1">+</span> Add Metric</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Record ESG Metric</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="environmental">Environmental</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="governance">Governance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Reporting Period</Label>
                    <Input value={form.reportingPeriod} onChange={e => setForm(f => ({ ...f, reportingPeriod: e.target.value }))} placeholder="2026" />
                  </div>
                </div>
                <div>
                  <Label>Metric Name *</Label>
                  <Input value={form.metricName} onChange={e => setForm(f => ({ ...f, metricName: e.target.value }))} placeholder="e.g. Carbon Emissions (Scope 1)" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label>Value *</Label>
                    <Input value={form.metricValue} onChange={e => setForm(f => ({ ...f, metricValue: e.target.value }))} placeholder="e.g. 45.2" />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="tCO2e" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Target</Label>
                    <Input value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} placeholder="e.g. 40.0" />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on_track">On Track</SelectItem>
                        <SelectItem value="at_risk">At Risk</SelectItem>
                        <SelectItem value="off_track">Off Track</SelectItem>
                        <SelectItem value="achieved">Achieved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Regulatory Framework</Label>
                  <Input value={form.regulatoryFramework} onChange={e => setForm(f => ({ ...f, regulatoryFramework: e.target.value }))} placeholder="e.g. TCFD, SECR, UK Green Finance" />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                </div>
                <Button className="w-full" onClick={() => createMetric.mutate(form)} disabled={!form.metricName || !form.metricValue || createMetric.isPending}>
                  {createMetric.isPending ? "Saving..." : "Record Metric"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {summary && (() => {
        const allCats = Object.values(summary.byCategory || {}) as Record<string, number>[];
        const sum = (key: string) => allCats.reduce((acc, c) => acc + (c[key] || 0), 0);
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6"><p className="text-2xl font-bold text-green-600">{sum("on_track")}</p><p className="text-xs text-gray-500">On Track</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-2xl font-bold text-yellow-500">{sum("at_risk")}</p><p className="text-xs text-gray-500">At Risk</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-2xl font-bold text-red-600">{sum("off_track")}</p><p className="text-xs text-gray-500">Off Track</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-2xl font-bold text-blue-600">{sum("achieved")}</p><p className="text-xs text-gray-500">Achieved</p></CardContent></Card>
          </div>
        );
      })()}

      {frameworkMetrics.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Regulatory Framework Coverage</CardTitle><CardDescription>ESG metrics aligned with UK and international frameworks</CardDescription></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {frameworkMetrics.map((f: any) => (
                <div key={f.framework} className="p-3 border rounded-lg">
                  <p className="font-medium text-sm">{f.framework}</p>
                  <p className="text-xs text-gray-500 mt-1">{f.description}</p>
                  <div className="mt-2">
                    <Progress value={f.coverage} className="h-1.5" />
                    <p className="text-xs text-gray-400 mt-1">{f.coverage}% covered</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Metrics</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">Loading metrics...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Leaf className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No ESG metrics recorded</p>
                  <p className="text-sm mt-1">Add your first metric or load sample data to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((metric: any) => {
                    const Icon = categoryIcons[metric.category] || Target;
                    const colorClass = categoryColors[metric.category] || "text-gray-600 bg-gray-50";
                    return (
                      <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${colorClass}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{metric.metricName}</p>
                            <p className="text-sm text-gray-500">{metric.reportingPeriod} · {metric.regulatoryFramework || "No framework"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{metric.metricValue} {metric.unit}</p>
                            {metric.target && <p className="text-xs text-gray-400">Target: {metric.target} {metric.unit}</p>}
                          </div>
                          <Badge className={statusColors[metric.status] || "bg-gray-100 text-gray-800"}>{metric.status?.replace(/_/g, " ")}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
