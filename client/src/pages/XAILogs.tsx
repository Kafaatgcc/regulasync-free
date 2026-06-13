import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle, Eye, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function XAILogs() {
  
  

  const { data: logs = [], isLoading, refetch } = trpc.xai.list.useQuery({});
  const { data: summary } = trpc.xai.summary.useQuery();
  const markReviewed = trpc.xai.markReviewed.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Marked as reviewed", { description: "XAI log has been reviewed and signed off." });
    },
    onError: (e) => toast.error(e.message),
  });

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-500";
    return "text-red-600";
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Brain className="h-7 w-7 text-purple-600" /> Explainable AI Logs
        </h1>
        <p className="text-gray-500 mt-1">Full transparency into every AI decision — regulatory references, confidence scores, and reasoning chains</p>
      </div>

      {/* FCA Alignment Notice */}
      <Card className="bg-purple-50 border-purple-100">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-purple-800">FCA Consumer Duty Aligned</p>
              <p className="text-sm text-purple-600 mt-0.5">
                Every AI recommendation is logged with full explainability in compliance with FCA Consumer Duty requirements
                and the UK Government's AI Governance Framework. Human review is required for high-stakes decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total AI Decisions", value: summary.total || 0, color: "text-purple-600" },
            { label: "Avg Confidence", value: `${summary.avgConfidence || 0}%`, color: "text-blue-600" },
            { label: "Needs Human Review", value: summary.humanReviewRequired || 0, color: "text-orange-500" },
            { label: "Reviewed", value: summary.reviewed || 0, color: "text-green-600" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>AI Decision Log</CardTitle>
          <CardDescription>Complete audit trail of all AI-generated recommendations with full reasoning transparency</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading XAI logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No AI decisions logged yet</p>
              <p className="text-sm mt-1">XAI logs are automatically created when the AI makes recommendations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log: any) => (
                <div key={log.id} className="border rounded-lg p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">AI Decision #{log.id}</p>
                          {log.humanReviewRequired && (
                            <Badge className="bg-orange-100 text-orange-800 text-xs">Review Required</Badge>
                          )}
                          {log.reviewedAt && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" /> Reviewed
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {log.modelUsed} · {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : "Recently"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getConfidenceColor(log.confidenceScore || 0)}`}>
                        {log.confidenceScore || 0}%
                      </p>
                      <p className="text-xs text-gray-400">Confidence</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <Progress value={log.confidenceScore || 0} className="h-1.5" />
                  </div>

                  {log.reasoning && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">Reasoning:</p>
                      <p className="text-sm text-gray-700">{log.reasoning}</p>
                    </div>
                  )}

                  {log.regulatoryReferences && log.regulatoryReferences.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Regulatory References:</p>
                      <div className="flex flex-wrap gap-1">
                        {log.regulatoryReferences.map((ref: string) => (
                          <Badge key={ref} variant="outline" className="text-xs">{ref}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.decisionFactors && Object.keys(log.decisionFactors).length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Decision Factors:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(log.decisionFactors).map(([k, v]) => (
                          <div key={k} className="text-xs text-gray-600">
                            <span className="font-medium">{k}:</span> {String(v)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.alternativesConsidered && log.alternativesConsidered.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Alternatives Considered:</p>
                      <ul className="text-xs text-gray-500 list-disc list-inside">
                        {log.alternativesConsidered.map((alt: string, i: number) => (
                          <li key={i}>{alt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!log.reviewedAt && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markReviewed.mutate({ id: log.id })}
                      disabled={markReviewed.isPending}
                    >
                      <Eye className="h-3 w-3 mr-1" /> Mark as Reviewed
                    </Button>
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
