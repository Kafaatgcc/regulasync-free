import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GitBranch, 
  Users, 
  Shield, 
  FileText, 
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Building2,
  Banknote,
  Scale,
  Briefcase,
  ChevronRight
} from "lucide-react";

interface LogicNode {
  id: string;
  type: 'policy' | 'decision' | 'action' | 'approval';
  title: string;
  description: string;
  conditions?: string[];
  outputs?: { label: string; target: string }[];
}

const approvalHierarchy = [
  { role: 'Board of Directors', limit: 'Unlimited', color: 'bg-purple-500' },
  { role: 'Chief Executive Officer', limit: '£500,000', color: 'bg-indigo-500' },
  { role: 'Chief Financial Officer', limit: '£250,000', color: 'bg-blue-500' },
  { role: 'Vice President', limit: '£100,000', color: 'bg-cyan-500' },
  { role: 'Director', limit: '£50,000', color: 'bg-teal-500' },
  { role: 'Senior Manager', limit: '£25,000', color: 'bg-green-500' },
  { role: 'Department Manager', limit: '£10,000', color: 'bg-lime-500' },
];

const policyMappings = [
  {
    policy: 'Delegation of Authority Policy',
    workflows: ['Procurement', 'Contract Signing', 'Budget Approval', 'Hiring'],
    departments: ['All Departments'],
    icon: Users
  },
  {
    policy: 'Anti-Money Laundering Policy',
    workflows: ['Customer Onboarding', 'Transaction Monitoring', 'SAR Filing'],
    departments: ['Finance', 'Compliance', 'Operations'],
    icon: Shield
  },
  {
    policy: 'Data Protection Policy',
    workflows: ['Data Access Requests', 'Third-Party Sharing', 'Data Retention'],
    departments: ['IT', 'Legal', 'All Departments'],
    icon: FileText
  },
  {
    policy: 'Procurement Policy',
    workflows: ['Vendor Selection', 'Purchase Orders', 'Contract Renewal'],
    departments: ['Procurement', 'Finance', 'Operations'],
    icon: Building2
  },
  {
    policy: 'Financial Reporting Policy',
    workflows: ['Expense Approval', 'Budget Allocation', 'Audit Preparation'],
    departments: ['Finance', 'Executive'],
    icon: Banknote
  },
  {
    policy: 'Conflict of Interest Policy',
    workflows: ['Vendor Relationships', 'Board Decisions', 'Investment Approvals'],
    departments: ['Legal', 'Executive', 'Board'],
    icon: Scale
  }
];

const workflowLogic = {
  procurement: [
    { step: 1, action: 'Request Submitted', policy: 'Procurement Policy', check: 'Valid business justification' },
    { step: 2, action: 'Budget Check', policy: 'Financial Reporting Policy', check: 'Within department budget' },
    { step: 3, action: 'Vendor Verification', policy: 'AML Policy', check: 'Vendor not on sanctions list' },
    { step: 4, action: 'Authority Check', policy: 'Delegation of Authority', check: 'Approver has sufficient limit' },
    { step: 5, action: 'Conflict Check', policy: 'Conflict of Interest', check: 'No declared conflicts' },
    { step: 6, action: 'Final Approval', policy: 'All Policies', check: 'All checks passed' },
  ],
  hiring: [
    { step: 1, action: 'Position Request', policy: 'HR Policy', check: 'Approved headcount' },
    { step: 2, action: 'Budget Verification', policy: 'Financial Reporting', check: 'Salary within budget' },
    { step: 3, action: 'Authority Check', policy: 'Delegation of Authority', check: 'Manager approval level' },
    { step: 4, action: 'Background Check', policy: 'AML/KYC Policy', check: 'No adverse findings' },
    { step: 5, action: 'Offer Approval', policy: 'HR Policy', check: 'Terms within guidelines' },
  ],
  contract: [
    { step: 1, action: 'Contract Review', policy: 'Legal Policy', check: 'Standard terms verified' },
    { step: 2, action: 'Risk Assessment', policy: 'Risk Management', check: 'Acceptable risk level' },
    { step: 3, action: 'Financial Review', policy: 'Financial Policy', check: 'Value assessment' },
    { step: 4, action: 'Authority Check', policy: 'Delegation of Authority', check: 'Signing authority' },
    { step: 5, action: 'Execution', policy: 'All Policies', check: 'All approvals obtained' },
  ]
};

