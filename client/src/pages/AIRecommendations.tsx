import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Target,
  Shield,
  FileText,
  Users,
  Zap
} from "lucide-react";

const recommendations = [
  {
    id: 1,
    title: "Update Anti-Money Laundering Policy",
    description: "New FCA guidance issued on December 15, 2024 requires updates to your AML policy. Key changes include enhanced customer due diligence requirements and new reporting thresholds.",
    category: "policy_update",
    priority: "critical",
    confidence: 94,
    impact: "high",
    effort: "medium",
    deadline: "2025-01-31",
    affectedPolicies: ["AML Policy v3.2", "KYC Procedures"],
    suggestedActions: [
      "Review new FCA guidance document",
      "Update customer verification procedures",
      "Revise suspicious activity reporting thresholds",
      "Schedule compliance team training"
    ],
    status: "pending",
  },
  {
    id: 2,
    title: "Consolidate Overlapping Delegations",
    description: "AI analysis detected 3 delegation of authority records with overlapping scopes, creating potential approval conflicts. Consolidation recommended to streamline approval workflows.",
    category: "optimization",
    priority: "high",
    confidence: 89,
    impact: "medium",
    effort: "low",
    deadline: "2025-01-15",
    affectedPolicies: ["Financial Authority Matrix", "Procurement Delegations"],
    suggestedActions: [
      "Review overlapping delegations",
      "Merge redundant authority records",
      "Update approval workflow documentation"
    ],
    status: "pending",
  },
  {
    id: 3,
    title: "Schedule Compliance Training",
    description: "15 employees have not completed mandatory annual compliance training. Training completion is required for regulatory compliance and audit readiness.",
    category: "training",
    priority: "high",
    confidence: 98,
    impact: "medium",
    effort: "low",
    deadline: "2024-12-31",
    affectedPolicies: ["Employee Training Policy"],
    suggestedActions: [
      "Send training reminders to affected employees",
      "Schedule makeup training sessions",
      "Update training completion tracking"
    ],
    status: "in_progress",
  },
  {
    id: 4,
    title: "Automate Vendor Compliance Monitoring",
    description: "Manual vendor compliance tracking is consuming 12+ hours per week. AI recommends implementing automated monitoring to reduce effort and improve accuracy.",
    category: "automation",
    priority: "medium",
    confidence: 87,
    impact: "high",
    effort: "high",
    deadline: "2025-02-28",
    affectedPolicies: ["Vendor Management Policy", "Third-Party Risk Policy"],
    suggestedActions: [
      "Evaluate automated compliance monitoring tools",
      "Define vendor compliance metrics",
      "Implement automated certificate tracking",
      "Set up expiration alerts"
    ],
    status: "pending",
  },
  {
    id: 5,
    title: "Review Data Retention Periods",
    description: "Current data retention periods exceed regulatory requirements by 2+ years for some data categories. Optimization could reduce storage costs and compliance risk.",
    category: "optimization",
    priority: "medium",
    confidence: 82,
    impact: "medium",
    effort: "medium",
    deadline: "2025-03-15",
    affectedPolicies: ["Data Retention Policy", "GDPR Compliance Policy"],
    suggestedActions: [
      "Audit current retention periods",
      "Compare with regulatory requirements",
      "Update retention schedules",
      "Implement automated data purging"
    ],
    status: "pending",
  },
  {
    id: 6,
    title: "Strengthen Access Control Policies",
    description: "Analysis of access logs shows 23 users with excessive permissions. Implementing least-privilege access would improve security posture.",
    category: "security",
    priority: "high",
    confidence: 91,
    impact: "high",
    effort: "medium",
    deadline: "2025-01-31",
    affectedPolicies: ["Information Security Policy", "Access Control Policy"],
    suggestedActions: [
      "Review user access permissions",
      "Implement role-based access control",
      "Remove unnecessary privileges",
      "Schedule quarterly access reviews"
    ],
    status: "pending",
  },
];

