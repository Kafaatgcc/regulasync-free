import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FileText, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ComplianceData {
  overallScore: number;
  departments: Array<{
    name: string;
    score: number;
    status: string;
    issues: number;
    lastAssessment: string;
  }>;
  alerts: Array<{
    title: string;
    description: string;
    severity: string;
    department: string;
    dueDate: string;
  }>;
  deadlines: Array<{
    title: string;
    date: string;
    type: string;
  }>;
}

interface CompliancePDFExportProps {
  data: ComplianceData;
}

export default function CompliancePDFExport({ data }: CompliancePDFExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeAlerts, setIncludeAlerts] = useState(true);
  const [includeDeadlines, setIncludeDeadlines] = useState(true);
  const [includeDepartments, setIncludeDepartments] = useState(true);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create PDF content
    const pdfContent = generatePDFContent();
    
    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window for printing/saving as PDF
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    
    setIsGenerating(false);
    setIsOpen(false);
    toast.success('PDF Report Generated', {
      description: 'Your compliance analysis report is ready for download.'
    });
  };

  const generatePDFContent = () => {
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <title>RegulaSync Compliance Analysis Report</title>
  <style>
    @page { margin: 2cm; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      color: #1a2b4a;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #c9a227;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #1a2b4a;
    }
    .logo span { color: #c9a227; }
    .report-date {
      color: #666;
      font-size: 14px;
    }
    h1 {
      color: #1a2b4a;
      font-size: 24px;
      margin-bottom: 10px;
    }
    h2 {
      color: #1a2b4a;
      font-size: 18px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
      margin-top: 30px;
    }
    .summary-box {
      background: linear-gradient(135deg, #1a2b4a 0%, #2a3b5a 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin: 20px 0;
    }
    .summary-box h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .summary-box .score {
      font-size: 48px;
      font-weight: bold;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 20px;
    }
    .summary-item {
      text-align: center;
      padding: 15px;
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
    }
    .summary-item .value {
      font-size: 24px;
      font-weight: bold;
    }
    .summary-item .label {
      font-size: 12px;
      opacity: 0.8;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f9fafb;
      font-weight: 600;
      color: #1a2b4a;
    }
    .status-compliant { color: #16a34a; font-weight: 600; }
    .status-partial { color: #d97706; font-weight: 600; }
    .status-non-compliant { color: #dc2626; font-weight: 600; }
    .severity-high { background: #fef2f2; color: #dc2626; padding: 4px 8px; border-radius: 4px; }
    .severity-medium { background: #fffbeb; color: #d97706; padding: 4px 8px; border-radius: 4px; }
    .severity-low { background: #eff6ff; color: #2563eb; padding: 4px 8px; border-radius: 4px; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .progress-bar {
      width: 100px;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      display: inline-block;
      vertical-align: middle;
      margin-right: 8px;
    }
    .progress-fill {
      height: 100%;
      background: #1a2b4a;
      border-radius: 4px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Regula<span>Sync</span></div>
    <div class="report-date">Generated: ${currentDate}</div>
  </div>

  <h1>Compliance Analysis Report</h1>
  <p>Comprehensive compliance assessment across all organizational departments.</p>

  <div class="summary-box">
    <h3>Overall Compliance Score</h3>
    <div class="score">${data.overallScore}%</div>
    <div class="summary-grid">
      <div class="summary-item">
        <div class="value">${data.departments.filter(d => d.status === 'compliant').length}/${data.departments.length}</div>
        <div class="label">Compliant Departments</div>
      </div>
      <div class="summary-item">
        <div class="value">${data.departments.reduce((acc, d) => acc + d.issues, 0)}</div>
        <div class="label">Open Issues</div>
      </div>
      <div class="summary-item">
        <div class="value">${data.alerts.filter(a => a.severity === 'high').length}</div>
        <div class="label">Critical Alerts</div>
      </div>
    </div>
  </div>

  ${includeDepartments ? `
  <h2>Department Compliance Status</h2>
  <table>
    <thead>
      <tr>
        <th>Department</th>
        <th>Score</th>
        <th>Status</th>
        <th>Open Issues</th>
        <th>Last Assessment</th>
      </tr>
    </thead>
    <tbody>
      ${data.departments.map(dept => `
        <tr>
          <td>${dept.name}</td>
          <td>
            <div class="progress-bar"><div class="progress-fill" style="width: ${dept.score}%"></div></div>
            ${dept.score}%
          </td>
          <td class="status-${dept.status}">${dept.status.charAt(0).toUpperCase() + dept.status.slice(1)}</td>
          <td>${dept.issues}</td>
          <td>${dept.lastAssessment}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  ${includeAlerts ? `
  <h2>Active Compliance Alerts</h2>
  <table>
    <thead>
      <tr>
        <th>Alert</th>
        <th>Severity</th>
        <th>Department</th>
        <th>Due Date</th>
      </tr>
    </thead>
    <tbody>
      ${data.alerts.map(alert => `
        <tr>
          <td>
            <strong>${alert.title}</strong><br>
            <small style="color: #666;">${alert.description}</small>
          </td>
          <td><span class="severity-${alert.severity}">${alert.severity.toUpperCase()}</span></td>
          <td>${alert.department}</td>
          <td>${alert.dueDate}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  ${includeDeadlines ? `
  <h2>Upcoming Compliance Deadlines</h2>
  <table>
    <thead>
      <tr>
        <th>Deadline</th>
        <th>Date</th>
        <th>Type</th>
      </tr>
    </thead>
    <tbody>
      ${data.deadlines.map(deadline => `
        <tr>
          <td>${deadline.title}</td>
          <td>${deadline.date}</td>
          <td>${deadline.type.charAt(0).toUpperCase() + deadline.type.slice(1)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <div class="footer">
    <p>This report was generated by RegulaSync - AI-Powered Governance Automation</p>
    <p>© ${new Date().getFullYear()} RegulaSync. All rights reserved.</p>
    <p style="margin-top: 10px; font-size: 10px;">
      This document is confidential and intended for internal use only.
    </p>
  </div>
</body>
</html>
    `;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Export PDF Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Compliance Report</DialogTitle>
          <DialogDescription>
            Generate a comprehensive PDF report of your compliance analysis.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Include in Report:</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="departments" 
                checked={includeDepartments}
                onCheckedChange={(checked) => setIncludeDepartments(checked as boolean)}
              />
              <Label htmlFor="departments" className="text-sm">Department Compliance Status</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="alerts" 
                checked={includeAlerts}
                onCheckedChange={(checked) => setIncludeAlerts(checked as boolean)}
              />
              <Label htmlFor="alerts" className="text-sm">Active Alerts & Issues</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="deadlines" 
                checked={includeDeadlines}
                onCheckedChange={(checked) => setIncludeDeadlines(checked as boolean)}
              />
              <Label htmlFor="deadlines" className="text-sm">Upcoming Deadlines</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="charts" 
                checked={includeCharts}
                onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
              />
              <Label htmlFor="charts" className="text-sm">Summary Statistics</Label>
            </div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              The report will open in a new window. Use your browser's print function (Ctrl+P / Cmd+P) to save as PDF.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
