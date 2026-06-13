import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  FileText,
  Scale,
  Zap,
  Bell,
  Shield,
  Brain,
  Building2,
  Clock,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  FileWarning,
  TrendingUp,
  Target
} from "lucide-react";
import { toast } from 'sonner';

// Demo company policies
const companyPolicies = [
  {
    id: "POL-001",
    name: "Anti-Money Laundering Policy",
    version: "2.3",
    lastUpdated: "2025-11-15",
    department: "Compliance",
    status: "active",
    content: `1. Customer Due Diligence (CDD)
- All new customers must undergo identity verification
- Enhanced due diligence for high-risk customers
- Ongoing monitoring of customer transactions

2. Transaction Monitoring
- Automated screening of transactions over £10,000
- Manual review of flagged transactions within 24 hours
- Quarterly reporting to senior management

3. Suspicious Activity Reporting
- Staff training on identifying suspicious activities
- Internal escalation within 48 hours
- SAR filing within 30 days of identification`
  },
  {
    id: "POL-002",
    name: "Data Protection Policy",
    version: "3.1",
    lastUpdated: "2025-10-20",
    department: "IT",
    status: "active",
    content: `1. Data Collection
- Collect only necessary personal data
- Obtain explicit consent for data processing
- Maintain records of processing activities

2. Data Storage
- Encrypt all personal data at rest
- Retain data for maximum 6 years
- Regular backup procedures

3. Data Subject Rights
- Respond to access requests within 30 days
- Provide data portability upon request
- Implement right to erasure procedures`
  },
  {
    id: "POL-003",
    name: "Operational Risk Management",
    version: "1.8",
    lastUpdated: "2025-09-30",
    department: "Operations",
    status: "active",
    content: `1. Risk Assessment
- Annual risk assessment for all business units
- Quarterly review of key risk indicators
- Incident reporting within 24 hours

2. Business Continuity
- Maintain disaster recovery plans
- Annual testing of continuity procedures
- 4-hour recovery time objective

3. Third-Party Risk
- Due diligence on all vendors
- Annual vendor reviews
- Contractual risk transfer requirements`
  }
];

// Regulatory requirements database
const regulatoryRequirements = {
  "FCA": {
    "AML": [
      { id: "FCA-AML-001", requirement: "Customer identification within 14 days of account opening", severity: "high" },
      { id: "FCA-AML-002", requirement: "Enhanced due diligence for PEPs and high-risk jurisdictions", severity: "high" },
      { id: "FCA-AML-003", requirement: "Transaction monitoring threshold of £10,000 for individual transactions", severity: "medium" },
      { id: "FCA-AML-004", requirement: "SAR filing within 7 working days of identification", severity: "critical" },
      { id: "FCA-AML-005", requirement: "Annual AML training for all customer-facing staff", severity: "medium" },
    ],
    "Consumer Duty": [
      { id: "FCA-CD-001", requirement: "Fair value assessment for all products", severity: "high" },
      { id: "FCA-CD-002", requirement: "Clear communication of product risks", severity: "high" },
      { id: "FCA-CD-003", requirement: "Vulnerable customer identification procedures", severity: "medium" },
    ]
  },
  "ICO": {
    "GDPR": [
      { id: "ICO-GDPR-001", requirement: "Data subject access request response within 30 days", severity: "high" },
      { id: "ICO-GDPR-002", requirement: "Data breach notification within 72 hours", severity: "critical" },
      { id: "ICO-GDPR-003", requirement: "Privacy impact assessments for new processing activities", severity: "medium" },
      { id: "ICO-GDPR-004", requirement: "Data retention policy with defined periods", severity: "medium" },
    ]
  },
  "PRA": {
    "Operational Resilience": [
      { id: "PRA-OR-001", requirement: "Identify important business services", severity: "high" },
      { id: "PRA-OR-002", requirement: "Set impact tolerances for disruption", severity: "high" },
      { id: "PRA-OR-003", requirement: "Regular scenario testing of resilience", severity: "medium" },
    ]
  }
};