const insights = [
  {
    id: 1,
    title: "Compliance Score Trending Up",
    description: "Overall compliance score has improved 8% over the past quarter",
    type: "positive",
    metric: "+8%",
  },
  {
    id: 2,
    title: "Policy Review Backlog",
    description: "5 policies are overdue for their annual review",
    type: "warning",
    metric: "5",
  },
  {
    id: 3,
    title: "Automation Opportunity",
    description: "40% of manual compliance tasks could be automated",
    type: "opportunity",
    metric: "40%",
  },
  {
    id: 4,
    title: "Risk Reduction",
    description: "Implementing recommendations could reduce risk score by 15%",
    type: "positive",
    metric: "-15%",
  },
];

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  policy_update: { label: "Policy Update", icon: FileText, color: "text-blue-600 bg-blue-50" },
  optimization: { label: "Optimization", icon: Target, color: "text-purple-600 bg-purple-50" },
  training: { label: "Training", icon: Users, color: "text-green-600 bg-green-50" },
  automation: { label: "Automation", icon: Zap, color: "text-amber-600 bg-amber-50" },
  security: { label: "Security", icon: Shield, color: "text-red-600 bg-red-50" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "bg-red-100 text-red-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
};

export default function AIRecommendations() {
  const [selectedRec, setSelectedRec] = useState<typeof recommendations[0] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    
    // Simulate AI analysis with progress
    toast.info("Starting AI analysis...", {
      description: "Scanning policies, delegations, and compliance data"
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.info("Analyzing regulatory requirements...", {
      description: "Checking against FCA, ICO, and industry standards"
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.info("Generating recommendations...", {
      description: "AI is identifying optimization opportunities"
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsAnalyzing(false);
    setAnalysisComplete(true);
    toast.success("Analysis Complete!", {
      description: `Found ${recommendations.length} recommendations with ${recommendations.filter(r => r.priority === 'critical').length} critical priority items`
    });
  }, []);

  const stats = {
    total: recommendations.length,
    critical: recommendations.filter(r => r.priority === "critical").length,
    inProgress: recommendations.filter(r => r.status === "in_progress").length,
    avgConfidence: Math.round(recommendations.reduce((acc, r) => acc + r.confidence, 0) / recommendations.length),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Recommendations
          </h1>
          <p className="text-muted-foreground">Intelligent governance suggestions powered by AI analysis</p>
        </div>
        <Button onClick={runAnalysis} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Run New Analysis
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Recommendations</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-green-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Confidence</p>
                <p className="text-2xl font-bold">{stats.avgConfidence}%</p>
              </div>
              <Brain className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {insights.map((insight) => (
          <Card key={insight.id} className={`${
            insight.type === 'positive' ? 'border-green-200 bg-green-50/50' :
            insight.type === 'warning' ? 'border-amber-200 bg-amber-50/50' :
            'border-blue-200 bg-blue-50/50'
          }`}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                </div>
                <span className={`text-lg font-bold ${
                  insight.type === 'positive' ? 'text-green-600' :
                  insight.type === 'warning' ? 'text-amber-600' :
                  'text-blue-600'
                }`}>{insight.metric}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>AI-generated suggestions based on your governance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec) => {
                  const CategoryIcon = categoryConfig[rec.category]?.icon || Lightbulb;
                  return (
                    <div 
                      key={rec.id} 
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedRec?.id === rec.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedRec(rec)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${categoryConfig[rec.category]?.color}`}>
                          <CategoryIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold">{rec.title}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${priorityConfig[rec.priority].color}`}>
                              {priorityConfig[rec.priority].label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{rec.description}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1">
                              <Brain className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{rec.confidence}% confidence</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Due: {rec.deadline}</span>
                            </div>
                            {rec.status === "in_progress" && (
                              <Badge variant="secondary" className="text-xs">In Progress</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail Panel */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Recommendation Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRec ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">{selectedRec.title}</h4>
                    <Badge variant="outline" className="mt-2">
                      {categoryConfig[selectedRec.category]?.label}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{selectedRec.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">{selectedRec.confidence}%</span>
                    </div>
                    <Progress value={selectedRec.confidence} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Impact</span>
                      <p className="font-medium capitalize">{selectedRec.impact}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Effort</span>
                      <p className="font-medium capitalize">{selectedRec.effort}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Affected Policies</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRec.affectedPolicies.map((policy, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{policy}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Suggested Actions</span>
                    <ul className="mt-2 space-y-2">
                      {selectedRec.suggestedActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1">
                      Accept
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                    <Button variant="outline">Dismiss</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a recommendation to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
