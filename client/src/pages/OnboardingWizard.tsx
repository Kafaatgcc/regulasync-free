import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Building2, Users, Shield, FileText, Webhook,
  CheckCircle, Circle, ChevronRight, ChevronLeft, ExternalLink
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

interface Step {
  id: "step1OrgProfile" | "step2InviteTeam" | "step3ConfigureFrameworks" | "step4UploadPolicies" | "step5ConnectIntegrations";
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: string;
  actionHref: string;
  tips: string[];
}

const STEPS: Step[] = [
  {
    id: "step1OrgProfile",
    title: "Set Up Organisation Profile",
    description: "Configure your organisation's name, industry, regulatory jurisdiction, and contact details.",
    icon: Building2,
    action: "Go to Organisation Settings",
    actionHref: "/settings/organisation",
    tips: [
      "Your industry selection personalises the regulatory intelligence feed",
      "Jurisdiction determines which regulatory bodies are monitored (FCA, PRA, ICO, etc.)",
      "Company size affects benchmarking comparisons",
    ],
  },
  {
    id: "step2InviteTeam",
    title: "Invite Your Compliance Team",
    description: "Add your compliance managers, department users, and auditors to the platform.",
    icon: Users,
    action: "Go to User Management",
    actionHref: "/admin/users",
    tips: [
      "Start with your Compliance Manager — they will configure the frameworks",
      "Department Users only see tasks assigned to them",
      "Auditors have read-only access — safe to invite external auditors",
      "Invitations expire after 7 days",
    ],
  },
  {
    id: "step3ConfigureFrameworks",
    title: "Configure Regulatory Frameworks",
    description: "Select the regulatory frameworks applicable to your organisation and review obligations.",
    icon: Shield,
    action: "Go to Frameworks",
    actionHref: "/compliance/frameworks",
    tips: [
      "Select only frameworks that apply to your business — you can add more later",
      "Each framework populates with pre-loaded obligations from the regulator",
      "The AI will immediately calculate your initial compliance score",
      "Common UK frameworks: FCA SYSC, PRA Rulebook, ICO GDPR, Basel III",
    ],
  },
  {
    id: "step4UploadPolicies",
    title: "Upload Existing Policies",
    description: "Import your current policy documents so the AI can analyse gaps against your frameworks.",
    icon: FileText,
    action: "Go to Policies",
    actionHref: "/policies",
    tips: [
      "Supported formats: PDF, Word (.docx), plain text",
      "The AI analyses each policy against your selected frameworks",
      "Gap analysis runs automatically after upload",
      "You can also create new policies from scratch using the AI Policy Copilot",
    ],
  },
  {
    id: "step5ConnectIntegrations",
    title: "Connect Enterprise Integrations",
    description: "Set up Slack/Teams notifications, webhooks, and API keys for your existing systems.",
    icon: Webhook,
    action: "Go to Integrations",
    actionHref: "/enterprise/integrations",
    tips: [
      "Slack/Teams notifications ensure your team never misses a compliance alert",
      "Webhooks push events to your SIEM, ticketing system, or data warehouse",
      "API keys allow your existing tools to query RegulaSync programmatically",
      "Start with Slack notifications — it takes 2 minutes to set up",
    ],
  },
];

export default function OnboardingWizard() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  const { data: progress, refetch } = trpc.onboarding.get.useQuery();

  const updateStep = trpc.onboarding.updateStep.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e.message),
  });

  const completedSteps = STEPS.filter((s) => progress?.[s.id]).length;
  const progressPct = Math.round((completedSteps / STEPS.length) * 100);
  const isComplete = completedSteps === STEPS.length;

  const markComplete = (stepId: Step["id"]) => {
    updateStep.mutate({ step: stepId, completed: true });
    toast.success("Step marked as complete!");
    if (activeStep < STEPS.length - 1) setActiveStep(activeStep + 1);
  };

  const markIncomplete = (stepId: Step["id"]) => {
    updateStep.mutate({ step: stepId, completed: false });
  };

  const currentStep = STEPS[activeStep];
  const StepIcon = currentStep.icon;

  return (
    <div className="space-y-8 p-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Organisation Setup Wizard</h1>
        <p className="text-muted-foreground mt-1">
          Complete these 5 steps to get your organisation fully configured and compliance-ready.
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Setup Progress</span>
            <span className="text-sm text-muted-foreground">{completedSteps} of {STEPS.length} steps complete</span>
          </div>
          <Progress value={progressPct} className="h-2" />
          {isComplete && (
            <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-400 font-medium">
                Setup complete! Your organisation is fully configured.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step List */}
        <div className="space-y-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const done = progress?.[step.id] ?? false;
            const isActive = idx === activeStep;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                  isActive
                    ? "bg-amber-500/10 border border-amber-500/40"
                    : "bg-muted/20 border border-border/30 hover:bg-muted/40"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  done ? "bg-green-500/20" : isActive ? "bg-amber-500/20" : "bg-muted/40"
                }`}>
                  {done
                    ? <CheckCircle className="w-4 h-4 text-green-500" />
                    : <Icon className={`w-4 h-4 ${isActive ? "text-amber-500" : "text-muted-foreground"}`} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {idx + 1}. {step.title}
                  </p>
                </div>
                {done && <Badge className="text-xs bg-green-600 text-white shrink-0">Done</Badge>}
              </button>
            );
          })}
        </div>

        {/* Active Step Detail */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <StepIcon className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      Step {activeStep + 1}: {currentStep.title}
                    </CardTitle>
                    {progress?.[currentStep.id] && (
                      <Badge className="text-xs bg-green-600 text-white">Complete</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{currentStep.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tips */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tips</p>
                {currentStep.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <a href={currentStep.actionHref}>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {currentStep.action}
                  </Button>
                </a>
                {!progress?.[currentStep.id] ? (
                  <Button
                    variant="outline"
                    onClick={() => markComplete(currentStep.id)}
                    disabled={updateStep.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Complete
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => markIncomplete(currentStep.id)}
                    disabled={updateStep.isPending}
                  >
                    Mark as Incomplete
                  </Button>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep(activeStep - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  {activeStep + 1} / {STEPS.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={activeStep === STEPS.length - 1}
                  onClick={() => setActiveStep(activeStep + 1)}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* All Steps Summary */}
          <Card className="bg-muted/20 border-border/50">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">All Steps</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STEPS.map((step, idx) => {
                  const done = progress?.[step.id] ?? false;
                  return (
                    <div key={step.id} className="flex items-center gap-2">
                      {done
                        ? <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        : <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      }
                      <span className={`text-xs ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {idx + 1}. {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
