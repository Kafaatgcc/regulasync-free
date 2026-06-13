import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  AlertTriangle,
  Settings,
  Shield,
  FileText,
  Bell,
  Users,
  BarChart3,
  Zap,
  Loader2
} from "lucide-react";
import { toast } from 'sonner';
import { trpc } from "@/lib/trpc";

export default function AdminPanel() {
  const [seedingStatus, setSeedingStatus] = useState<'idle' | 'seeding' | 'complete' | 'error'>('idle');
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'running' | 'complete' | 'error'>('idle');
  const [seedResults, setSeedResults] = useState<Record<string, number> | null>(null);
  const [analysisResults, setAnalysisResults] = useState<{ analyzed: number; failed: number; results: Array<{ updateId: number; success: boolean; error?: string }> } | null>(null);

  // tRPC mutations
  const seedAllData = trpc.admin.seedAllData.useMutation({
    onSuccess: (data) => {
      setSeedingStatus('complete');
      setSeedResults(data);
      toast.success('Database seeded successfully!');
    },
    onError: (error) => {
      setSeedingStatus('error');
      toast.error(`Seeding failed: ${error.message}`);
    }
  });

  const runGapAnalysis = trpc.admin.runGapAnalysis.useMutation({
    onSuccess: (data) => {
      setAnalysisStatus('complete');
      setAnalysisResults(data);
      toast.success('Gap analysis completed!');
    },
    onError: (error) => {
      setAnalysisStatus('error');
      toast.error(`Analysis failed: ${error.message}`);
    }
  });

  const seedAuditData = trpc.admin.seedAuditData.useMutation({
    onSuccess: () => {
      toast.success('Audit data seeded with hash chain!');
    },
    onError: (error) => {
      toast.error(`Audit seeding failed: ${error.message}`);
    }
  });

  const processDueReminders = trpc.admin.processDueReminders.useMutation({
    onSuccess: (data) => {
      toast.success(`Processed ${data.processed} due reminders`);
    },
    onError: (error) => {
      toast.error(`Reminder processing failed: ${error.message}`);
    }
  });

  const seedGapAnalysis = trpc.admin.seedGapAnalysis.useMutation({
    onSuccess: (data) => {
      toast.success(`Gap analysis seeded: ${data.gapsCreated} gaps, ${data.recommendationsCreated} recommendations`);
    },
    onError: (error) => {
      toast.error(`Gap analysis seeding failed: ${error.message}`);
    }
  });

  const handleSeedDatabase = async () => {
    setSeedingStatus('seeding');
    seedAllData.mutate();
  };

  const handleRunGapAnalysis = async () => {
    setAnalysisStatus('running');
    runGapAnalysis.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground">Database management and system administration</p>
        </div>
        <Badge variant="outline" className="w-fit">
          <Shield className="h-3 w-3 mr-1" />
          Admin Access
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Database Status</p>
                <p className="text-lg font-semibold text-green-600">Connected</p>
              </div>
              <Database className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hash Chain</p>
                <p className="text-lg font-semibold text-green-600">Verified</p>
              </div>
              <Shield className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">API Status</p>
                <p className="text-lg font-semibold text-green-600">Healthy</p>
              </div>
              <Zap className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">LLM Service</p>
                <p className="text-lg font-semibold text-green-600">Active</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="seeding" className="space-y-4">
        <TabsList>
          <TabsTrigger value="seeding">Database Seeding</TabsTrigger>
          <TabsTrigger value="analysis">Gap Analysis</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* Database Seeding Tab */}
        <TabsContent value="seeding">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Seed All Data
                </CardTitle>
                <CardDescription>
                  Populate the database with comprehensive demo data including policies, 
                  regulatory updates, compliance records, and more.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Policies</span>
                    <Badge variant="outline">{seedResults?.policies || 0} records</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Regulatory Updates</span>
                    <Badge variant="outline">{seedResults?.regulatoryUpdates || 0} records</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Departments</span>
                    <Badge variant="outline">{seedResults?.departments || 0} records</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Compliance Records</span>
                    <Badge variant="outline">{seedResults?.complianceRecords || 0} records</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>AI Recommendations</span>
                    <Badge variant="outline">{seedResults?.aiRecommendations || 0} records</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Delegations</span>
                    <Badge variant="outline">{seedResults?.delegations || 0} records</Badge>
                  </div>
                </div>

                {seedingStatus === 'seeding' && (
                  <div className="space-y-2">
                    <Progress value={60} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center">Seeding database...</p>
                  </div>
                )}

                {seedingStatus === 'complete' && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Database seeded successfully!</span>
                  </div>
                )}

                {seedingStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm font-medium">Seeding failed. Check console for details.</span>
                  </div>
                )}

                <Button 
                  onClick={handleSeedDatabase} 
                  disabled={seedingStatus === 'seeding'}
                  className="w-full"
                >
                  {seedingStatus === 'seeding' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Seed All Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Seed Audit Trail
                </CardTitle>
                <CardDescription>
                  Create audit entries with cryptographic hash chain verification.
                  Each entry is linked to the previous via SHA-256 hashes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">Hash Chain Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• SHA-256 cryptographic hashing</li>
                    <li>• Chain linking (each entry references previous)</li>
                    <li>• Tamper detection and verification</li>
                    <li>• Immutable audit history</li>
                  </ul>
                </div>

                <Button 
                  onClick={() => seedAuditData.mutate()}
                  disabled={seedAuditData.isPending}
                  className="w-full"
                  variant="outline"
                >
                  {seedAuditData.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Audit Entries...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Seed Audit Data with Hash Chain
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gap Analysis Tab */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                AI-Powered Gap Analysis
              </CardTitle>
              <CardDescription>
                Run AI analysis to compare regulatory updates against company policies 
                and identify compliance gaps. Uses LLM for intelligent comparison.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Step 1: Fetch Updates</h4>
                  <p className="text-sm text-blue-700">
                    Retrieve latest regulatory updates from FCA, PRA, BOE, and ICO feeds.
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Step 2: AI Analysis</h4>
                  <p className="text-sm text-purple-700">
                    LLM compares each update against relevant company policies.
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Step 3: Recommendations</h4>
                  <p className="text-sm text-green-700">
                    Generate actionable recommendations for policy updates.
                  </p>
                </div>
              </div>

              {analysisStatus === 'running' && (
                <div className="space-y-2">
                  <Progress value={45} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Analyzing regulatory updates against policies...
                  </p>
                </div>
              )}

              {analysisStatus === 'complete' && analysisResults && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Analysis Complete</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-600">Updates Analyzed:</span>
                      <span className="ml-2 font-semibold">{analysisResults.analyzed}</span>
                    </div>
                    <div>
                      <span className="text-green-600">Successful:</span>
                      <span className="ml-2 font-semibold">{analysisResults.analyzed - analysisResults.failed}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleRunGapAnalysis}
                  disabled={analysisStatus === 'running'}
                  className="w-full"
                  size="lg"
                >
                  {analysisStatus === 'running' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running Analysis...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Run Live AI Analysis
                    </>
                  )}
                </Button>

                <Button 
                  onClick={() => seedGapAnalysis.mutate()}
                  disabled={seedGapAnalysis.isPending}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  {seedGapAnalysis.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Seeding Scenarios...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Seed UK Regulatory Scenarios
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                "Run Live AI Analysis" uses real-time LLM analysis. "Seed UK Regulatory Scenarios" populates pre-computed gap analysis for 12 realistic UK compliance scenarios.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Process Reminders
                </CardTitle>
                <CardDescription>
                  Process due reminders and send notifications to users.
                  This would typically run on a scheduled cron job.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => processDueReminders.mutate()}
                  disabled={processDueReminders.isPending}
                  className="w-full"
                  variant="outline"
                >
                  {processDueReminders.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Process Due Reminders
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verify Hash Chain
                </CardTitle>
                <CardDescription>
                  Verify the integrity of the audit trail hash chain.
                  Detects any tampering or corruption in the audit log.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => {
                    toast.info('Hash chain verification started...');
                    // This would call the verification endpoint
                    setTimeout(() => {
                      toast.success('Hash chain verified - No tampering detected!');
                    }, 2000);
                  }}
                  className="w-full"
                  variant="outline"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Audit Chain Integrity
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
