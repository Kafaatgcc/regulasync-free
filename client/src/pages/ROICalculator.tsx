import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, Clock, Users, PoundSterling, AlertTriangle, FileText } from "lucide-react";
import {
  calculateRoi,
  DEFAULT_ROI_INPUTS,
  getRoiInputErrors,
  ROI_PLANS,
  type RoiInputs,
  type RoiPlan,
} from "@shared/roiCalculator";

const formatCurrency = (value: number) => new Intl.NumberFormat("en-GB", {
  style: "currency", currency: "GBP", maximumFractionDigits: 2,
}).format(value);

function ScenarioInput({ id, label, value, onChange, min = 0, max, step = "any", hint }: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | "any";
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : ""}
        onChange={event => onChange(event.target.value === "" ? NaN : Number(event.target.value))}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function ROICalculator() {
  const [inputs, setInputs] = useState<RoiInputs>({ ...DEFAULT_ROI_INPUTS });
  const updateNumber = (key: Exclude<keyof RoiInputs, "plan">, value: number) => {
    setInputs(previous => ({ ...previous, [key]: value }));
  };
  const { calculations, errors } = useMemo(() => {
    const inputErrors = getRoiInputErrors(inputs);
    if (inputErrors.length) return { calculations: null, errors: inputErrors };
    try {
      return { calculations: calculateRoi(inputs), errors: [] as string[] };
    } catch (error) {
      return { calculations: null, errors: [error instanceof Error ? error.message : "Unable to calculate this scenario."] };
    }
  }, [inputs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ROI Calculator</h1>
        <p className="text-muted-foreground mt-1">Explore an illustrative first-year business case for RegulaSync.</p>
        <Badge variant="secondary" className="mt-2">Scenario assumptions — not customer evidence</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Your Scenario
              </CardTitle>
              <CardDescription>All amounts are GBP, excluding VAT. Edit assumptions to match your organisation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="roi-plan">Subscription plan (£ per licensed seat / month)</Label>
                <select
                  id="roi-plan"
                  value={inputs.plan}
                  onChange={event => setInputs(previous => ({ ...previous, plan: event.target.value as RoiPlan }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Object.entries(ROI_PLANS).map(([key, plan]) => (
                    <option key={key} value={key}>{plan.label} — £{plan.monthlyPricePerSeat}/seat/month</option>
                  ))}
                </select>
              </div>
              <ScenarioInput
                id="roi-seats" label="Licensed seats (people)" value={inputs.seats}
                onChange={value => updateNumber("seats", value)} min={1} step={1}
                hint="Annual licence cost = seats × selected monthly seat price × 12."
              />
              <ScenarioInput
                id="roi-hourly-cost" label="Fully loaded staff cost (£ / hour)" value={inputs.hourlyCost}
                onChange={value => updateNumber("hourlyCost", value)}
                hint="Use your own staff or contractor cost; £40/hour is an illustrative assumption, not a market benchmark."
              />
              <ScenarioInput
                id="roi-team-hours" label="Current in-scope work (total team hours / month)" value={inputs.teamHoursPerMonth}
                onChange={value => updateNumber("teamHoursPerMonth", value)}
                hint="Include policy reviews, regulatory monitoring and audit preparation once. This is total team time, not hours per seat."
              />
              <ScenarioInput
                id="roi-time-saving" label="Assumed reduction in in-scope time (%)" value={inputs.timeSavingPercent}
                onChange={value => updateNumber("timeSavingPercent", value)} max={100}
                hint="The default 25% is a planning assumption, not a demonstrated product outcome."
              />
              <ScenarioInput
                id="roi-cash-realization" label="Saved time realizable as cash savings (%)" value={inputs.cashRealizationPercent}
                onChange={value => updateNumber("cashRealizationPercent", value)} max={100}
                hint="Use 0% if payroll or other spend will not actually fall. Only removable costs, such as overtime or contractor spend, count as cash savings."
              />
              <ScenarioInput
                id="roi-implementation" label="One-time implementation & training cost (£)" value={inputs.implementationCost}
                onChange={value => updateNumber("implementationCost", value)}
                hint="Include onboarding, integration and training effort at cost, including internal effort. £5,000 is an assumption, not a supplier quote."
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4" aria-live="polite">
          {errors.length > 0 && (
            <Card className="border-amber-300">
              <CardContent className="pt-6" role="alert">
                <p className="font-semibold">Check your scenario inputs</p>
                <ul className="list-disc pl-5 mt-2 text-sm">{errors.map(error => <li key={error}>{error}</li>)}</ul>
                <p className="text-sm text-muted-foreground mt-2">Results are withheld until all inputs are valid.</p>
              </CardContent>
            </Card>
          )}
          {calculations && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className={calculations.financialRoiPercent < 0 ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200" : "bg-green-50 dark:bg-green-950/20 border-green-200"}>
                  <CardContent className="pt-6 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
                    <div className="text-2xl font-bold">{calculations.financialRoiPercent.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Year 1 Financial ROI</div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                  <CardContent className="pt-6 text-center">
                    <PoundSterling className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-blue-700">{formatCurrency(calculations.yearOneNetSavings)}</div>
                    <div className="text-sm text-blue-600">Year 1 Net Benefit / (Cost)</div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
                  <CardContent className="pt-6 text-center">
                    <Clock className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                    <div className="text-xl font-bold text-purple-700">
                      {calculations.paybackStatus === "no-payback" ? "No payback" : calculations.paybackStatus === "no-setup-cost" ? "No setup cost" : `${calculations.paybackMonths!.toFixed(1)} months`}
                    </div>
                    <div className="text-sm text-purple-600">Implementation Payback</div>
                  </CardContent>
                </Card>
                <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
                  <CardContent className="pt-6 text-center">
                    <Users className="h-8 w-8 mx-auto text-amber-600 mb-2" />
                    <div className="text-2xl font-bold text-amber-700">{calculations.annualHoursSaved.toFixed(1)}</div>
                    <div className="text-sm text-amber-600">Assumed Hours Saved / Year</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>First-Year Cost & Savings</CardTitle>
                  <CardDescription>A single time-saving pool; only the cash-realizable portion is included in financial ROI.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /><span className="font-semibold">Illustrative Time Savings</span></div>
                      <div className="space-y-2">
                        <div className="flex justify-between gap-3 p-2 bg-muted rounded"><span className="text-sm">Baseline team hours / year</span><span className="font-medium">{calculations.baselineAnnualHours.toFixed(1)}</span></div>
                        <div className="flex justify-between gap-3 p-2 bg-muted rounded"><span className="text-sm">Remaining team hours / year</span><span className="font-medium">{calculations.remainingAnnualHours.toFixed(1)}</span></div>
                        <div className="flex justify-between gap-3 p-2 bg-muted rounded"><span className="text-sm">Total saved-time value / year</span><span className="font-medium">{formatCurrency(calculations.annualTimeValue)}</span></div>
                        <div className="flex justify-between gap-3 p-2 bg-muted rounded"><span className="text-sm">Cash-realizable savings / year</span><span className="font-medium">{formatCurrency(calculations.annualCashSavings)}</span></div>
                        <div className="flex justify-between gap-3 p-2 bg-muted rounded"><span className="text-sm">Non-cash capacity value / year</span><span className="font-medium">{formatCurrency(calculations.annualOpportunityValue)}</span></div>
                      </div>
                      <p className="text-xs text-muted-foreground">Released capacity and possible future cost avoidance are not reductions in current spending. They are excluded from cash savings and are not added a second time.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2"><PoundSterling className="h-5 w-5 text-primary" /><span className="font-semibold">Investment & Net Benefit</span></div>
                      <div className="space-y-2">
                        <div className="flex justify-between gap-3 p-2 bg-muted rounded"><span className="text-sm">Licence / month ({inputs.seats} seats)</span><span className="font-medium">{formatCurrency(calculations.monthlyLicenseCost)}</span></div>
                        <div className="flex justify-between gap-3 p-2 bg-muted rounded"><span className="text-sm">Licence / year (12 months)</span><span className="font-medium">{formatCurrency(calculations.annualLicenseCost)}</span></div>
                        <div className="flex justify-between gap-3 p-2 bg-muted rounded"><span className="text-sm">One-time implementation & training</span><span className="font-medium">{formatCurrency(inputs.implementationCost)}</span></div>
                        <div className="flex justify-between gap-3 p-2 bg-muted rounded"><span className="font-semibold">Year 1 total cost</span><span className="font-bold">{formatCurrency(calculations.yearOneTotalCost)}</span></div>
                        <div className="flex justify-between gap-3 p-2 bg-muted rounded"><span className="font-semibold">Year 1 net benefit / (cost)</span><span className="font-bold">{formatCurrency(calculations.yearOneNetSavings)}</span></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Scenario Interpretation</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{inputs.timeSavingPercent}%</div>
                      <div className="text-sm text-muted-foreground">Assumed time reduction</div>
                      <div className="text-xs mt-1">Not measured customer performance</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{calculations.annualOpportunityHours.toFixed(1)} h</div>
                      <div className="text-sm text-muted-foreground">Non-cash capacity / year</div>
                      <div className="text-xs mt-1">Opportunity time, excluded from financial ROI</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{formatCurrency(calculations.netMonthlySavings)}</div>
                      <div className="text-sm text-muted-foreground">Net recurring savings / month</div>
                      <div className="text-xs mt-1">Cash savings less monthly licence cost</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    {calculations.paybackStatus === "no-payback"
                      ? "No payback under these assumptions: cash savings do not exceed the recurring licence cost, even if implementation cost is zero."
                      : calculations.paybackStatus === "no-setup-cost"
                        ? "No upfront implementation cost to recover in this scenario. Recurring net savings are positive; this is not a claim of instant product payback."
                        : "Payback assumes the same net monthly cash savings continue beyond year 1. It is an undiscounted scenario, not a guarantee."}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Methodology & Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>Annual hours saved = total team hours per month × 12 × assumed time reduction. Annual cash-realizable savings = hours saved × hourly cost × cash realization percentage. The remaining saved-time value is non-cash capacity, not extra cash savings.</p>
          <p>Year 1 total cost = licensed seats × monthly seat price × 12 + one-time implementation and training cost. Financial ROI = (annual cash-realizable savings − year 1 total cost) ÷ year 1 total cost × 100. Negative returns are shown without a cap.</p>
          <p>Implementation payback = one-time implementation and training cost ÷ (annual cash-realizable savings ÷ 12 − monthly licence cost). There is no payback where net recurring savings are zero or negative. A zero setup cost is reported separately when recurring savings are positive.</p>
          <div className="flex items-start gap-2 text-muted-foreground">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>Illustrative planning tool, not customer evidence, financial advice or a regulatory guarantee. No fines avoided, risk reduction or audit accuracy is assumed. The model uses a full 12 months of steady-state savings and licence costs; adjust time savings for rollout delays. VAT, tax, discounting and additional ongoing costs are excluded, so actual returns may be lower. Validate assumptions against a pilot and your own budget before relying on them.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
