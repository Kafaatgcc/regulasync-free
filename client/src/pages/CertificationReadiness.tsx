import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Target,
  Award,
  FileCheck,
  Lock
} from "lucide-react";

interface ReadinessPlan {
  id: string;
  name: string;
  description: string;
  category: 'certification' | 'attestation' | 'legal-obligation';
  status: 'in-progress' | 'planned';
  progress: number;
  plannedPhase: string;
  requirements: { name: string; status: 'done' | 'in-progress' | 'pending' }[];
  benefits: string[];
}

// Prototype checklist examples, not evidence of implemented controls or assurance.
const readinessPlans: ReadinessPlan[] = [
  {
    id: 'cyber-essentials',
    name: 'Cyber Essentials',
    description: 'Planned assessment under the UK Government-backed baseline cyber security scheme',
    category: 'certification',
    status: 'planned',
    progress: 100,
    plannedPhase: 'Foundation controls',
    requirements: [
      { name: 'Firewall Configuration', status: 'done' },
      { name: 'Secure Configuration', status: 'done' },
      { name: 'Access Control', status: 'done' },
      { name: 'Malware Protection', status: 'done' },
      { name: 'Patch Management', status: 'done' },
    ],
    benefits: ['Baseline security assessment', 'Support for relevant procurement requirements'],
  },
  {
    id: 'cyber-essentials-plus',
    name: 'Cyber Essentials Plus',
    description: 'Planned certification involving independent technical verification',
    category: 'certification',
    status: 'planned',
    progress: 75,
    plannedPhase: 'Independent technical assessment',
    requirements: [
      { name: 'All CE Requirements', status: 'done' },
      { name: 'Vulnerability Assessment', status: 'done' },
      { name: 'Technical Verification Preparation', status: 'in-progress' },
      { name: 'Independent Assessment', status: 'pending' },
    ],
    benefits: ['Independent verification', 'Support for customer security reviews'],
  },
  {
    id: 'iso-27001',
    name: 'ISO 27001:2022',
    description: 'Planned information security management system certification',
    category: 'certification',
    status: 'planned',
    progress: 45,
    plannedPhase: 'Security management system preparation',
    requirements: [
      { name: 'ISMS Documentation', status: 'done' },
      { name: 'Risk Assessment', status: 'done' },
      { name: 'Control Implementation', status: 'in-progress' },
      { name: 'Internal Audit', status: 'pending' },
      { name: 'Management Review', status: 'pending' },
      { name: 'External Certification Audit', status: 'pending' },
    ],
    benefits: ['Structured security management', 'Support for enterprise due diligence'],
  },
  {
    id: 'soc2-type1',
    name: 'SOC 2 Type I',
    description: 'Planned independent attestation report, not a certification',
    category: 'attestation',
    status: 'planned',
    progress: 15,
    plannedPhase: 'Assurance reporting preparation',
    requirements: [
      { name: 'Trust Services Criteria Mapping', status: 'in-progress' },
      { name: 'Control Design Documentation', status: 'pending' },
      { name: 'Evidence Collection', status: 'pending' },
      { name: 'Readiness Assessment', status: 'pending' },
      { name: 'Type I Examination', status: 'pending' },
    ],
    benefits: ['Independent control reporting', 'Support for customer assurance reviews'],
  },
  {
    id: 'uk-gdpr-obligations',
    name: 'UK GDPR Obligations',
    description: 'Ongoing legal obligations, not a certification; this is an illustrative preparation checklist',
    category: 'legal-obligation',
    status: 'planned',
    progress: 60,
    plannedPhase: 'Privacy governance review',
    requirements: [
      { name: 'Data Processing Records', status: 'done' },
      { name: 'Data Protection Impact Assessments', status: 'done' },
      { name: 'Data Subject Rights Procedures', status: 'done' },
      { name: 'Breach Notification Process', status: 'in-progress' },
      { name: 'Assess Whether a DPO Is Required', status: 'pending' },
    ],
    benefits: ['Document privacy responsibilities', 'Support for data protection reviews'],
  }
];

