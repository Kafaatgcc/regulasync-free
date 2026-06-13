import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  Calendar,
  Target,
  Award,
  FileCheck,
  Lock
} from "lucide-react";

interface Certification {
  id: string;
  name: string;
  shortName: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned' | 'not-started';
  progress: number;
  targetDate: string;
  requirements: { name: string; status: 'done' | 'in-progress' | 'pending' }[];
  benefits: string[];
  priority: 'high' | 'medium' | 'low';
}

const certifications: Certification[] = [
  {
    id: 'cyber-essentials',
    name: 'Cyber Essentials',
    shortName: 'CE',
    description: 'UK Government-backed scheme for baseline cyber security',
    status: 'completed',
    progress: 100,
    targetDate: 'Q1 2026',
    requirements: [
      { name: 'Firewall Configuration', status: 'done' },
      { name: 'Secure Configuration', status: 'done' },
      { name: 'Access Control', status: 'done' },
      { name: 'Malware Protection', status: 'done' },
      { name: 'Patch Management', status: 'done' },
    ],
    benefits: ['Required for UK government contracts', 'Demonstrates baseline security', 'Insurance premium reduction'],
    priority: 'high'
  },
  {
    id: 'cyber-essentials-plus',
    name: 'Cyber Essentials Plus',
    shortName: 'CE+',
    description: 'Enhanced certification with independent verification',
    status: 'in-progress',
    progress: 75,
    targetDate: 'Q2 2026',
    requirements: [
      { name: 'All CE Requirements', status: 'done' },
      { name: 'Vulnerability Assessment', status: 'done' },
      { name: 'Penetration Testing', status: 'in-progress' },
      { name: 'Independent Audit', status: 'pending' },
    ],
    benefits: ['Higher assurance level', 'Required for sensitive data handling', 'Competitive advantage'],
    priority: 'high'
  },
  {
    id: 'iso-27001',
    name: 'ISO 27001:2022',
    shortName: 'ISO',
    description: 'International standard for information security management',
    status: 'in-progress',
    progress: 45,
    targetDate: 'Q4 2026',
    requirements: [
      { name: 'ISMS Documentation', status: 'done' },
      { name: 'Risk Assessment', status: 'done' },
      { name: 'Control Implementation', status: 'in-progress' },
      { name: 'Internal Audit', status: 'pending' },
      { name: 'Management Review', status: 'pending' },
      { name: 'External Certification Audit', status: 'pending' },
    ],
    benefits: ['Global recognition', 'Enterprise customer requirement', 'Systematic security approach'],
    priority: 'high'
  },
  {
    id: 'soc2-type1',
    name: 'SOC 2 Type I',
    shortName: 'SOC2',
    description: 'Service organization controls for security, availability, and confidentiality',
    status: 'planned',
    progress: 15,
    targetDate: 'Q1 2027',
    requirements: [
      { name: 'Trust Service Criteria Mapping', status: 'in-progress' },
      { name: 'Control Design Documentation', status: 'pending' },
      { name: 'Evidence Collection', status: 'pending' },
      { name: 'Readiness Assessment', status: 'pending' },
      { name: 'Type I Audit', status: 'pending' },
    ],
    benefits: ['US market requirement', 'Enterprise SaaS standard', 'Investor confidence'],
    priority: 'medium'
  },
  {
    id: 'gdpr-certification',
    name: 'UK GDPR Certification',
    shortName: 'GDPR',
    description: 'ICO-approved certification for data protection compliance',
    status: 'in-progress',
    progress: 60,
    targetDate: 'Q3 2026',
    requirements: [
      { name: 'Data Processing Records', status: 'done' },
      { name: 'Privacy Impact Assessments', status: 'done' },
      { name: 'Data Subject Rights Procedures', status: 'done' },
      { name: 'Breach Notification Process', status: 'in-progress' },
      { name: 'DPO Appointment', status: 'pending' },
    ],
    benefits: ['Regulatory compliance evidence', 'Customer trust', 'Reduced ICO scrutiny'],
    priority: 'high'
  }
];

const roadmapMilestones = [
  { quarter: 'Q1 2026', milestone: 'Cyber Essentials Certified', status: 'completed' },
  { quarter: 'Q2 2026', milestone: 'Cyber Essentials Plus Certified', status: 'in-progress' },
  { quarter: 'Q3 2026', milestone: 'UK GDPR Certification', status: 'planned' },
  { quarter: 'Q4 2026', milestone: 'ISO 27001 Certified', status: 'planned' },
  { quarter: 'Q1 2027', milestone: 'SOC 2 Type I Report', status: 'planned' },
  { quarter: 'Q2 2027', milestone: 'SOC 2 Type II Report', status: 'planned' },
];

export default function CertificationReadiness() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'planned':
        return <Badge className="bg-amber-500">Planned</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getRequirementIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const completedCount = certifications.filter(c => c.status === 'completed').length;
  const inProgressCount = certifications.filter(c => c.status === 'in-progress').length;
  const overallProgress = Math.round(certifications.reduce((acc, c) => acc + c.progress, 0) / certifications.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Certification Readiness</h1>
        <p className="text-muted-foreground mt-1">
          Track progress towards security and compliance certifications
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
                <div className="text-2xl font-bold">{completedCount}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{inProgressCount}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
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
                <div className="text-2xl font-bold">{certifications.length}</div>
                <div className="text-sm text-muted-foreground">Total Planned</div>
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
                <div className="text-2xl font-bold">{overallProgress}%</div>
                <div className="text-sm text-muted-foreground">Overall Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certification Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {certifications.map((cert) => (
          <Card key={cert.id} className={cert.status === 'completed' ? 'border-green-500/50' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    cert.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                    cert.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-muted'
                  }`}>
                    {cert.status === 'completed' ? (
                      <Award className="h-5 w-5 text-green-600" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{cert.name}</CardTitle>
                    <CardDescription>{cert.description}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(cert.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{cert.progress}%</span>
                </div>
                <Progress value={cert.progress} className="h-2" />
              </div>

              {/* Target Date */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Target: {cert.targetDate}</span>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Requirements</div>
                <div className="space-y-1">
                  {cert.requirements.map((req) => (
                    <div key={req.name} className="flex items-center gap-2 text-sm">
                      {getRequirementIcon(req.status)}
                      <span className={req.status === 'done' ? 'text-muted-foreground line-through' : ''}>
                        {req.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Business Benefits</div>
                <div className="flex flex-wrap gap-2">
                  {cert.benefits.map((benefit) => (
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
            Certification Roadmap
          </CardTitle>
          <CardDescription>
            Timeline for achieving key security and compliance certifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-4">
              {roadmapMilestones.map((milestone, index) => (
                <div key={index} className="relative flex gap-4 pl-10">
                  <div className={`absolute left-2 w-5 h-5 rounded-full border-2 ${
                    milestone.status === 'completed' ? 'bg-green-500 border-green-500' :
                    milestone.status === 'in-progress' ? 'bg-blue-500 border-blue-500' :
                    'bg-background border-border'
                  }`}>
                    {milestone.status === 'completed' && (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{milestone.milestone}</span>
                      <Badge variant="outline">{milestone.quarter}</Badge>
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
