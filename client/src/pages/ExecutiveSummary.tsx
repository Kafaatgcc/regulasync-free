import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Shield, TrendingUp, AlertTriangle, CheckCircle2, Clock,
  FileText, Users, Scale, ArrowUpRight, ArrowDownRight,
  Calendar, Target, Zap, Download, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  color: string;
}

interface ComplianceArea {
  name: string;
  score: number;
  status: 'compliant' | 'at-risk' | 'non-compliant';
  trend: 'up' | 'down' | 'stable';
}

interface UpcomingDeadline {
  title: string;
  date: string;
  daysLeft: number;
  priority: 'critical' | 'high' | 'medium';
  type: string;
}

export default function ExecutiveSummary() {
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const metrics: MetricCard[] = [
    {
      title: 'Overall Compliance Score',
      value: '94%',
      change: 3.2,
      changeLabel: 'vs last month',
      icon: Shield,
      color: 'text-green-500'
    },
    {
      title: 'Active Policies',
      value: 127,
      change: 8,
      changeLabel: 'new this quarter',
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      title: 'Pending Reviews',
      value: 12,
      change: -5,
      changeLabel: 'vs last week',
      icon: Clock,
      color: 'text-amber-500'
    },
    {
      title: 'Risk Alerts',
      value: 3,
      change: -2,
      changeLabel: 'resolved today',
      icon: AlertTriangle,
      color: 'text-red-500'
    }
  ];

  const complianceAreas: ComplianceArea[] = [
    { name: 'Anti-Money Laundering (AML)', score: 96, status: 'compliant', trend: 'up' },
    { name: 'Data Protection (GDPR)', score: 92, status: 'compliant', trend: 'stable' },
    { name: 'Consumer Duty', score: 88, status: 'at-risk', trend: 'up' },
    { name: 'Operational Resilience', score: 94, status: 'compliant', trend: 'up' },
    { name: 'Financial Crime', score: 91, status: 'compliant', trend: 'stable' },
    { name: 'Market Conduct', score: 89, status: 'at-risk', trend: 'down' }
  ];

  const upcomingDeadlines: UpcomingDeadline[] = [
    { title: 'FCA Consumer Duty Annual Review', date: '2026-01-31', daysLeft: 30, priority: 'critical', type: 'Regulatory' },
    { title: 'Q4 AML Risk Assessment', date: '2026-01-15', daysLeft: 14, priority: 'high', type: 'Internal' },
    { title: 'Operational Resilience Testing', date: '2026-02-28', daysLeft: 58, priority: 'medium', type: 'Regulatory' },
    { title: 'Board Compliance Report', date: '2026-01-20', daysLeft: 19, priority: 'high', type: 'Governance' }
  ];

  const aiInsights = [
    {
      type: 'recommendation',
      title: 'Update SAR Filing Procedures',
      description: 'Recent FCA guidance suggests updating SAR filing timeline from 7 to 5 working days.',
      impact: 'High',
      effort: 'Low'
    },
    {
      type: 'risk',
      title: 'Consumer Duty Gap Identified',
      description: 'Product governance framework needs enhancement for vulnerable customer identification.',
      impact: 'Medium',
      effort: 'Medium'
    },
    {
      type: 'opportunity',
      title: 'Automation Opportunity',
      description: 'Transaction monitoring rules can be automated, reducing manual review by 40%.',
      impact: 'High',
      effort: 'High'
    }
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
      toast.success('Dashboard Refreshed', { description: 'All metrics updated with latest data' });
    }, 1500);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    toast.info('Generating Executive Report...', { description: 'Please wait while we prepare your PDF' });

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      // Header
      doc.setFillColor(26, 54, 93); // Navy color
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('RegulaSync', margin, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Executive Summary Report', margin, 35);

      // Report date
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, pageWidth - margin - 60, 35);

      yPos = 55;

      // Key Metrics Section
      doc.setTextColor(26, 54, 93);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Metrics Overview', margin, yPos);
      yPos += 10;

      // Draw metrics boxes
      const boxWidth = (pageWidth - margin * 2 - 15) / 4;
      const boxHeight = 35;
      
      metrics.forEach((metric, index) => {
        const xPos = margin + (index * (boxWidth + 5));
        
        // Box background
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(xPos, yPos, boxWidth, boxHeight, 3, 3, 'F');
        
        // Metric value
        doc.setTextColor(26, 54, 93);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(String(metric.value), xPos + 5, yPos + 15);
        
        // Metric title
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const titleLines = doc.splitTextToSize(metric.title, boxWidth - 10);
        doc.text(titleLines, xPos + 5, yPos + 25);
        
        // Change indicator
        doc.setFontSize(7);
        doc.setTextColor(metric.change > 0 ? 34 : 220, metric.change > 0 ? 139 : 38, metric.change > 0 ? 34 : 38);
        doc.text(`${metric.change > 0 ? '+' : ''}${metric.change}${typeof metric.value === 'string' && metric.value.includes('%') ? '%' : ''} ${metric.changeLabel}`, xPos + 5, yPos + 32);
      });

      yPos += boxHeight + 15;

      // Compliance by Regulatory Area
      doc.setTextColor(26, 54, 93);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Compliance by Regulatory Area', margin, yPos);
      yPos += 10;

      // Table header
      doc.setFillColor(26, 54, 93);
      doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Regulatory Area', margin + 5, yPos + 6);
      doc.text('Score', pageWidth - margin - 55, yPos + 6);
      doc.text('Status', pageWidth - margin - 30, yPos + 6);
      yPos += 8;

      // Table rows
      complianceAreas.forEach((area, index) => {
        const rowColor = index % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
        doc.setFillColor(rowColor[0], rowColor[1], rowColor[2]);
        doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
        
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(area.name, margin + 5, yPos + 6);
        doc.text(`${area.score}%`, pageWidth - margin - 55, yPos + 6);
        
        // Status badge
        const statusColor = area.status === 'compliant' ? [34, 139, 34] : 
                           area.status === 'at-risk' ? [255, 165, 0] : [220, 38, 38];
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(area.status === 'compliant' ? 'Compliant' : area.status === 'at-risk' ? 'At Risk' : 'Non-Compliant', pageWidth - margin - 30, yPos + 6);
        
        yPos += 8;
      });

      yPos += 15;

      // Upcoming Deadlines
      doc.setTextColor(26, 54, 93);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Upcoming Deadlines', margin, yPos);
      yPos += 10;

      upcomingDeadlines.forEach((deadline) => {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 12, 2, 2, 'F');
        
        // Priority indicator
        const priorityColor = deadline.priority === 'critical' ? [220, 38, 38] :
                             deadline.priority === 'high' ? [255, 165, 0] : [59, 130, 246];
        doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
        doc.circle(margin + 6, yPos + 6, 2, 'F');
        
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(deadline.title, margin + 12, yPos + 7);
        
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text(`${deadline.type} • ${deadline.daysLeft} days left`, pageWidth - margin - 50, yPos + 7);
        
        yPos += 14;
      });

      yPos += 10;

      // AI Insights
      doc.setTextColor(26, 54, 93);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('AI-Powered Insights', margin, yPos);
      yPos += 10;

      aiInsights.forEach((insight) => {
        const insightColor = insight.type === 'recommendation' ? [34, 139, 34] :
                            insight.type === 'risk' ? [220, 38, 38] : [59, 130, 246];
        
        doc.setFillColor(insightColor[0], insightColor[1], insightColor[2]);
        doc.rect(margin, yPos, 3, 20, 'F');
        
        doc.setFillColor(248, 250, 252);
        doc.rect(margin + 3, yPos, pageWidth - margin * 2 - 3, 20, 'F');
        
        doc.setTextColor(26, 54, 93);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(insight.title, margin + 8, yPos + 7);
        
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(insight.description, pageWidth - margin * 2 - 20);
        doc.text(descLines[0], margin + 8, yPos + 14);
        
        doc.setTextColor(60, 60, 60);
        doc.text(`Impact: ${insight.impact} | Effort: ${insight.effort}`, margin + 8, yPos + 18);
        
        yPos += 24;
      });

      // Footer
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text('RegulaSync - AI-Powered Governance Automation', margin, footerY);
      doc.text('Confidential', pageWidth - margin - 25, footerY);
      doc.text('Page 1 of 1', pageWidth / 2 - 10, footerY);

      // Save the PDF
      const fileName = `RegulaSync_Executive_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('Report Downloaded', { 
        description: `${fileName} has been saved to your downloads folder` 
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Export Failed', { 
        description: 'Unable to generate PDF. Please try again.' 
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-lg"></div>)}
          </div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Executive Summary</h1>
          <p className="text-muted-foreground mt-1">
            Real-time compliance overview • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportPDF} disabled={isExporting} className="bg-navy hover:bg-navy/90">
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Generating...' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-3xl font-bold mt-1">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {metric.change > 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(metric.change)}{typeof metric.value === 'string' && metric.value.includes('%') ? '%' : ''}
                    </span>
                    <span className="text-xs text-muted-foreground">{metric.changeLabel}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-muted ${metric.color}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance by Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-navy" />
              Compliance by Regulatory Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceAreas.map((area, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{area.name}</span>
                      {area.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                      {area.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        area.status === 'compliant' ? 'default' :
                        area.status === 'at-risk' ? 'secondary' : 'destructive'
                      } className={
                        area.status === 'compliant' ? 'bg-green-100 text-green-700' :
                        area.status === 'at-risk' ? 'bg-amber-100 text-amber-700' : ''
                      }>
                        {area.status === 'compliant' ? 'Compliant' : 
                         area.status === 'at-risk' ? 'At Risk' : 'Non-Compliant'}
                      </Badge>
                      <span className="font-bold w-12 text-right">{area.score}%</span>
                    </div>
                  </div>
                  <Progress value={area.score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-copper" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`p-2 rounded-full ${
                    deadline.priority === 'critical' ? 'bg-red-100 text-red-600' :
                    deadline.priority === 'high' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{deadline.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{deadline.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {deadline.daysLeft} days left
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-copper" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'recommendation' ? 'border-l-green-500 bg-green-50 dark:bg-green-950/20' :
                insight.type === 'risk' ? 'border-l-red-500 bg-red-50 dark:bg-red-950/20' :
                'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {insight.type === 'recommendation' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  {insight.type === 'risk' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                  {insight.type === 'opportunity' && <Target className="w-4 h-4 text-blue-600" />}
                  <span className="font-semibold text-sm">{insight.title}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">Impact: {insight.impact}</Badge>
                  <Badge variant="outline" className="text-xs">Effort: {insight.effort}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Value Proposition Summary */}
      <Card className="bg-gradient-to-r from-navy to-navy/80 text-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold text-copper">85%</p>
              <p className="text-sm text-white/70 mt-1">Reduction in Compliance Time</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-copper">99.9%</p>
              <p className="text-sm text-white/70 mt-1">Audit Trail Accuracy</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-copper">60%</p>
              <p className="text-sm text-white/70 mt-1">Faster Policy Approvals</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-copper">24/7</p>
              <p className="text-sm text-white/70 mt-1">Automated Monitoring</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
