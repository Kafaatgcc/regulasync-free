import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, Shield,
  Clock, Target, ChevronRight
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function PredictiveRisk() {
  const { data, isLoading } = trpc.predictiveRisk.forecast.useQuery();

  const riskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const overallRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const trendIcon = (trend: string) => {
    switch (trend) {
      case 'deteriorating': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const probabilityBarColor = (prob: number) => {
    if (prob >= 60) return 'bg-red-500';
    if (prob >= 40) return 'bg-amber-500';
    if (prob >= 20) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Target className="w-8 h-8 text-copper" />
          Predictive Compliance Risk Engine
        </h1>
        <p className="text-muted-foreground mt-1">
          90-day breach probability forecast for all policies, powered by real compliance data
        </p>
      </div>

      {/* Overall Risk Banner */}
      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : data && (
        <Card className={`border-2 ${overallRiskColor(data.overallRisk)}`}>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full border-2 ${overallRiskColor(data.overallRisk)}`}>
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Portfolio Risk (90-day)</p>
                <p className="text-2xl font-bold capitalize">{data.overallRisk} Risk</p>
                <p className="text-sm mt-0.5">{data.summary}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{data.avgBreachProbability}%</p>
              <p className="text-sm text-muted-foreground">Avg. Breach Probability</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(['critical', 'high', 'medium', 'low'] as const).map(level => {
            const count = data.forecasts.filter(f => f.riskLevel === level).length;
            return (
              <Card key={level}>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{count}</p>
                  <Badge className={`${riskColor(level)} mt-1 capitalize`}>{level}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Policy Forecasts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-copper" />
            Policy-Level Risk Forecasts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : !data?.forecasts?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="font-medium">No policies found</p>
              <p className="text-sm mt-1">Add policies to the system to see risk forecasts.</p>
            </div>
          ) : (
            data.forecasts.map((forecast, idx) => (
              <div
                key={forecast.policyId}
                className={`p-4 rounded-lg border ${idx === 0 ? 'border-red-200 bg-red-50/30' : 'bg-card'} space-y-3`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {trendIcon(forecast.trend)}
                    <div>
                      <p className="font-semibold text-sm">{forecast.policyTitle}</p>
                      <p className="text-xs text-muted-foreground capitalize">{forecast.category?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`${riskColor(forecast.riskLevel)} capitalize`}>{forecast.riskLevel}</Badge>
                    <span className="text-lg font-bold">{forecast.breachProbability}%</span>
                  </div>
                </div>

                {/* Breach probability bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Breach Probability</span>
                    <span>{forecast.breachProbability}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${probabilityBarColor(forecast.breachProbability)}`}
                      style={{ width: `${forecast.breachProbability}%` }}
                    />
                  </div>
                </div>

                {/* Score comparison */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-muted/50 rounded p-2">
                    <p className="text-xs text-muted-foreground">Current Score</p>
                    <p className="font-bold text-sm">{forecast.currentScore}%</p>
                  </div>
                  <div className={`rounded p-2 ${forecast.projectedScore < forecast.currentScore ? 'bg-red-50' : 'bg-green-50'}`}>
                    <p className="text-xs text-muted-foreground">Projected (90d)</p>
                    <p className={`font-bold text-sm ${forecast.projectedScore < forecast.currentScore ? 'text-red-600' : 'text-green-600'}`}>
                      {forecast.projectedScore}%
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <p className="text-xs text-muted-foreground">Days to Review</p>
                    <p className={`font-bold text-sm ${forecast.daysToNextReview < 0 ? 'text-red-600' : forecast.daysToNextReview < 30 ? 'text-amber-600' : ''}`}>
                      {forecast.daysToNextReview < 0 ? `${Math.abs(forecast.daysToNextReview)}d overdue` : `${forecast.daysToNextReview}d`}
                    </p>
                  </div>
                </div>

                {/* Risk factors */}
                {forecast.keyRiskFactors?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {forecast.keyRiskFactors.map((factor: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        {factor}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