// New regulatory updates (simulating government/regulator announcements)
const newRegulatoryUpdates = [
  {
    id: "REG-2026-001",
    title: "FCA Updates AML Transaction Monitoring Requirements",
    regulator: "FCA",
    publishedDate: "2026-01-01",
    effectiveDate: "2026-04-01",
    summary: "The FCA has updated AML requirements to lower the transaction monitoring threshold from £10,000 to £5,000 and requires SAR filing within 5 working days instead of 7.",
    changes: [
      { type: "amendment", description: "Transaction monitoring threshold reduced to £5,000", impact: "high" },
      { type: "amendment", description: "SAR filing deadline reduced to 5 working days", impact: "critical" },
      { type: "new", description: "Quarterly AML effectiveness reporting required", impact: "medium" },
    ],
    affectedPolicies: ["POL-001"]
  },
  {
    id: "REG-2026-002",
    title: "ICO Introduces Enhanced Data Breach Notification Rules",
    regulator: "ICO",
    publishedDate: "2025-12-15",
    effectiveDate: "2026-03-01",
    summary: "New requirements for data breach notification including mandatory customer notification within 24 hours for high-severity breaches.",
    changes: [
      { type: "new", description: "Customer notification within 24 hours for high-severity breaches", impact: "critical" },
      { type: "amendment", description: "Expanded definition of personal data breach", impact: "high" },
    ],
    affectedPolicies: ["POL-002"]
  },
  {
    id: "REG-2026-003",
    title: "PRA Operational Resilience Testing Requirements",
    regulator: "PRA",
    publishedDate: "2025-12-20",
    effectiveDate: "2026-06-01",
    summary: "Enhanced requirements for operational resilience testing including mandatory third-party penetration testing.",
    changes: [
      { type: "new", description: "Annual third-party penetration testing required", impact: "high" },
      { type: "amendment", description: "Recovery time objective reduced to 2 hours for critical services", impact: "high" },
    ],
    affectedPolicies: ["POL-003"]
  }
];

interface ComplianceGap {
  policyId: string;
  policyName: string;
  requirement: string;
  requirementId: string;
  severity: string;
  currentState: string;
  requiredAction: string;
  deadline?: string;
}

interface AnalysisResult {
  status: 'idle' | 'analyzing' | 'complete';
  progress: number;
  gaps: ComplianceGap[];
  complianceScore: number;
  recommendations: string[];
}

