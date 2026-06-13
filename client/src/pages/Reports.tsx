import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { generateCompliancePDF, getSampleReportData } from "@/lib/pdfGenerator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  BarChart3,
  PieChart,
  TrendingUp,
  FileSpreadsheet,
  FilePieChart,
  Printer,
  Mail,
  Plus,
  Play,
  Pause,
  Settings
} from "lucide-react";

const reportTemplates = [
  {
    id: 1,
    name: "Executive Compliance Summary",
    description: "High-level overview of compliance status for board and executive review",
    category: "compliance",
    format: "pdf",
    lastGenerated: "2024-12-20",
    frequency: "monthly",
    icon: FilePieChart,
  },
  {
    id: 2,
    name: "Policy Audit Report",
    description: "Detailed audit trail of all policy changes and approvals",
    category: "audit",
    format: "pdf",
    lastGenerated: "2024-12-18",
    frequency: "weekly",
    icon: FileText,
  },
  {
    id: 3,
    name: "Delegation of Authority Matrix",
    description: "Complete matrix of all delegations, limits, and approval chains",
    category: "delegation",
    format: "xlsx",
    lastGenerated: "2024-12-15",
    frequency: "monthly",
    icon: FileSpreadsheet,
  },
  {
    id: 4,
    name: "Regulatory Change Impact Analysis",
    description: "Assessment of recent regulatory changes and their impact on policies",
    category: "regulatory",
    format: "pdf",
    lastGenerated: "2024-12-22",
    frequency: "weekly",
    icon: BarChart3,
  },
  {
    id: 5,
    name: "Training Compliance Report",
    description: "Employee training completion status and compliance metrics",
    category: "training",
    format: "pdf",
    lastGenerated: "2024-12-19",
    frequency: "monthly",
    icon: TrendingUp,
  },
  {
    id: 6,
    name: "Risk Assessment Summary",
    description: "Comprehensive risk assessment across all governance areas",
    category: "risk",
    format: "pdf",
    lastGenerated: "2024-12-21",
    frequency: "quarterly",
    icon: PieChart,
  },
];

const scheduledReports = [
  {
    id: 1,
    name: "Weekly Compliance Digest",
    recipients: ["cco@company.com", "board@company.com"],
    schedule: "Every Monday 9:00 AM",
    nextRun: "2024-12-30 09:00",
    status: "active",
  },
  {
    id: 2,
    name: "Monthly Board Report",
    recipients: ["board@company.com"],
    schedule: "1st of every month",
    nextRun: "2025-01-01 08:00",
    status: "active",
  },
  {
    id: 3,
    name: "Quarterly Regulatory Filing",
    recipients: ["compliance@company.com", "legal@company.com"],
    schedule: "End of quarter",
    nextRun: "2024-12-31 17:00",
    status: "active",
  },
];

const recentReports = [
  {
    id: 1,
    name: "Executive Compliance Summary - December 2024",
    generatedAt: "2024-12-20 14:30",
    generatedBy: "Sarah Chen",
    size: "2.4 MB",
    format: "pdf",
  },
  {
    id: 2,
    name: "Policy Audit Report - Week 51",
    generatedAt: "2024-12-18 09:15",
    generatedBy: "System (Scheduled)",
    size: "1.8 MB",
    format: "pdf",
  },
  {
    id: 3,
    name: "DoA Matrix Export - Q4 2024",
    generatedAt: "2024-12-15 16:45",
    generatedBy: "Michael Brown",
    size: "856 KB",
    format: "xlsx",
  },
  {
    id: 4,
    name: "Training Compliance - November 2024",
    generatedAt: "2024-12-01 10:00",
    generatedBy: "System (Scheduled)",
    size: "1.2 MB",
    format: "pdf",
  },
];

const categoryConfig: Record<string, { label: string; color: string }> = {
  compliance: { label: "Compliance", color: "bg-blue-100 text-blue-700" },
  audit: { label: "Audit", color: "bg-purple-100 text-purple-700" },
  delegation: { label: "Delegation", color: "bg-green-100 text-green-700" },
  regulatory: { label: "Regulatory", color: "bg-amber-100 text-amber-700" },
  training: { label: "Training", color: "bg-pink-100 text-pink-700" },
  risk: { label: "Risk", color: "bg-red-100 text-red-700" },
};

