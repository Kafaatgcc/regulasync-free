import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Loader2, 
  Play, 
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Shield,
  AlertCircle,
  ChevronRight,
  Zap
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface GapResult {
  policyId: number;
  policyTitle: string;
  gapDescription: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendedAction: string;
  affectedSections: string[];
  confidenceScore: number;
}

interface AnalysisResult {
  regulatoryUpdateId: number;
  regulatoryUpdateTitle: string;
  analysisDate: string;
  overallImpact: string;
  summary: string;
  affectedPolicies: GapResult[];
  newPoliciesNeeded: string[];
  recommendedTimeline: string;
  confidenceScore: number;
}

export default function GapAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<string>("");
  const [customRegulation, setCustomRegulation] = useState({
    title: "",
    source: "FCA",
    summary: "",
  });

  const { data: regulatoryUpdates } = trpc.regulatory.list.useQuery();
  const { data: policies } = trpc.policies.list.useQuery();
  
  // Fetch existing gap analysis results from database
  const { data: existingGapResults, refetch: refetchGapResults } = trpc.regulatory.getGapAnalysisResults.useQuery();
  
  // Combine existing results with new analysis results
  const allResults = useMemo(() => {
    const existing = existingGapResults?.results || [];
    // Merge existing and new results, avoiding duplicates by updateId
    const existingIds = new Set(existing.map(r => r.regulatoryUpdateId));
    const newResults = analysisResults.filter(r => !existingIds.has(r.regulatoryUpdateId));
    return [...existing, ...newResults];
  }, [existingGapResults?.results, analysisResults]);
  
  const analyzeImpact = trpc.regulatory.analyzeImpact.useMutation({
    onSuccess: (data) => {
      setAnalysisResults(prev => [...prev, data as AnalysisResult]);
      toast.success("Analysis complete", {
        description: `Found ${(data as AnalysisResult).affectedPolicies?.length || 0} affected policies`,
      });
    },
    onError: (error) => {
      toast.error("Analysis failed", { description: error.message });
    },
  });

  const runGapAnalysis = trpc.regulatory.runGapAnalysis.useMutation({
    onSuccess: (data) => {
      toast.success("Gap analysis complete", {
        description: `Analysis completed successfully`,
      });
      if (data.analysis) {
        setAnalysisResults([data.analysis as AnalysisResult]);
      }
    },
    onError: (error) => {
      toast.error("Gap analysis failed", { description: error.message });
    },
  });

  const handleAnalyzeSelected = async () => {
    if (!selectedUpdate) {
      toast.error("Please select a regulatory update to analyze");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 10, 90));
    }, 500);
    
    try {
      await analyzeImpact.mutateAsync({ updateId: parseInt(selectedUpdate) });
      setAnalysisProgress(100);
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  const handleRunFullAnalysis = async () => {
    if (!selectedUpdate) {
      toast.error("Please select a regulatory update to analyze");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResults([]);
    
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 5, 90));
    }, 1000);
    
    try {
      await runGapAnalysis.mutateAsync({ updateId: parseInt(selectedUpdate) });
      setAnalysisProgress(100);
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      case 'high': return <Badge className="bg-orange-500">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-500 text-black">Medium</Badge>;
      case 'low': return <Badge className="bg-green-500">Low</Badge>;
      default: return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  // Use database stats if available, otherwise calculate from results
  const totalGaps = existingGapResults?.totalGaps ?? allResults.reduce((sum, r) => sum + (r.affectedPolicies?.length || 0), 0);
  const criticalGaps = existingGapResults?.criticalGaps ?? allResults.reduce((sum, r) => 
    sum + (r.affectedPolicies?.filter(p => p.severity === 'critical').length || 0), 0);
  const highGaps = existingGapResults?.highPriorityGaps ?? allResults.reduce((sum, r) => 
    sum + (r.affectedPolicies?.filter(p => p.severity === 'high').length || 0), 0);
  const policiesAnalyzed = existingGapResults?.policiesAnalyzed ?? policies?.length ?? 0;

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            AI-Powered Gap Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Automatically analyze regulatory updates against your policies to identify compliance gaps
          </p>
        </div>
        <Button 
          size="lg" 
          onClick={handleRunFullAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Run Full Analysis
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Gaps Found</p>
                <p className="text-3xl font-bold">{totalGaps}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Gaps</p>
                <p className="text-3xl font-bold text-red-600">{criticalGaps}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-3xl font-bold text-orange-600">{highGaps}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Policies Analyzed</p>
                <p className="text-3xl font-bold">{policiesAnalyzed}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Analysis Progress</span>
                <span className="text-sm text-muted-foreground">{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {analysisProgress < 30 && "Fetching regulatory updates..."}
                {analysisProgress >= 30 && analysisProgress < 60 && "Analyzing policy requirements..."}
                {analysisProgress >= 60 && analysisProgress < 90 && "Identifying compliance gaps..."}
                {analysisProgress >= 90 && "Generating recommendations..."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="analyze" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analyze">Analyze Update</TabsTrigger>
          <TabsTrigger value="results">Analysis Results ({allResults.length})</TabsTrigger>
          <TabsTrigger value="custom">Custom Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Regulatory Update to Analyze</CardTitle>
              <CardDescription>
                Choose a regulatory update from your feed to analyze its impact on your policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Regulatory Update</Label>
                  <Select value={selectedUpdate} onValueChange={setSelectedUpdate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a regulatory update..." />
                    </SelectTrigger>
                    <SelectContent>
                      {regulatoryUpdates?.map((update) => (
                        <SelectItem key={update.id} value={update.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {update.regulatoryBody || update.source}
                            </Badge>
                            <span className="truncate max-w-[300px]">{update.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleAnalyzeSelected} 
                  disabled={!selectedUpdate || isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Analyze Impact
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Regulatory Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Regulatory Updates</CardTitle>
              <CardDescription>
                Latest updates from UK regulatory bodies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regulatoryUpdates?.slice(0, 5).map((update) => (
                  <div 
                    key={update.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedUpdate(update.id.toString())}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${
                        update.impactLevel === 'high' ? 'bg-red-500' :
                        update.impactLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="font-medium">{update.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {update.regulatoryBody || update.source}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {update.effectiveDate ? new Date(update.effectiveDate).toLocaleDateString() : 'No date'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {allResults.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Analysis Results Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Run a gap analysis to see compliance gaps and recommendations
                </p>
                <Button onClick={handleRunFullAnalysis}>
                  <Zap className="mr-2 h-4 w-4" />
                  Run Full Analysis
                </Button>
              </CardContent>
            </Card>
          ) : (
            allResults.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {result.regulatoryUpdateTitle}
                        {getSeverityBadge(result.overallImpact)}
                      </CardTitle>
                      <CardDescription>
                        Analyzed on {new Date(result.analysisDate).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <p className="text-2xl font-bold">{result.confidenceScore}%</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary */}
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Executive Summary</h4>
                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                  </div>

                  {/* Affected Policies */}
                  {result.affectedPolicies && result.affectedPolicies.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-4">Affected Policies ({result.affectedPolicies.length})</h4>
                      <div className="space-y-4">
                        {result.affectedPolicies.map((gap, gapIndex) => (
                          <div key={gapIndex} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${getSeverityColor(gap.severity)}`} />
                                <span className="font-medium">{gap.policyTitle}</span>
                              </div>
                              {getSeverityBadge(gap.severity)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{gap.gapDescription}</p>
                            <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                              <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Recommended Action</p>
                                <p className="text-sm text-muted-foreground">{gap.recommendedAction}</p>
                              </div>
                            </div>
                            {gap.affectedSections && gap.affectedSections.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {gap.affectedSections.map((section, sIndex) => (
                                  <Badge key={sIndex} variant="outline" className="text-xs">
                                    {section}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Policies Needed */}
                  {result.newPoliciesNeeded && result.newPoliciesNeeded.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-4 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        New Policies Needed
                      </h4>
                      <ul className="space-y-2">
                        {result.newPoliciesNeeded.map((policy, pIndex) => (
                          <li key={pIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            {policy}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Timeline */}
                  {result.recommendedTimeline && (
                    <div className="flex items-center gap-2 p-4 border rounded-lg">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Recommended Timeline</p>
                        <p className="text-sm text-muted-foreground">{result.recommendedTimeline}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Regulatory Analysis</CardTitle>
              <CardDescription>
                Enter a custom regulatory update or requirement to analyze against your policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Regulatory Source</Label>
                  <Select 
                    value={customRegulation.source} 
                    onValueChange={(v) => setCustomRegulation(prev => ({ ...prev, source: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FCA">Financial Conduct Authority (FCA)</SelectItem>
                      <SelectItem value="PRA">Prudential Regulation Authority (PRA)</SelectItem>
                      <SelectItem value="BOE">Bank of England (BOE)</SelectItem>
                      <SelectItem value="ICO">Information Commissioner's Office (ICO)</SelectItem>
                      <SelectItem value="NCSC">National Cyber Security Centre (NCSC)</SelectItem>
                      <SelectItem value="Custom">Custom / Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Title / Reference</Label>
                  <Input 
                    placeholder="e.g., FCA PS24/16 - Anti-Money Laundering Amendments"
                    value={customRegulation.title}
                    onChange={(e) => setCustomRegulation(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Regulatory Summary / Requirements</Label>
                  <Textarea 
                    placeholder="Enter the key requirements or summary of the regulatory update..."
                    rows={6}
                    value={customRegulation.summary}
                    onChange={(e) => setCustomRegulation(prev => ({ ...prev, summary: e.target.value }))}
                  />
                </div>
                
                <Button 
                  disabled={!customRegulation.title || !customRegulation.summary || isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze Custom Regulation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
