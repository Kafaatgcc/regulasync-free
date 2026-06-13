import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Shield, 
  FileText,
  Users,
  Building2,
  Banknote,
  ArrowRight,
  RotateCcw,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'flagged';
  policy: string;
  result?: string;
  timestamp?: string;
}

interface ApprovalRequest {
  id: string;
  type: 'procurement' | 'hr' | 'finance' | 'legal' | 'board';
  title: string;
  amount?: number;
  department: string;
  requester: string;
  description: string;
}

const sampleRequests: ApprovalRequest[] = [
  {
    id: '1',
    type: 'procurement',
    title: 'IT Infrastructure Upgrade',
    amount: 75000,
    department: 'IT',
    requester: 'James Wilson',
    description: 'Purchase of new servers and networking equipment for data centre expansion'
  },
  {
    id: '2',
    type: 'hr',
    title: 'Senior Developer Hire',
    amount: 85000,
    department: 'Engineering',
    requester: 'Sarah Chen',
    description: 'New hire for AI/ML development team - annual salary £85,000'
  },
  {
    id: '3',
    type: 'finance',
    title: 'Q2 Marketing Budget Increase',
    amount: 150000,
    department: 'Marketing',
    requester: 'Michael Brown',
    description: 'Additional budget allocation for digital marketing campaign'
  },
  {
    id: '4',
    type: 'legal',
    title: 'Vendor Contract Renewal',
    amount: 250000,
    department: 'Operations',
    requester: 'Emma Thompson',
    description: 'Three-year contract renewal with cloud services provider'
  },
  {
    id: '5',
    type: 'board',
    title: 'Strategic Partnership Agreement',
    amount: 500000,
    department: 'Executive',
    requester: 'David Lee',
    description: 'Joint venture agreement with European fintech company'
  }
];

const delegationLimits = {
  'Department Manager': 25000,
  'Senior Manager': 50000,
  'Director': 100000,
  'VP': 250000,
  'C-Suite': 500000,
  'Board': Infinity
};

const policyRules = [
  { name: 'Delegation of Authority Policy', check: 'Amount within delegated limit' },
  { name: 'Procurement Policy', check: 'Vendor approved and compliant' },
  { name: 'Budget Policy', check: 'Within departmental budget allocation' },
  { name: 'AML Policy', check: 'No sanctions or PEP flags' },
  { name: 'Data Protection Policy', check: 'GDPR compliance verified' },
  { name: 'Conflict of Interest Policy', check: 'No conflicts declared' }
];