export default function GovernanceLogic() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<'procurement' | 'hiring' | 'contract'>('procurement');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Governance Logic Model</h1>
        <p className="text-muted-foreground mt-1">
          Visual representation of how policies are converted into machine-enforceable governance rules
        </p>
      </div>

      <Tabs defaultValue="hierarchy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hierarchy">Approval Hierarchy</TabsTrigger>
          <TabsTrigger value="mapping">Policy Mapping</TabsTrigger>
          <TabsTrigger value="workflow">Workflow Logic</TabsTrigger>
        </TabsList>

        {/* Approval Hierarchy Tab */}
        <TabsContent value="hierarchy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                Delegation of Authority Hierarchy
              </CardTitle>
              <CardDescription>
                Visual representation of approval limits by organisational role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Hierarchy Visualization */}
                <div className="flex flex-col items-center space-y-2">
                  {approvalHierarchy.map((level, index) => (
                    <div key={level.role} className="w-full max-w-2xl">
                      <div 
                        className={`${level.color} text-white p-4 rounded-lg shadow-lg transition-all hover:scale-105`}
                        style={{ 
                          marginLeft: `${index * 2}%`,
                          marginRight: `${index * 2}%`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5" />
                            <span className="font-semibold">{level.role}</span>
                          </div>
                          <Badge variant="secondary" className="bg-white/20 text-white">
                            Up to {level.limit}
                          </Badge>
                        </div>
                      </div>
                      {index < approvalHierarchy.length - 1 && (
                        <div className="flex justify-center py-1">
                          <ArrowDown className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">How It Works</h4>
                  <p className="text-sm text-muted-foreground">
                    When a request is submitted, RegulaSync automatically identifies the appropriate approval level based on the request value. 
                    Requests within a manager's delegation limit are auto-approved and recorded in SVAC. 
                    Requests exceeding the limit are automatically escalated to the next authority level.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escalation Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Automatic Escalation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Auto-Approve</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Request within approver's delegation limit and all policy checks pass
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">Escalate</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Request exceeds approver's limit - automatically routed to higher authority
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    <span className="font-medium">Block & Alert</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Policy violation detected - action blocked with corrective guidance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policy Mapping Tab */}
        <TabsContent value="mapping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Policy-to-Workflow Mapping
              </CardTitle>
              <CardDescription>
                How each policy applies to specific business workflows and departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policyMappings.map((mapping) => {
                  const Icon = mapping.icon;
                  return (
                    <div key={mapping.policy} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{mapping.policy}</h4>
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-2">Applied Workflows</div>
                              <div className="flex flex-wrap gap-2">
                                {mapping.workflows.map((workflow) => (
                                  <Badge key={workflow} variant="secondary">
                                    {workflow}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-2">Departments</div>
                              <div className="flex flex-wrap gap-2">
                                {mapping.departments.map((dept) => (
                                  <Badge key={dept} variant="outline">
                                    {dept}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Logic Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Workflow Decision Logic
              </CardTitle>
              <CardDescription>
                Step-by-step policy evaluation for common business workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Workflow Selector */}
              <div className="flex gap-2 mb-6">
                <Button
                  variant={selectedWorkflow === 'procurement' ? 'default' : 'outline'}
                  onClick={() => setSelectedWorkflow('procurement')}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Procurement
                </Button>
                <Button
                  variant={selectedWorkflow === 'hiring' ? 'default' : 'outline'}
                  onClick={() => setSelectedWorkflow('hiring')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Hiring
                </Button>
                <Button
                  variant={selectedWorkflow === 'contract' ? 'default' : 'outline'}
                  onClick={() => setSelectedWorkflow('contract')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Contract
                </Button>
              </div>

              {/* Workflow Steps */}
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-4">
                  {workflowLogic[selectedWorkflow].map((step, index) => (
                    <div key={step.step} className="relative flex gap-4">
                      <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold">
                        {step.step}
                      </div>
                      <div className="flex-1 p-4 border rounded-lg bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{step.action}</h4>
                          <Badge variant="outline">{step.policy}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Check: {step.check}</span>
                        </div>
                        {index < workflowLogic[selectedWorkflow].length - 1 && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <ChevronRight className="h-3 w-3" />
                            <span>If passed, proceed to next step</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Governance Logic Applied</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Each step in the workflow is automatically evaluated against the relevant policy. 
                  Compliant actions proceed automatically, while non-compliant actions are flagged with specific guidance.
                  All decisions are recorded in the Self-Validating Audit Cache (SVAC) for regulatory audit purposes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