export default function Reports() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [generatingReport, setGeneratingReport] = useState<number | null>(null);
  const [customReportOpen, setCustomReportOpen] = useState(false);

  // Fetch live board data from DB for report generation
  const { data: boardData } = trpc.boardReport.getData.useQuery();
  const [customReportConfig, setCustomReportConfig] = useState({
    name: "",
    sections: [] as string[],
    dateRange: "last_month",
    format: "pdf"
  });

  const filteredTemplates = reportTemplates.filter(
    template => selectedCategory === "all" || template.category === selectedCategory
  );

  const handleGenerateReport = async (reportId: number) => {
    setGeneratingReport(reportId);
    
    try {
      // Use live DB data for report id=1 (Executive Compliance Summary), fallback to sample
      let reportData = getSampleReportData();
      if (reportId === 1 && boardData) {
        reportData = {
          title: 'Executive Compliance Summary',
          generatedDate: boardData.generatedDate,
          period: boardData.period,
          companyName: 'Your Organisation',
          overallScore: boardData.overallScore,
          departments: boardData.departments,
          policies: boardData.policies.map((p: any) => ({
            name: p.name,
            status: p.status,
            compliance: p.compliance,
            owner: p.owner,
          })),
          recentActivities: boardData.recentActivities,
          recommendations: boardData.recommendations,
        };
      }
      const pdfBlob = await generateCompliancePDF(reportData);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RegulaSync_Compliance_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">Generate and schedule compliance reports</p>
        </div>
        <Button onClick={() => setCustomReportOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Report Templates</p>
                <p className="text-2xl font-bold">{reportTemplates.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-green-600">{scheduledReports.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Generated This Month</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Generation Time</p>
                <p className="text-2xl font-bold">12s</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Report Templates</CardTitle>
                  <CardDescription>Pre-configured report templates for common compliance needs</CardDescription>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => {
                  const Icon = template.icon;
                  const isGenerating = generatingReport === template.id;
                  return (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                            <div className="flex items-center gap-2 mt-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryConfig[template.category]?.color}`}>
                                {categoryConfig[template.category]?.label}
                              </span>
                              <Badge variant="outline" className="text-xs uppercase">{template.format}</Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>Last: {template.lastGenerated}</span>
                              <span>•</span>
                              <span className="capitalize">{template.frequency}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleGenerateReport(template.id)}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <>
                                <Clock className="h-4 w-4 mr-1 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                Generate
                              </>
                            )}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Automated report generation and distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        report.status === "active" ? "bg-green-100" : "bg-gray-100"
                      }`}>
                        <Calendar className={`h-5 w-5 ${
                          report.status === "active" ? "text-green-600" : "text-gray-600"
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{report.name}</h4>
                        <p className="text-sm text-muted-foreground">{report.schedule}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{report.recipients.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Next Run</p>
                        <p className="text-sm font-medium">{report.nextRun}</p>
                      </div>
                      <Badge variant={report.status === "active" ? "default" : "secondary"}>
                        {report.status}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        {report.status === "active" ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Tab */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Previously generated reports available for download</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span>{report.generatedAt}</span>
                          <span>•</span>
                          <span>{report.generatedBy}</span>
                          <span>•</span>
                          <span>{report.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="uppercase">{report.format}</Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Custom Report Dialog */}
      <Dialog open={customReportOpen} onOpenChange={setCustomReportOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Custom Report</DialogTitle>
            <DialogDescription>
              Configure your custom compliance report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                placeholder="Enter report name..."
                value={customReportConfig.name}
                onChange={(e) => setCustomReportConfig({...customReportConfig, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Include Sections</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "executive", label: "Executive Summary" },
                  { id: "compliance", label: "Compliance Status" },
                  { id: "policies", label: "Policy Overview" },
                  { id: "delegations", label: "Delegations" },
                  { id: "regulatory", label: "Regulatory Updates" },
                  { id: "risks", label: "Risk Assessment" },
                  { id: "audit", label: "Audit Trail" },
                  { id: "recommendations", label: "AI Recommendations" },
                ].map((section) => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={section.id}
                      checked={customReportConfig.sections.includes(section.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCustomReportConfig({
                            ...customReportConfig,
                            sections: [...customReportConfig.sections, section.id]
                          });
                        } else {
                          setCustomReportConfig({
                            ...customReportConfig,
                            sections: customReportConfig.sections.filter(s => s !== section.id)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={section.id} className="text-sm font-normal cursor-pointer">
                      {section.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select
                  value={customReportConfig.dateRange}
                  onValueChange={(value) => setCustomReportConfig({...customReportConfig, dateRange: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_week">Last Week</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="last_quarter">Last Quarter</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select
                  value={customReportConfig.format}
                  onValueChange={(value) => setCustomReportConfig({...customReportConfig, format: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomReportOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!customReportConfig.name) {
                toast.error("Please enter a report name");
                return;
              }
              if (customReportConfig.sections.length === 0) {
                toast.error("Please select at least one section");
                return;
              }
              toast.info("Generating custom report...");
              setCustomReportOpen(false);
              
              // Generate the PDF
              const reportData = getSampleReportData();
              const pdfBlob = await generateCompliancePDF(reportData);
              
              const url = URL.createObjectURL(pdfBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${customReportConfig.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              
              toast.success("Custom report generated successfully!");
              setCustomReportConfig({ name: "", sections: [], dateRange: "last_month", format: "pdf" });
            }}>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