export default function WorkflowSimulator() {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [finalResult, setFinalResult] = useState<'approved' | 'rejected' | 'flagged' | null>(null);
  const [svacHash, setSvacHash] = useState<string>('');

  const generateHash = () => {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const initializeWorkflow = () => {
    const steps: WorkflowStep[] = policyRules.map((rule, index) => ({
      id: `step-${index}`,
      name: rule.name,
      status: 'pending',
      policy: rule.check
    }));
    setWorkflowSteps(steps);
    setFinalResult(null);
    setSvacHash('');
  };

  const runSimulation = async () => {
    if (!selectedRequest) {
      toast.error('Please select a workflow request first');
      return;
    }

    setIsRunning(true);
    initializeWorkflow();

    const amount = customAmount ? parseFloat(customAmount) : selectedRequest.amount || 0;
    
    // Simulate each policy check with delays
    for (let i = 0; i < policyRules.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setWorkflowSteps(prev => prev.map((step, index) => {
        if (index === i) {
          return { ...step, status: 'processing' };
        }
        return step;
      }));

      await new Promise(resolve => setTimeout(resolve, 600));

      // Determine result based on policy
      let result: 'approved' | 'rejected' | 'flagged' = 'approved';
      let resultText = 'Compliant';

      if (policyRules[i].name === 'Delegation of Authority Policy') {
        if (amount > 500000) {
          result = 'flagged';
          resultText = 'Requires Board approval (>£500,000)';
        } else if (amount > 250000) {
          result = 'flagged';
          resultText = 'Requires C-Suite approval (>£250,000)';
        } else if (amount > 100000) {
          resultText = 'Within VP delegation limit';
        }
      }

      if (policyRules[i].name === 'Budget Policy' && amount > 200000) {
        result = 'flagged';
        resultText = 'Exceeds quarterly budget - CFO review required';
      }

      if (policyRules[i].name === 'AML Policy' && selectedRequest.type === 'board') {
        resultText = 'Enhanced due diligence completed';
      }

      setWorkflowSteps(prev => prev.map((step, index) => {
        if (index === i) {
          return { 
            ...step, 
            status: result,
            result: resultText,
            timestamp: new Date().toISOString()
          };
        }
        return step;
      }));
    }

    // Determine final result
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const hasRejection = workflowSteps.some(s => s.status === 'rejected');
    const hasFlagged = workflowSteps.some(s => s.status === 'flagged');
    
    let final: 'approved' | 'rejected' | 'flagged' = 'approved';
    if (hasRejection) final = 'rejected';
    else if (hasFlagged || (customAmount && parseFloat(customAmount) > 100000)) final = 'flagged';

    setFinalResult(final);
    setSvacHash(generateHash());
    setIsRunning(false);

    if (final === 'approved') {
      toast.success('Workflow approved and recorded in SVAC');
    } else if (final === 'flagged') {
      toast.warning('Workflow flagged for additional review');
    } else {
      toast.error('Workflow rejected - policy violation detected');
    }
  };

  const resetSimulation = () => {
    setSelectedRequest(null);
    setCustomAmount('');
    setCustomDescription('');
    setWorkflowSteps([]);
    setFinalResult(null);
    setSvacHash('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'procurement': return <Building2 className="h-4 w-4" />;
      case 'hr': return <Users className="h-4 w-4" />;
      case 'finance': return <Banknote className="h-4 w-4" />;
      case 'legal': return <FileText className="h-4 w-4" />;
      case 'board': return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'flagged': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'processing': return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workflow Approval Simulator</h1>
          <p className="text-muted-foreground mt-1">
            Real-time policy enforcement demonstration - see how RegulaSync evaluates business actions
          </p>
        </div>
        <Button variant="outline" onClick={resetSimulation}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Request Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Select Workflow Request
              </CardTitle>
              <CardDescription>
                Choose a sample request or customize the parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {sampleRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => {
                      setSelectedRequest(request);
                      setCustomAmount(request.amount?.toString() || '');
                      setCustomDescription(request.description);
                    }}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedRequest?.id === request.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(request.type)}
                        <span className="font-medium">{request.title}</span>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {request.type}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {request.department} • {request.requester}
                    </div>
                    {request.amount && (
                      <div className="mt-1 text-lg font-semibold text-primary">
                        £{request.amount.toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customization */}
          {selectedRequest && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customize Parameters</CardTitle>
                <CardDescription>
                  Modify the request to test different policy scenarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount (£)</Label>
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                  <p className="text-xs text-muted-foreground">
                    Try amounts: £50,000 (auto-approve), £150,000 (VP approval), £300,000 (C-Suite), £600,000 (Board)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Request description"
                    rows={3}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={runSimulation}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Evaluating Policies...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Policy Evaluation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Evaluation Results */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Real-Time Policy Evaluation
              </CardTitle>
              <CardDescription>
                Each action is evaluated against governance policies in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workflowSteps.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Select a request and click "Run Policy Evaluation" to see the workflow in action</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workflowSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`p-4 border rounded-lg transition-all ${
                        step.status === 'processing' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' :
                        step.status === 'approved' ? 'border-green-500/50 bg-green-50 dark:bg-green-950/20' :
                        step.status === 'rejected' ? 'border-red-500/50 bg-red-50 dark:bg-red-950/20' :
                        step.status === 'flagged' ? 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/20' :
                        'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(step.status)}
                          <div>
                            <div className="font-medium">{step.name}</div>
                            <div className="text-sm text-muted-foreground">{step.policy}</div>
                          </div>
                        </div>
                        {step.status !== 'pending' && step.status !== 'processing' && (
                          <Badge 
                            variant={
                              step.status === 'approved' ? 'default' :
                              step.status === 'flagged' ? 'secondary' : 'destructive'
                            }
                          >
                            {step.status === 'approved' ? 'Compliant' :
                             step.status === 'flagged' ? 'Review Required' : 'Non-Compliant'}
                          </Badge>
                        )}
                      </div>
                      {step.result && (
                        <div className="mt-2 text-sm pl-8">
                          <ArrowRight className="h-3 w-3 inline mr-1" />
                          {step.result}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Final Result */}
          {finalResult && (
            <Card className={
              finalResult === 'approved' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' :
              finalResult === 'flagged' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' :
              'border-red-500 bg-red-50 dark:bg-red-950/20'
            }>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {finalResult === 'approved' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                  {finalResult === 'flagged' && <AlertTriangle className="h-6 w-6 text-amber-500" />}
                  {finalResult === 'rejected' && <XCircle className="h-6 w-6 text-red-500" />}
                  {finalResult === 'approved' ? 'Workflow Approved' :
                   finalResult === 'flagged' ? 'Flagged for Review' : 'Workflow Rejected'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  {finalResult === 'approved' && 'All policy checks passed. Action has been auto-approved and recorded in the Self-Validating Audit Cache (SVAC).'}
                  {finalResult === 'flagged' && 'Some policy checks require additional review. The request has been escalated to the appropriate authority level.'}
                  {finalResult === 'rejected' && 'One or more policy violations detected. The action has been blocked with corrective guidance provided.'}
                </p>
                
                {svacHash && (
                  <div className="p-3 bg-background rounded border">
                    <div className="text-xs text-muted-foreground mb-1">SVAC Hash (SHA-256)</div>
                    <code className="text-xs font-mono break-all">{svacHash}</code>
                  </div>
                )}

                <div className="flex gap-2">
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date().toLocaleTimeString()}
                  </Badge>
                  <Badge variant="outline">
                    <Shield className="h-3 w-3 mr-1" />
                    Immutable Record
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delegation Limits Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delegation of Authority Limits</CardTitle>
          <CardDescription>
            Reference table showing approval thresholds by role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(delegationLimits).map(([role, limit]) => (
              <div key={role} className="text-center p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">{role}</div>
                <div className="text-lg font-semibold text-primary">
                  {limit === Infinity ? 'Unlimited' : `£${limit.toLocaleString()}`}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
