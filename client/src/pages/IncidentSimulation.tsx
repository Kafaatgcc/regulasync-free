import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Activity, Clock, Play, Shield, TrendingDown, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const impactColors: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

const scenarioIcons: Record<string, any> = {
  data_breach: Shield,
  regulatory_change: AlertTriangle,
  cyber_attack: Zap,
  fraud_incident: TrendingDown,
  third_party_failure: Activity,
  system_outage: Clock,
  staff_misconduct: AlertTriangle,
};

export default function IncidentSimulation() {
  
  
  const [scenarioType, setScenarioType] = useState<string>("data_breach");
  const [customDescription, setCustomDescription] = useState("");

  const { data: simulations = [], isLoading, refetch } = trpc.simulations.list.useQuery();
  const { data: templates = [] } = trpc.simulations.templates.useQuery();
  const runSim = trpc.simulations.run.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Simulation complete", { description: "AI has analysed the incident scenario and generated a remediation plan." });
    },
    onError: (e) => toast.error(e.message),
  });

  const selectedTemplate = templates.find((t: any) => t.type === scenarioType) as any;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="h-7 w-7 text-orange-500" /> Incident Simulation
        </h1>
        <p className="text-gray-500 mt-1">Digital twin stress-testing — simulate regulatory incidents and receive AI-powered remediation plans</p>
      </div>

      {/* Simulation Runner */}
      <Card className="border-orange-100 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Run New Simulation</CardTitle>
          <CardDescription className="text-orange-600">Select a scenario and let the AI analyse your compliance posture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Incident Scenario</Label>
            <Select value={scenarioType} onValueChange={setScenarioType}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data_breach">Data Breach</SelectItem>
                <SelectItem value="regulatory_change">Sudden Regulatory Change</SelectItem>
                <SelectItem value="cyber_attack">Cyber Attack</SelectItem>
                <SelectItem value="fraud_incident">Fraud Incident</SelectItem>
                <SelectItem value="third_party_failure">Third-Party Failure</SelectItem>
                <SelectItem value="system_outage">System Outage</SelectItem>
                <SelectItem value="staff_misconduct">Staff Misconduct</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <div className="p-4 bg-white rounded-lg border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={impactColors[selectedTemplate.impactLevel] || "bg-gray-100 text-gray-800"}>
                  {selectedTemplate.impactLevel?.toUpperCase()} IMPACT
                </Badge>
                <span className="text-sm text-gray-500">Notification deadline: {selectedTemplate.notificationDeadline}</span>
              </div>
              <p className="text-sm text-gray-700">{selectedTemplate.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {(selectedTemplate.affectedFrameworks || []).map((f: string) => (
                  <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                ))}
              </div>
              <p className="text-xs text-red-600 mt-2 font-medium">Potential fine: {selectedTemplate.baseFinePotential}</p>
            </div>
          )}

          <div>
            <Label>Custom Context (optional)</Label>
            <Textarea
              value={customDescription}
              onChange={e => setCustomDescription(e.target.value)}
              placeholder="Add specific details about your organisation's context..."
              rows={2}
              className="bg-white"
            />
          </div>

          <Button
            className="w-full bg-orange-600 hover:bg-orange-700"
            onClick={() => runSim.mutate({ scenarioType: scenarioType as any, customDescription: customDescription || undefined })}
            disabled={runSim.isPending}
          >
            <Play className={`h-4 w-4 mr-2 ${runSim.isPending ? "animate-pulse" : ""}`} />
            {runSim.isPending ? "AI Analysing Scenario..." : "Run Simulation"}
          </Button>
        </CardContent>
      </Card>

      {/* Past Simulations */}
      <Card>
        <CardHeader>
          <CardTitle>Simulation History</CardTitle>
          <CardDescription>All past incident simulations with AI-generated remediation plans</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading simulations...</div>
          ) : simulations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No simulations run yet</p>
              <p className="text-sm mt-1">Run your first simulation to stress-test your compliance posture</p>
            </div>
          ) : (
            <div className="space-y-4">
              {simulations.map((sim: any) => {
                const Icon = scenarioIcons[sim.scenarioType] || Activity;
                return (
                  <div key={sim.id} className="border rounded-lg p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{sim.scenarioTitle}</p>
                          <p className="text-xs text-gray-400">
                            {sim.createdAt ? formatDistanceToNow(new Date(sim.createdAt), { addSuffix: true }) : "Recently"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={impactColors[sim.impactLevel] || "bg-gray-100 text-gray-800"}>
                          {sim.impactLevel?.toUpperCase()}
                        </Badge>
                        {sim.complianceScoreBefore !== null && sim.complianceScoreAfter !== null && (
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Score Impact</p>
                            <p className="text-sm font-bold text-red-600">
                              {sim.complianceScoreBefore}% → {sim.complianceScoreAfter}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {sim.aiAnalysis && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-blue-700 mb-1">AI Analysis:</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{sim.aiAnalysis}</p>
                      </div>
                    )}

                    {sim.remediationSteps && sim.remediationSteps.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Remediation Steps:</p>
                        <ol className="space-y-1">
                          {sim.remediationSteps.map((step: string, i: number) => (
                            <li key={i} className="flex gap-2 text-sm text-gray-700">
                              <span className="font-bold text-orange-600 flex-shrink-0">{i + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {sim.estimatedRecoveryDays && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>Estimated recovery: <strong>{sim.estimatedRecoveryDays} days</strong></span>
                      </div>
                    )}
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
