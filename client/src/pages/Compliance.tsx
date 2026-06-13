import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from "recharts";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  Building2,
  FileWarning,
  Calendar,
  Eye
} from "lucide-react";
import ExportDataButton from "@/components/ExportDataButton";
import CompliancePDFExport from "@/components/CompliancePDFExport";

const departmentCompliance = [
  { name: "Finance", score: 96, status: "compliant", issues: 2, lastAssessment: "2024-12-15" },
  { name: "Operations", score: 89, status: "partial", issues: 5, lastAssessment: "2024-12-10" },
  { name: "IT", score: 92, status: "compliant", issues: 3, lastAssessment: "2024-12-18" },
  { name: "HR", score: 87, status: "partial", issues: 6, lastAssessment: "2024-12-12" },
  { name: "Legal", score: 98, status: "compliant", issues: 1, lastAssessment: "2024-12-20" },
  { name: "Marketing", score: 84, status: "partial", issues: 7, lastAssessment: "2024-12-08" },
  { name: "Sales", score: 91, status: "compliant", issues: 4, lastAssessment: "2024-12-14" },
];

const complianceAlerts = [
  {
    id: 1,
    title: "AML Policy Review Overdue",
    description: "Annual review deadline passed 5 days ago",
    severity: "high",
    department: "Compliance",
    dueDate: "2024-12-20",
    status: "overdue",
  },
  {
    id: 2,
    title: "GDPR Training Incomplete",
    description: "15 employees have not completed mandatory training",
    severity: "medium",
    department: "HR",
    dueDate: "2024-12-31",
    status: "at_risk",
  },
  {
    id: 3,
    title: "IT Security Audit Scheduled",
    description: "Quarterly security audit due next week",
    severity: "low",
    department: "IT",
    dueDate: "2025-01-05",
    status: "upcoming",
  },
  {
    id: 4,
    title: "Vendor Compliance Certificates",
    description: "3 vendor certificates expiring in 30 days",
    severity: "medium",
    department: "Procurement",
    dueDate: "2025-01-25",
    status: "at_risk",
  },
];

const upcomingDeadlines = [
  { id: 1, title: "Q4 Financial Compliance Report", date: "2026-01-15", type: "report" },
  { id: 2, title: "Annual Risk Assessment", date: "2026-01-31", type: "assessment" },
  { id: 3, title: "FCA Regulatory Filing", date: "2026-02-15", type: "filing" },
  { id: 4, title: "Security Audit", date: "2026-03-01", type: "audit" },
  { id: 5, title: "Data Protection Review", date: "2026-03-15", type: "review" },
];

const complianceChartData = [
  { department: "Finance", score: 96, fill: "#1e3a5f" },
  { department: "Legal", score: 98, fill: "#1e3a5f" },
  { department: "IT", score: 92, fill: "#1e3a5f" },
  { department: "Sales", score: 91, fill: "#b87333" },
  { department: "Operations", score: 89, fill: "#b87333" },
  { department: "HR", score: 87, fill: "#b87333" },
  { department: "Marketing", score: 84, fill: "#8b9dc3" },
];

const chartConfig = {
  score: {
    label: "Compliance Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const severityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  high: { label: "High", color: "text-red-600", bgColor: "bg-red-50" },
  medium: { label: "Medium", color: "text-amber-600", bgColor: "bg-amber-50" },
  low: { label: "Low", color: "text-blue-600", bgColor: "bg-blue-50" },
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  compliant: { label: "Compliant", variant: "default" },
  partial: { label: "Partial", variant: "secondary" },
  non_compliant: { label: "Non-Compliant", variant: "destructive" },
};

export default function Compliance() {
  const overallScore = Math.round(departmentCompliance.reduce((acc, d) => acc + d.score, 0) / departmentCompliance.length);
  const compliantDepts = departmentCompliance.filter(d => d.status === "compliant").length;
  const totalIssues = departmentCompliance.reduce((acc, d) => acc + d.issues, 0);
  const criticalAlerts = complianceAlerts.filter(a => a.severity === "high").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Compliance Monitoring
          </h1>
          <p className="text-muted-foreground">Track compliance status across your organization</p>
        </div>
        <div className="flex gap-2">
          <ExportDataButton dataType="compliance" />
          <CompliancePDFExport 
            data={{
              overallScore,
              departments: departmentCompliance,
              alerts: complianceAlerts,
              deadlines: upcomingDeadlines
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-3xl font-bold">{overallScore}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+3% this month</span>
                </div>
              </div>
              <div className="h-16 w-16">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" data={[{ value: overallScore }]}>
                    <RadialBar dataKey="value" fill="#1e3a5f" background={{ fill: '#e5e7eb' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliant Depts</p>
                <p className="text-2xl font-bold text-green-600">{compliantDepts}/{departmentCompliance.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Issues</p>
                <p className="text-2xl font-bold text-amber-600">{totalIssues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{criticalAlerts}</p>
              </div>
              <FileWarning className="h-8 w-8 text-red-600/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Department Compliance Scores</CardTitle>
            <CardDescription>Compliance performance by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={complianceChartData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="department" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="text-sm font-medium">{deadline.title}</p>
                    <p className="text-xs text-muted-foreground">{deadline.date}</p>
                  </div>
                  <Badge variant="outline">{deadline.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="departments">By Department</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Issues</TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Department Compliance Status</CardTitle>
              <CardDescription>Detailed compliance breakdown by department</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Open Issues</TableHead>
                    <TableHead>Last Assessment</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentCompliance.map((dept) => (
                    <TableRow key={dept.name}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{dept.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={dept.score} className="w-20 h-2" />
                          <span className="font-semibold">{dept.score}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[dept.status].variant}>
                          {statusConfig[dept.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={dept.issues > 5 ? "text-amber-600 font-medium" : ""}>
                          {dept.issues}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {dept.lastAssessment}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Alerts</CardTitle>
              <CardDescription>Issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${severityConfig[alert.severity].bgColor}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${severityConfig[alert.severity].color}`} />
                        <div>
                          <h4 className="font-semibold">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{alert.department}</Badge>
                            <span className="text-xs text-muted-foreground">Due: {alert.dueDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={alert.status === "overdue" ? "destructive" : "secondary"}>
                          {alert.status.replace("_", " ")}
                        </Badge>
                        <Button size="sm" variant="outline">Resolve</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