export default function RegulatorySyncDemo() {
  const [activeTab, setActiveTab] = useState("policy-change");
  const [selectedPolicy, setSelectedPolicy] = useState<string>("POL-001");
  const [policyContent, setPolicyContent] = useState("");
  const [selectedRegUpdate, setSelectedRegUpdate] = useState<string>("REG-001");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>({
    status: 'idle',
    progress: 0,
    gaps: [],
    complianceScore: 0,
    recommendations: []
  });
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);

  // Load policy content when selected
  useEffect(() => {
    if (selectedPolicy) {
      const policy = companyPolicies.find(p => p.id === selectedPolicy);
      if (policy) {
        setPolicyContent(policy.content);
      }
    }
  }, [selectedPolicy]);

  // Simulate policy change analysis
  const analyzeCompanyPolicyChange = async () => {
    if (!selectedPolicy || !policyContent) {
      toast.error("Please select a policy and make changes first");
      return;
    }

    setAnalysisResult({ status: 'analyzing', progress: 0, gaps: [], complianceScore: 0, recommendations: [] });

    // Simulate AI analysis with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setAnalysisResult(prev => ({ ...prev, progress: i }));
    }

    // Generate analysis results based on policy
    const policy = companyPolicies.find(p => p.id === selectedPolicy);
    const gaps: ComplianceGap[] = [];
    const recommendations: string[] = [];

    if (policy?.name.includes("Anti-Money Laundering")) {
      // Check if SAR filing timeline was changed
      if (policyContent.includes("30 days")) {
        gaps.push({
          policyId: policy.id,
          policyName: policy.name,
          requirement: "SAR filing within 7 working days",
          requirementId: "FCA-AML-004",
          severity: "critical",
          currentState: "Policy states 30 days for SAR filing",
          requiredAction: "Update SAR filing timeline to 7 working days as per FCA requirements",
          deadline: "Immediate"
        });
      }
      if (policyContent.includes("48 hours")) {
        gaps.push({
          policyId: policy.id,
          policyName: policy.name,
          requirement: "Internal escalation within 24 hours",
          requirementId: "FCA-AML-006",
          severity: "high",
          currentState: "Policy states 48 hours for internal escalation",
          requiredAction: "Reduce internal escalation timeline to 24 hours",
          deadline: "Within 30 days"
        });
      }
      recommendations.push("Consider implementing automated SAR filing workflow to meet 7-day deadline");
      recommendations.push("Add specific PEP screening procedures to enhanced due diligence section");
      recommendations.push("Include cryptocurrency transaction monitoring in scope");
    }

    if (policy?.name.includes("Data Protection")) {
      if (!policyContent.toLowerCase().includes("72 hours") && !policyContent.toLowerCase().includes("breach notification")) {
        gaps.push({
          policyId: policy.id,
          policyName: policy.name,
          requirement: "Data breach notification within 72 hours",
          requirementId: "ICO-GDPR-002",
          severity: "critical",
          currentState: "No explicit breach notification timeline specified",
          requiredAction: "Add 72-hour breach notification requirement to ICO",
          deadline: "Immediate"
        });
      }
      recommendations.push("Add specific procedures for handling data subject erasure requests");
      recommendations.push("Include data portability format specifications (JSON, CSV)");
    }

    if (policy?.name.includes("Operational Risk")) {
      if (policyContent.includes("4-hour")) {
        gaps.push({
          policyId: policy.id,
          policyName: policy.name,
          requirement: "Recovery time objective for critical services",
          requirementId: "PRA-OR-002",
          severity: "high",
          currentState: "RTO set at 4 hours",
          requiredAction: "Review if 4-hour RTO meets PRA impact tolerance requirements",
          deadline: "Within 60 days"
        });
      }
      recommendations.push("Document mapping between important business services and IT systems");
      recommendations.push("Establish regular tabletop exercises for scenario testing");
    }

    // Add some general recommendations
    recommendations.push("Schedule quarterly policy review to maintain regulatory alignment");
    recommendations.push("Implement version control for all policy documents");

    const complianceScore = gaps.length === 0 ? 98 : Math.max(60, 95 - (gaps.length * 10));

    setAnalysisResult({
      status: 'complete',
      progress: 100,
      gaps,
      complianceScore,
      recommendations
    });

    if (gaps.length > 0) {
      toast.warning(`Analysis Complete: ${gaps.length} compliance gap(s) detected`, {
        description: "Review the gaps and take corrective action"
      });
    } else {
      toast.success("Analysis Complete: Policy is compliant", {
        description: "No regulatory gaps detected"
      });
    }
  };

  // Simulate regulatory update analysis
  const analyzeRegulatoryUpdate = async () => {
    if (!selectedRegUpdate) {
      toast.error("Please select a regulatory update to analyze");
      return;
    }

    setAnalysisResult({ status: 'analyzing', progress: 0, gaps: [], complianceScore: 0, recommendations: [] });

    // Simulate AI analysis with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setAnalysisResult(prev => ({ ...prev, progress: i }));
    }

    const regUpdate = newRegulatoryUpdates.find(r => r.id === selectedRegUpdate);
    const gaps: ComplianceGap[] = [];
    const recommendations: string[] = [];

    if (regUpdate) {
      regUpdate.changes.forEach(change => {
        const affectedPolicy = companyPolicies.find(p => regUpdate.affectedPolicies.includes(p.id));
        if (affectedPolicy) {
          gaps.push({
            policyId: affectedPolicy.id,
            policyName: affectedPolicy.name,
            requirement: change.description,
            requirementId: regUpdate.id,
            severity: change.impact,
            currentState: `Current policy does not address: ${change.description}`,
            requiredAction: change.type === 'new' 
              ? `Add new requirement: ${change.description}`
              : `Update existing policy to comply with: ${change.description}`,
            deadline: regUpdate.effectiveDate
          });
        }
      });

      recommendations.push(`Update affected policies before ${regUpdate.effectiveDate}`);
      recommendations.push("Schedule training sessions for affected departments");
      recommendations.push("Document implementation plan for audit trail");
      recommendations.push("Notify senior management of regulatory changes");
    }

    const complianceScore = Math.max(50, 90 - (gaps.length * 15));

    setAnalysisResult({
      status: 'complete',
      progress: 100,
      gaps,
      complianceScore,
      recommendations
    });

    toast.warning(`Regulatory Impact Analysis Complete`, {
      description: `${gaps.length} policy update(s) required before ${regUpdate?.effectiveDate}`
    });
  };

  const resetDemo = () => {
    setSelectedPolicy("");
    setPolicyContent("");
    setSelectedRegUpdate("");
    setAnalysisResult({
      status: 'idle',
      progress: 0,
      gaps: [],
      complianceScore: 0,
      recommendations: []
    });
    toast.info("Demo reset", { description: "Ready for a new analysis" });
  };

  const severityColors: Record<string, string> = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-blue-100 text-blue-700 border-blue-200"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-[#c9a227]" />
            Regulatory Sync
          </h1>
          <p className="text-muted-foreground">
            Experience how RegulaSync automatically synchronizes your policies with regulatory requirements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetDemo}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Demo
          </Button>
          <Button 
            variant={isAutoSyncEnabled ? "default" : "outline"}
            onClick={() => {
              setIsAutoSyncEnabled(!isAutoSyncEnabled);
              toast.success(isAutoSyncEnabled ? "Auto-sync disabled" : "Auto-sync enabled", {
                description: isAutoSyncEnabled 
                  ? "Manual analysis mode activated" 
                  : "Policies will be automatically checked against new regulations"
              });
            }}
          >
            {isAutoSyncEnabled ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isAutoSyncEnabled ? "Auto-Sync On" : "Auto-Sync Off"}
          </Button>
        </div>
      </div>

      {/* How It Works */}
      <Card className="bg-gradient-to-r from-[#1a2b4a] to-[#2a3b5a] text-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">1. Policy Changes</h3>
                <p className="text-sm text-white/70">When your company updates a policy, RegulaSync automatically compares it against regulatory requirements</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Scale className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">2. Regulatory Updates</h3>
                <p className="text-sm text-white/70">When regulators publish new rules, RegulaSync scans your policies and identifies required changes</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">3. Instant Alerts</h3>
                <p className="text-sm text-white/70">Get immediate notifications about compliance gaps with specific remediation actions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="policy-change" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Company Policy Change
          </TabsTrigger>
          <TabsTrigger value="regulatory-update" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            New Regulatory Update
          </TabsTrigger>
        </TabsList>

        {/* Policy Change Demo */}
        <TabsContent value="policy-change" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Policy Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Company Policy Editor
                </CardTitle>
                <CardDescription>
                  Select a policy and make changes to see how RegulaSync detects compliance gaps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {companyPolicies.map(policy => (
                      <SelectItem key={policy.id} value={policy.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {policy.name} (v{policy.version})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedPolicy && (
                  <>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Department: {companyPolicies.find(p => p.id === selectedPolicy)?.department}</span>
                      <span>Last Updated: {companyPolicies.find(p => p.id === selectedPolicy)?.lastUpdated}</span>
                    </div>
                    <Textarea
                      value={policyContent}
                      onChange={(e) => setPolicyContent(e.target.value)}
                      placeholder="Policy content..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Try changing "30 days" to "7 days" or "48 hours" to "24 hours" to see compliance analysis
                    </p>
                  </>
                )}

                <Button 
                  onClick={analyzeCompanyPolicyChange} 
                  disabled={!selectedPolicy || analysisResult.status === 'analyzing'}
                  className="w-full"
                >
                  {analysisResult.status === 'analyzing' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze Policy Against Regulations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Analysis Results
                </CardTitle>
                <CardDescription>
                  Real-time comparison against FCA, ICO, and PRA requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisResult.status === 'analyzing' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Scanning regulatory database...</span>
                    </div>
                    <Progress value={analysisResult.progress} className="h-2" />
                    <div className="text-sm text-muted-foreground">
                      {analysisResult.progress < 30 && "Parsing policy content..."}
                      {analysisResult.progress >= 30 && analysisResult.progress < 60 && "Matching against FCA requirements..."}
                      {analysisResult.progress >= 60 && analysisResult.progress < 90 && "Checking ICO and PRA compliance..."}
                      {analysisResult.progress >= 90 && "Generating recommendations..."}
                    </div>
                  </div>
                )}

                {analysisResult.status === 'complete' && (
                  <div className="space-y-4">
                    {/* Compliance Score */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Compliance Score</p>
                        <p className={`text-3xl font-bold ${
                          analysisResult.complianceScore >= 90 ? 'text-green-600' :
                          analysisResult.complianceScore >= 70 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {analysisResult.complianceScore}%
                        </p>
                      </div>
                      {analysisResult.complianceScore >= 90 ? (
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-12 w-12 text-amber-600" />
                      )}
                    </div>

                    {/* Gaps */}
                    {analysisResult.gaps.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <FileWarning className="h-4 w-4 text-red-500" />
                          Compliance Gaps Detected ({analysisResult.gaps.length})
                        </h4>
                        {analysisResult.gaps.map((gap, index) => (
                          <div key={index} className={`p-4 rounded-lg border ${severityColors[gap.severity]}`}>
                            <div className="flex items-start justify-between mb-2">
                              <Badge className={severityColors[gap.severity]}>
                                {gap.severity.toUpperCase()}
                              </Badge>
                              <span className="text-xs">{gap.requirementId}</span>
                            </div>
                            <p className="font-medium mb-1">{gap.requirement}</p>
                            <p className="text-sm mb-2">{gap.currentState}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <ArrowRight className="h-4 w-4" />
                              <span className="font-medium">{gap.requiredAction}</span>
                            </div>
                            {gap.deadline && (
                              <div className="flex items-center gap-1 mt-2 text-xs">
                                <Clock className="h-3 w-3" />
                                Deadline: {gap.deadline}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {analysisResult.gaps.length === 0 && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-medium">Policy is compliant with all regulations</span>
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {analysisResult.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#c9a227]" />
                          AI Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {analysisResult.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {analysisResult.status === 'idle' && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a policy and click "Analyze" to see compliance results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Regulatory Update Demo */}
        <TabsContent value="regulatory-update" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regulatory Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  New Regulatory Updates
                </CardTitle>
                <CardDescription>
                  Recent regulatory changes that may affect your policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {newRegulatoryUpdates.map(update => (
                  <div 
                    key={update.id}
                    onClick={() => setSelectedRegUpdate(update.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedRegUpdate === update.id 
                        ? 'border-[#c9a227] bg-[#c9a227]/5' 
                        : 'border-border hover:border-[#c9a227]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">{update.regulator}</Badge>
                      <span className="text-xs text-muted-foreground">{update.publishedDate}</span>
                    </div>
                    <h4 className="font-medium mb-2">{update.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{update.summary}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Effective: {update.effectiveDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {update.changes.length} changes
                      </span>
                    </div>
                  </div>
                ))}

                <Button 
                  onClick={analyzeRegulatoryUpdate}
                  disabled={!selectedRegUpdate || analysisResult.status === 'analyzing'}
                  className="w-full"
                >
                  {analysisResult.status === 'analyzing' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Impact...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Analyze Impact on Company Policies
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Impact Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Policy Impact Analysis
                </CardTitle>
                <CardDescription>
                  How the regulatory update affects your company policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisResult.status === 'analyzing' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Scanning company policies...</span>
                    </div>
                    <Progress value={analysisResult.progress} className="h-2" />
                    <div className="text-sm text-muted-foreground">
                      {analysisResult.progress < 30 && "Loading policy database..."}
                      {analysisResult.progress >= 30 && analysisResult.progress < 60 && "Comparing against new requirements..."}
                      {analysisResult.progress >= 60 && analysisResult.progress < 90 && "Identifying affected sections..."}
                      {analysisResult.progress >= 90 && "Generating action plan..."}
                    </div>
                  </div>
                )}

                {analysisResult.status === 'complete' && (
                  <div className="space-y-4">
                    {/* Required Updates */}
                    {analysisResult.gaps.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          Required Policy Updates ({analysisResult.gaps.length})
                        </h4>
                        {analysisResult.gaps.map((gap, index) => (
                          <div key={index} className={`p-4 rounded-lg border ${severityColors[gap.severity]}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="font-medium">{gap.policyName}</span>
                              </div>
                              <Badge className={severityColors[gap.severity]}>
                                {gap.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">{gap.requirement}</p>
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <ArrowRight className="h-4 w-4" />
                              {gap.requiredAction}
                            </div>
                            {gap.deadline && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                                <Clock className="h-3 w-3" />
                                Must be implemented by: {gap.deadline}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Plan */}
                    {analysisResult.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#c9a227]" />
                          Recommended Action Plan
                        </h4>
                        <ul className="space-y-1">
                          {analysisResult.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#c9a227]/20 text-[#c9a227] text-xs font-medium">
                                {index + 1}
                              </span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {analysisResult.status === 'idle' && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a regulatory update to see its impact on your policies</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Key Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Why This Matters for Your Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Save 80% Time</h4>
              <p className="text-sm text-muted-foreground">
                Automated policy-regulation matching eliminates manual compliance reviews
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Reduce Risk</h4>
              <p className="text-sm text-muted-foreground">
                Catch compliance gaps before they become regulatory issues or fines
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 text-amber-600" />
              </div>
              <h4 className="font-semibold mb-2">Stay Ahead</h4>
              <p className="text-sm text-muted-foreground">
                Real-time alerts when new regulations are published ensure you're never caught off guard
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
