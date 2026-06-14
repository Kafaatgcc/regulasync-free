import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  TrendingUp, 
  Clock, 
  Users, 
  PoundSterling,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Download
} from "lucide-react";

export default function ROICalculator() {
  // Input parameters
  const [employees, setEmployees] = useState(100);
  const [policies, setPolicies] = useState(50);
  const [regulatoryUpdates, setRegulatoryUpdates] = useState(24);
  const [complianceStaff, setComplianceStaff] = useState(3);
  const [avgSalary, setAvgSalary] = useState(65000);
  const [currentFineRisk, setCurrentFineRisk] = useState(500000);

  // Calculations
  const calculations = useMemo(() => {
    // Current costs (manual process)
    const hoursPerPolicyReview = 8;
    const hoursPerRegulatoryUpdate = 16;
    const hoursPerAuditPrep = 40;
    const auditsPerYear = 4;
    
    const hourlyRate = avgSalary / 1920; // 1920 working hours per year
    
    const currentPolicyReviewCost = policies * hoursPerPolicyReview * hourlyRate * 2; // Review twice per year
    const currentRegulatoryUpdateCost = regulatoryUpdates * hoursPerRegulatoryUpdate * hourlyRate;
    const currentAuditPrepCost = auditsPerYear * hoursPerAuditPrep * hourlyRate * complianceStaff;
    const currentTotalManualCost = currentPolicyReviewCost + currentRegulatoryUpdateCost + currentAuditPrepCost;
    
    // Risk costs
    const fineRiskReduction = 0.75; // 75% reduction in fine risk
    const expectedFineReduction = currentFineRisk * fineRiskReduction;
    
    // With RegulaSync (automated)
    const automationEfficiency = 0.85; // 85% time reduction
    const automatedPolicyReviewCost = currentPolicyReviewCost * (1 - automationEfficiency);
    const automatedRegulatoryUpdateCost = currentRegulatoryUpdateCost * (1 - automationEfficiency);
    const automatedAuditPrepCost = currentAuditPrepCost * (1 - 0.90); // 90% reduction in audit prep
    const automatedTotalCost = automatedPolicyReviewCost + automatedRegulatoryUpdateCost + automatedAuditPrepCost;
    
    // RegulaSync subscription cost — Core £90/mo (£1,080/yr), Professional £175/mo (£2,100/yr), Enterprise £350/mo (£4,200/yr)
    const regulaSyncAnnualCost = employees <= 5 ? 1080 : employees <= 25 ? 2100 : 4200;
    
    // Savings
    const laborSavings = currentTotalManualCost - automatedTotalCost;
    const totalSavings = laborSavings + expectedFineReduction;
    const netSavings = totalSavings - regulaSyncAnnualCost;
    const roi = ((netSavings / regulaSyncAnnualCost) * 100);
    const paybackMonths = (regulaSyncAnnualCost / (totalSavings / 12));
    
    // Time savings
    const currentHours = (policies * hoursPerPolicyReview * 2) + (regulatoryUpdates * hoursPerRegulatoryUpdate) + (auditsPerYear * hoursPerAuditPrep * complianceStaff);
    const automatedHours = currentHours * (1 - automationEfficiency);
    const hoursSaved = currentHours - automatedHours;
    
    return {
      currentPolicyReviewCost,
      currentRegulatoryUpdateCost,
      currentAuditPrepCost,
      currentTotalManualCost,
      expectedFineReduction,
      automatedTotalCost,
      regulaSyncAnnualCost,
      laborSavings,
      totalSavings,
      netSavings,
      roi,
      paybackMonths,
      currentHours,
      hoursSaved
    };
  }, [employees, policies, regulatoryUpdates, complianceStaff, avgSalary, currentFineRisk]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">ROI Calculator</h1>
        <p className="text-muted-foreground mt-1">
          Calculate your potential savings with RegulaSync governance automation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Your Organisation
              </CardTitle>
              <CardDescription>
                Enter your organisation's details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Number of Employees</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[employees]}
                    onValueChange={(v) => setEmployees(v[0])}
                    min={10}
                    max={500}
                    step={10}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={employees}
                    onChange={(e) => setEmployees(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Number of Policies</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[policies]}
                    onValueChange={(v) => setPolicies(v[0])}
                    min={10}
                    max={200}
                    step={5}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={policies}
                    onChange={(e) => setPolicies(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Regulatory Updates per Year</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[regulatoryUpdates]}
                    onValueChange={(v) => setRegulatoryUpdates(v[0])}
                    min={6}
                    max={100}
                    step={2}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={regulatoryUpdates}
                    onChange={(e) => setRegulatoryUpdates(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Compliance Team Size</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[complianceStaff]}
                    onValueChange={(v) => setComplianceStaff(v[0])}
                    min={1}
                    max={20}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={complianceStaff}
                    onChange={(e) => setComplianceStaff(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Average Compliance Salary (£)</Label>
                <Input
                  type="number"
                  value={avgSalary}
                  onChange={(e) => setAvgSalary(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Estimated Annual Fine Risk (£)</Label>
                <Input
                  type="number"
                  value={currentFineRisk}
                  onChange={(e) => setCurrentFineRisk(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Based on industry average for your sector
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-700">{calculations.roi.toFixed(0)}%</div>
                  <div className="text-sm text-green-600">ROI</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <PoundSterling className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-700">{formatCurrency(calculations.netSavings)}</div>
                  <div className="text-sm text-blue-600">Annual Savings</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-purple-700">{calculations.paybackMonths.toFixed(1)}</div>
                  <div className="text-sm text-purple-600">Months to Payback</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto text-amber-600 mb-2" />
                  <div className="text-2xl font-bold text-amber-700">{calculations.hoursSaved.toFixed(0)}</div>
                  <div className="text-sm text-amber-600">Hours Saved/Year</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Comparison</CardTitle>
              <CardDescription>Current manual process vs RegulaSync automation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Costs */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span className="font-semibold">Current Annual Costs</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-sm">Policy Review</span>
                      <span className="font-medium">{formatCurrency(calculations.currentPolicyReviewCost)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-sm">Regulatory Updates</span>
                      <span className="font-medium">{formatCurrency(calculations.currentRegulatoryUpdateCost)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-sm">Audit Preparation</span>
                      <span className="font-medium">{formatCurrency(calculations.currentAuditPrepCost)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-100 dark:bg-red-950/30 rounded border border-red-200">
                      <span className="font-semibold">Total Manual Cost</span>
                      <span className="font-bold text-red-600">{formatCurrency(calculations.currentTotalManualCost)}</span>
                    </div>
                  </div>
                </div>

                {/* With RegulaSync */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">With RegulaSync</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-sm">Automated Process Cost</span>
                      <span className="font-medium">{formatCurrency(calculations.automatedTotalCost)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-sm">RegulaSync Subscription</span>
                      <span className="font-medium">{formatCurrency(calculations.regulaSyncAnnualCost)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-sm">Fine Risk Reduction</span>
                      <span className="font-medium text-green-600">-{formatCurrency(calculations.expectedFineReduction)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-green-100 dark:bg-green-950/30 rounded border border-green-200">
                      <span className="font-semibold">Net Annual Savings</span>
                      <span className="font-bold text-green-600">{formatCurrency(calculations.netSavings)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Benefits Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">85%</div>
                  <div className="text-sm text-muted-foreground">Time Reduction</div>
                  <div className="text-xs mt-1">in compliance activities</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">75%</div>
                  <div className="text-sm text-muted-foreground">Risk Reduction</div>
                  <div className="text-xs mt-1">in regulatory fine exposure</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">99.9%</div>
                  <div className="text-sm text-muted-foreground">Audit Accuracy</div>
                  <div className="text-xs mt-1">with SVAC verification</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Market Context */}
      <Card>
        <CardHeader>
          <CardTitle>UK Compliance Market Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">£33.9B</div>
              <div className="text-sm text-muted-foreground">UK Compliance Market</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">£2.8B</div>
              <div className="text-sm text-muted-foreground">Annual Compliance Cost</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">£1.2B</div>
              <div className="text-sm text-muted-foreground">FCA Fines (2023)</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">127%</div>
              <div className="text-sm text-muted-foreground">Regulatory Growth (5yr)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
