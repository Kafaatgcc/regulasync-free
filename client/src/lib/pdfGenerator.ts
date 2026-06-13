// PDF Generation utility for RegulaSync compliance reports
// Uses jsPDF for client-side PDF generation

export interface ComplianceReportData {
  title: string;
  generatedDate: string;
  period: string;
  companyName: string;
  overallScore: number;
  departments: Array<{
    name: string;
    score: number;
    risk: string;
  }>;
  policies: Array<{
    name: string;
    status: string;
    compliance: number;
    owner: string;
  }>;
  recentActivities: Array<{
    action: string;
    item: string;
    user: string;
    date: string;
  }>;
  recommendations: Array<{
    priority: string;
    title: string;
    description: string;
  }>;
}

export const generateCompliancePDF = async (data: ComplianceReportData): Promise<Blob> => {
  // Dynamic import of jsPDF
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Helper functions
  const addText = (text: string, x: number, y: number, options?: { fontSize?: number; fontStyle?: string; color?: number[] }) => {
    if (options?.fontSize) doc.setFontSize(options.fontSize);
    if (options?.fontStyle) doc.setFont('helvetica', options.fontStyle);
    if (options?.color) doc.setTextColor(options.color[0], options.color[1], options.color[2]);
    doc.text(text, x, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
  };

  const addLine = (y: number) => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
  };

  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Header with logo placeholder
  doc.setFillColor(30, 58, 95); // Navy
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  addText('RegulaSync', margin, 15, { fontSize: 20, fontStyle: 'bold', color: [255, 255, 255] });
  addText('AI-Powered Governance Automation', margin, 23, { fontSize: 10, color: [200, 200, 200] });
  
  // Report title
  yPos = 50;
  addText(data.title, margin, yPos, { fontSize: 18, fontStyle: 'bold' });
  yPos += 10;
  addText(`Generated: ${data.generatedDate}`, margin, yPos, { fontSize: 10, color: [100, 100, 100] });
  addText(`Period: ${data.period}`, pageWidth - margin - 50, yPos, { fontSize: 10, color: [100, 100, 100] });
  yPos += 5;
  addLine(yPos);
  yPos += 15;

  // Executive Summary
  addText('Executive Summary', margin, yPos, { fontSize: 14, fontStyle: 'bold' });
  yPos += 10;
  
  // Overall Compliance Score Box
  doc.setFillColor(240, 253, 244); // Light green
  doc.roundedRect(margin, yPos, 50, 25, 3, 3, 'F');
  addText('Overall Score', margin + 5, yPos + 8, { fontSize: 8, color: [100, 100, 100] });
  addText(`${data.overallScore}%`, margin + 5, yPos + 20, { fontSize: 16, fontStyle: 'bold', color: [22, 163, 74] });
  
  // Company info
  addText(`Organization: ${data.companyName}`, margin + 60, yPos + 8, { fontSize: 10 });
  addText(`Report Type: Compliance Summary`, margin + 60, yPos + 16, { fontSize: 10 });
  yPos += 35;

  // Department Compliance
  checkPageBreak(60);
  addText('Department Compliance Scores', margin, yPos, { fontSize: 14, fontStyle: 'bold' });
  yPos += 10;
  
  data.departments.forEach((dept) => {
    checkPageBreak(15);
    const barWidth = 80;
    const barHeight = 6;
    const barX = margin + 50;
    
    addText(dept.name, margin, yPos + 4, { fontSize: 10 });
    
    // Background bar
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(barX, yPos, barWidth, barHeight, 2, 2, 'F');
    
    // Score bar
    const scoreColor = dept.score >= 90 ? [22, 163, 74] : dept.score >= 80 ? [234, 179, 8] : [239, 68, 68];
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.roundedRect(barX, yPos, (dept.score / 100) * barWidth, barHeight, 2, 2, 'F');
    
    addText(`${dept.score}%`, barX + barWidth + 5, yPos + 5, { fontSize: 10, fontStyle: 'bold' });
    
    // Risk badge
    const riskColor = dept.risk === 'low' ? [22, 163, 74] : dept.risk === 'medium' ? [234, 179, 8] : [239, 68, 68];
    addText(dept.risk.toUpperCase(), pageWidth - margin - 20, yPos + 5, { fontSize: 8, color: riskColor });
    
    yPos += 12;
  });
  yPos += 10;

  // Policy Status
  checkPageBreak(80);
  addLine(yPos);
  yPos += 10;
  addText('Policy Status Overview', margin, yPos, { fontSize: 14, fontStyle: 'bold' });
  yPos += 10;
  
  // Table header
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  addText('Policy Name', margin + 2, yPos + 6, { fontSize: 9, fontStyle: 'bold' });
  addText('Status', margin + 70, yPos + 6, { fontSize: 9, fontStyle: 'bold' });
  addText('Compliance', margin + 100, yPos + 6, { fontSize: 9, fontStyle: 'bold' });
  addText('Owner', margin + 130, yPos + 6, { fontSize: 9, fontStyle: 'bold' });
  yPos += 10;
  
  data.policies.slice(0, 6).forEach((policy) => {
    checkPageBreak(10);
    addText(policy.name.substring(0, 35), margin + 2, yPos + 5, { fontSize: 8 });
    
    const statusColor = policy.status === 'Active' ? [22, 163, 74] : policy.status === 'Draft' ? [100, 100, 100] : [234, 179, 8];
    addText(policy.status, margin + 70, yPos + 5, { fontSize: 8, color: statusColor });
    
    addText(`${policy.compliance}%`, margin + 100, yPos + 5, { fontSize: 8 });
    addText(policy.owner.substring(0, 15), margin + 130, yPos + 5, { fontSize: 8 });
    yPos += 8;
  });
  yPos += 10;

  // AI Recommendations
  checkPageBreak(60);
  addLine(yPos);
  yPos += 10;
  addText('AI Recommendations', margin, yPos, { fontSize: 14, fontStyle: 'bold' });
  yPos += 10;
  
  data.recommendations.forEach((rec, index) => {
    checkPageBreak(25);
    const priorityColor = rec.priority === 'high' ? [239, 68, 68] : rec.priority === 'medium' ? [234, 179, 8] : [22, 163, 74];
    
    doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
    doc.circle(margin + 3, yPos + 3, 3, 'F');
    
    addText(`${index + 1}. ${rec.title}`, margin + 10, yPos + 5, { fontSize: 10, fontStyle: 'bold' });
    yPos += 8;
    
    const lines = doc.splitTextToSize(rec.description, pageWidth - 2 * margin - 10);
    lines.forEach((line: string) => {
      addText(line, margin + 10, yPos + 3, { fontSize: 9, color: [80, 80, 80] });
      yPos += 5;
    });
    yPos += 5;
  });

  // Recent Activity
  checkPageBreak(60);
  addLine(yPos);
  yPos += 10;
  addText('Recent Activity', margin, yPos, { fontSize: 14, fontStyle: 'bold' });
  yPos += 10;
  
  data.recentActivities.slice(0, 5).forEach((activity) => {
    checkPageBreak(12);
    addText(`• ${activity.action}: ${activity.item}`, margin, yPos + 4, { fontSize: 9 });
    addText(`${activity.user} - ${activity.date}`, pageWidth - margin - 50, yPos + 4, { fontSize: 8, color: [100, 100, 100] });
    yPos += 10;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerY = doc.internal.pageSize.getHeight() - 10;
    addLine(footerY - 5);
    addText(`RegulaSync Compliance Report - Confidential`, margin, footerY, { fontSize: 8, color: [150, 150, 150] });
    addText(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, footerY, { fontSize: 8, color: [150, 150, 150] });
  }

  return doc.output('blob');
};

// Sample data for demo
export const getSampleReportData = (): ComplianceReportData => ({
  title: 'Executive Compliance Summary',
  generatedDate: new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }),
  period: 'Q4 2024',
  companyName: 'Demo Organization Ltd',
  overallScore: 94,
  departments: [
    { name: 'Finance', score: 96, risk: 'low' },
    { name: 'Operations', score: 89, risk: 'medium' },
    { name: 'IT', score: 92, risk: 'low' },
    { name: 'HR', score: 87, risk: 'medium' },
    { name: 'Legal', score: 98, risk: 'low' },
  ],
  policies: [
    { name: 'Anti-Money Laundering (AML) Policy', status: 'Active', compliance: 98, owner: 'Sarah Chen' },
    { name: 'Data Protection & GDPR Policy', status: 'Active', compliance: 95, owner: 'Michael Brown' },
    { name: 'Information Security Policy', status: 'Active', compliance: 92, owner: 'James Wilson' },
    { name: 'Procurement & Vendor Management', status: 'Pending Review', compliance: 88, owner: 'Emma Davis' },
    { name: 'Employee Code of Conduct', status: 'Active', compliance: 96, owner: 'Lisa Johnson' },
    { name: 'Financial Reporting Standards', status: 'Draft', compliance: 0, owner: 'Robert Taylor' },
  ],
  recentActivities: [
    { action: 'Policy Approved', item: 'AML Compliance Policy v3.2', user: 'Sarah Chen', date: '2 hours ago' },
    { action: 'Delegation Created', item: 'Financial Authority - £50,000', user: 'James Wilson', date: '4 hours ago' },
    { action: 'Compliance Alert', item: 'Data Retention Policy Review Due', user: 'System', date: '6 hours ago' },
    { action: 'Audit Completed', item: 'Q4 Risk Assessment', user: 'Michael Brown', date: '1 day ago' },
    { action: 'Policy Updated', item: 'GDPR Data Processing Agreement', user: 'Emma Davis', date: '1 day ago' },
  ],
  recommendations: [
    { 
      priority: 'high', 
      title: 'Update AML Policy', 
      description: 'New FCA guidance requires policy update by Q1 2025. Review sections 3.2 and 4.1 for compliance with updated anti-money laundering requirements.' 
    },
    { 
      priority: 'medium', 
      title: 'Review Delegation Limits', 
      description: '3 delegations expiring in the next 30 days. Schedule review meetings with delegation holders to renew or update authority limits.' 
    },
    { 
      priority: 'medium', 
      title: 'Compliance Training', 
      description: '15 employees due for annual compliance training. Send reminders and schedule training sessions before end of quarter.' 
    },
  ],
});
