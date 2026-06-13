import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
// Toast notification handled inline

interface ExportDataButtonProps {
  dataType: 'compliance' | 'policies' | 'delegations' | 'audit' | 'reports';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

// Demo data for exports
const demoComplianceData = {
  summary: {
    overallScore: 91,
    compliantDepartments: 4,
    totalDepartments: 7,
    openIssues: 28,
    criticalAlerts: 1,
    generatedAt: new Date().toISOString()
  },
  departments: [
    { name: 'Finance', score: 96, status: 'Compliant', openIssues: 2, lastAssessment: '2024-12-15' },
    { name: 'Operations', score: 89, status: 'Partial', openIssues: 5, lastAssessment: '2024-12-10' },
    { name: 'IT', score: 92, status: 'Compliant', openIssues: 3, lastAssessment: '2024-12-18' },
    { name: 'HR', score: 87, status: 'Partial', openIssues: 6, lastAssessment: '2024-12-12' },
    { name: 'Legal', score: 98, status: 'Compliant', openIssues: 1, lastAssessment: '2024-12-20' },
    { name: 'Marketing', score: 84, status: 'Partial', openIssues: 7, lastAssessment: '2024-12-08' },
    { name: 'Sales', score: 91, status: 'Compliant', openIssues: 4, lastAssessment: '2024-12-14' },
  ],
  upcomingDeadlines: [
    { title: 'Q4 Financial Compliance Report', date: '2026-01-15', type: 'report' },
    { title: 'Annual Risk Assessment', date: '2026-01-31', type: 'assessment' },
    { title: 'FCA Regulatory Filing', date: '2026-02-15', type: 'filing' },
    { title: 'Security Audit', date: '2026-03-01', type: 'audit' },
    { title: 'Data Protection Review', date: '2026-03-15', type: 'review' },
  ]
};

const demoPoliciesData = [
  { id: 'POL-001', name: 'Anti-Money Laundering Policy', category: 'Compliance', status: 'Active', priority: 'Critical', owner: 'Compliance Team', complianceScore: 98, automated: true },
  { id: 'POL-002', name: 'Data Protection Policy', category: 'Privacy', status: 'Active', priority: 'High', owner: 'Legal Team', complianceScore: 95, automated: true },
  { id: 'POL-003', name: 'Information Security Policy', category: 'Security', status: 'Active', priority: 'Critical', owner: 'IT Security', complianceScore: 92, automated: true },
  { id: 'POL-004', name: 'Business Continuity Plan', category: 'Operations', status: 'Under Review', priority: 'High', owner: 'Operations', complianceScore: 88, automated: false },
  { id: 'POL-005', name: 'Vendor Management Policy', category: 'Procurement', status: 'Active', priority: 'Medium', owner: 'Procurement', complianceScore: 90, automated: false },
  { id: 'POL-006', name: 'Employee Code of Conduct', category: 'HR', status: 'Active', priority: 'Medium', owner: 'HR Team', complianceScore: 94, automated: false },
  { id: 'POL-007', name: 'Whistleblower Policy', category: 'Compliance', status: 'Under Review', priority: 'High', owner: 'Legal Team', complianceScore: 85, automated: false },
  { id: 'POL-008', name: 'Social Media Policy', category: 'Marketing', status: 'Active', priority: 'Low', owner: 'Marketing', complianceScore: 91, automated: true },
];

export default function ExportDataButton({ 
  dataType, 
  variant = 'outline',
  size = 'default'
}: ExportDataButtonProps) {
  const [isExporting, setIsExporting] = useState(false);


  const getDataForExport = () => {
    switch (dataType) {
      case 'compliance':
        return demoComplianceData;
      case 'policies':
        return demoPoliciesData;
      default:
        return demoComplianceData;
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      const data = getDataForExport();
      let csvContent = '';
      
      if (dataType === 'compliance') {
        // Summary section
        csvContent += 'COMPLIANCE SUMMARY REPORT\n';
        csvContent += `Generated At,${new Date().toISOString()}\n`;
        csvContent += `Overall Score,${(data as typeof demoComplianceData).summary.overallScore}%\n`;
        csvContent += `Compliant Departments,${(data as typeof demoComplianceData).summary.compliantDepartments}/${(data as typeof demoComplianceData).summary.totalDepartments}\n`;
        csvContent += `Open Issues,${(data as typeof demoComplianceData).summary.openIssues}\n`;
        csvContent += `Critical Alerts,${(data as typeof demoComplianceData).summary.criticalAlerts}\n\n`;
        
        // Department breakdown
        csvContent += 'DEPARTMENT COMPLIANCE BREAKDOWN\n';
        csvContent += 'Department,Score,Status,Open Issues,Last Assessment\n';
        (data as typeof demoComplianceData).departments.forEach(dept => {
          csvContent += `${dept.name},${dept.score}%,${dept.status},${dept.openIssues},${dept.lastAssessment}\n`;
        });
        
        csvContent += '\nUPCOMING DEADLINES\n';
        csvContent += 'Title,Date,Type\n';
        (data as typeof demoComplianceData).upcomingDeadlines.forEach(deadline => {
          csvContent += `${deadline.title},${deadline.date},${deadline.type}\n`;
        });
      } else if (dataType === 'policies') {
        csvContent += 'POLICY INVENTORY REPORT\n';
        csvContent += `Generated At,${new Date().toISOString()}\n\n`;
        csvContent += 'ID,Name,Category,Status,Priority,Owner,Compliance Score,Automated\n';
        (data as typeof demoPoliciesData).forEach(policy => {
          csvContent += `${policy.id},${policy.name},${policy.category},${policy.status},${policy.priority},${policy.owner},${policy.complianceScore}%,${policy.automated ? 'Yes' : 'No'}\n`;
        });
      }
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `regulasync_${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
      alert(`Export Complete: ${dataType.charAt(0).toUpperCase() + dataType.slice(1)} data exported to CSV successfully.`);
    }, 1000);
  };

  const exportToJSON = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      const data = getDataForExport();
      const jsonContent = JSON.stringify(data, null, 2);
      
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `regulasync_${dataType}_export_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
      alert(`Export Complete: ${dataType.charAt(0).toUpperCase() + dataType.slice(1)} data exported to JSON successfully.`);
    }, 1000);
  };

  const exportToPDF = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      // In a real implementation, this would generate a PDF
      // For demo, we'll show a toast indicating the feature
      setIsExporting(false);
      alert("PDF Export: PDF report generation initiated. The report will be available in your Reports section.");
    }, 1500);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileText className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Generate PDF Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
