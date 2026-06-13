import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Users } from "lucide-react";

export default function Benchmarking() {
  
  
  const [industry, setIndustry] = useState("Financial Services");
  const [orgSize, setOrgSize] = useState<"1-10" | "11-50" | "51-200" | "201-500" | "500+">("11-50");
  const [comparison, setComparison] = useState<any>(null);

  const { data: industries = [] } = trpc.benchmarking.industries.useQuery();

  const submit = trpc.benchmarking.submit.useMutation({
    onSuccess: () => {
      toast.success("Snapshot submitted", { description: "Your anonymised compliance data has been submitted for benchmarking." });
    },
    onError: (e) => toast.error(e.message),
  });

  const utils = trpc.useUtils();
  const [compareLoading, setCompareLoading] = useState(false);
  const doCompare = async () => {
    setCompareLoading(true);
    try {
      const data = await utils.client.benchmarking.compare.query({ industry, orgSize });
      setComparison(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCompareLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-500";
    return "text-red-600";
  };

  const getPositionLabel = (percentile: number) => {
    if (percentile >= 75) return { label: "Top Performer", color: "bg-green-100 text-green-800" };
    if (percentile >= 50) return { label: "Above Average", color: "bg-blue-100 text-blue-800" };
    if (percentile >= 25) return { label: "Below Average", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Needs Improvement", color: "bg-red-100 text-red-800" };
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-blue-600" /> Peer Benchmarking
        </h1>
        <p className="text-gray-500 mt-1">Anonymous comparison of your compliance posture against industry peers — all data anonymised</p>
      </div>

      {/* Privacy Notice */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Privacy-First Benchmarking</p>
              <p className="text-sm text-blue-600 mt-0.5">
                All data is fully anonymised before submission. No organisation names, contact details, or identifying information is ever shared.
                You only see aggregated statistics from peers in the same industry and size bracket.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Your Peer Group</CardTitle>
          <CardDescription>Select your industry and organisation size to compare with relevant peers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {industries.length > 0 ? industries.map((i: string) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  )) : [
                    "Financial Services", "Healthcare", "Legal", "Technology", "Retail", "Insurance", "Asset Management", "Fintech"
                  ].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Organisation Size</Label>
              <Select value={orgSize} onValueChange={v => setOrgSize(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1–10 employees</SelectItem>
                  <SelectItem value="11-50">11–50 employees</SelectItem>
                  <SelectItem value="51-200">51–200 employees</SelectItem>
                  <SelectItem value="201-500">201–500 employees</SelectItem>
                  <SelectItem value="500+">500+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => submit.mutate({ industry, orgSize })}
              disabled={submit.isPending}
            >
              {submit.isPending ? "Submitting..." : "Submit My Data"}
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={doCompare}
              disabled={compareLoading}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {compareLoading ? "Comparing..." : "Compare Now"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benchmark Results</CardTitle>
              <CardDescription>
                Comparing against {comparison.peerCount} anonymised peers in {industry} ({orgSize} employees)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className={`text-4xl font-bold ${getScoreColor(comparison.yourScore)}`}>{comparison.yourScore}%</p>
                  <p className="text-sm text-gray-500 mt-1">Your Score</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className={`text-4xl font-bold ${getScoreColor(comparison.industryAverage)}`}>{comparison.industryAverage}%</p>
                  <p className="text-sm text-gray-500 mt-1">Industry Average</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-4xl font-bold text-blue-600">{comparison.percentile}th</p>
                  <p className="text-sm text-gray-500 mt-1">Percentile</p>
                </div>
              </div>

              {comparison.percentile && (
                <div className="flex items-center justify-center mb-6">
                  <Badge className={`text-sm px-4 py-1.5 ${getPositionLabel(comparison.percentile).color}`}>
                    {getPositionLabel(comparison.percentile).label}
                  </Badge>
                </div>
              )}

              {comparison.categoryBreakdown && comparison.categoryBreakdown.length > 0 && (
                <div>
                  <p className="font-medium text-gray-700 mb-3">Category Breakdown vs Peers</p>
                  <div className="space-y-3">
                    {comparison.categoryBreakdown.map((cat: any) => (
                      <div key={cat.category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium capitalize">{cat.category.replace(/_/g, " ")}</span>
                          <span className="text-gray-500">You: {cat.yourScore}% · Avg: {cat.peerAverage}%</span>
                        </div>
                        <div className="relative">
                          <Progress value={cat.peerAverage} className="h-2 bg-gray-100" />
                          <div
                            className="absolute top-0 h-2 rounded-full bg-blue-500 opacity-70"
                            style={{ width: `${cat.yourScore}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {comparison.recommendations && comparison.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" /> Improvement Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {comparison.recommendations.map((rec: string, i: number) => (
                    <div key={i} className="flex gap-3 p-3 bg-green-50 rounded-lg">
                      <span className="font-bold text-green-600 flex-shrink-0">{i + 1}.</span>
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