const roadmapMilestones = [
  { phase: 'Foundation controls', milestone: 'Prepare for Cyber Essentials assessment', status: 'planned' },
  { phase: 'Technical verification', milestone: 'Prepare for Cyber Essentials Plus assessment', status: 'planned' },
  { phase: 'Privacy governance', milestone: 'Review ongoing UK GDPR obligations', status: 'planned' },
  { phase: 'Security management', milestone: 'Prepare for ISO 27001 certification audit', status: 'planned' },
  { phase: 'Initial assurance reporting', milestone: 'Prepare for SOC 2 Type I examination', status: 'planned' },
  { phase: 'Operating effectiveness review', milestone: 'Prepare for SOC 2 Type II examination', status: 'planned' },
];

export default function CertificationReadiness() {
  const getStatusBadge = (status: ReadinessPlan['status']) => {
    return status === 'in-progress'
      ? <Badge className="bg-blue-500">In Progress</Badge>
      : <Badge className="bg-amber-500">Planned</Badge>;
  };

  const getRequirementIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 aria-label="Illustrative task marked done" className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock aria-label="Illustrative task in progress" className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle aria-label="Illustrative task pending" className="h-4 w-4 text-gray-400" />;
    }
  };

  const certificationCount = readinessPlans.filter(plan => plan.category === 'certification').length;
  const attestationCount = readinessPlans.filter(plan => plan.category === 'attestation').length;
  const legalObligationCount = readinessPlans.filter(plan => plan.category === 'legal-obligation').length;
  const illustrativeProgress = Math.round(readinessPlans.reduce((acc, plan) => acc + plan.progress, 0) / readinessPlans.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Certification Readiness</h1>
        <p className="text-muted-foreground mt-1">
          Prototype checklist for planned certifications, assurance reports and legal obligation workstreams.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Illustrative data only. No certification or SOC 2 report is evidenced here. Checklist percentages and
          completed sample tasks do not establish actual certification readiness or legal compliance.
          UK GDPR obligations apply to relevant processing regardless of these planned workstreams.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{certificationCount}</div>
                <div className="text-sm text-muted-foreground">Certification Plans</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{attestationCount}</div>
                <div className="text-sm text-muted-foreground">Attestation Plans</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{legalObligationCount}</div>
                <div className="text-sm text-muted-foreground">Legal Obligation Workstreams</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Shield className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{illustrativeProgress}%</div>
                <div className="text-sm text-muted-foreground">Illustrative Checklist Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Readiness Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {readinessPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    plan.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-muted'
                  }`}>
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(plan.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Illustrative Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Illustrative checklist progress</span>
                  <span className="font-medium">{plan.progress}%</span>
                </div>
                <Progress value={plan.progress} aria-label={`${plan.name}: illustrative checklist progress, not certification or compliance`} className="h-2" />
              </div>

              {/* Planned Phase */}
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span>Planned phase: {plan.plannedPhase}</span>
              </div>

              {/* Illustrative Checklist */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Illustrative checklist tasks</div>
                <p className="text-xs text-muted-foreground">Sample task statuses only; not verified controls or audit evidence.</p>
                <div className="space-y-1">
                  {plan.requirements.map((req) => (
                    <div key={req.name} className="flex items-center gap-2 text-sm">
                      {getRequirementIcon(req.status)}
                      <span className={req.status === 'done' ? 'text-muted-foreground line-through' : ''}>
                        {req.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Potential Benefits */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Potential benefits, subject to evidence and review</div>
                <div className="flex flex-wrap gap-2">
                  {plan.benefits.map((benefit) => (
                    <Badge key={benefit} variant="outline" className="text-xs">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Roadmap Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Planned Assurance & Privacy Roadmap
          </CardTitle>
          <CardDescription>
            Proposed preparation phases, not completed achievements or committed dates.
            Certifications and reports require independent assessment; UK GDPR remains an ongoing legal obligation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-4">
              {roadmapMilestones.map((milestone, index) => (
                <div key={index} className="relative flex gap-4 pl-10">
                  <div className="absolute left-2 w-5 h-5 rounded-full border-2 bg-background border-border" />
                  <div className="flex-1 p-3 border rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium">{milestone.milestone}</div>
                        <div className="text-sm text-muted-foreground">Planned phase: {milestone.phase}</div>
                      </div>
                      {getStatusBadge(milestone.status as ReadinessPlan['status'])}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
