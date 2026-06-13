import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Rss, Zap, AlertTriangle, CheckCircle2, Clock, Loader2,
  ChevronDown, ChevronUp, ExternalLink, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function RegulatoryIntelligence() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [aiSummaries, setAiSummaries] = useState<Record<number, any>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const { data, isLoading, refetch, isFetching } = trpc.regulatoryIntelligence.dashboardFeed.useQuery(
    { limit: 20 }
  );
  const generateSummaryMutation = trpc.regulatoryIntelligence.generateImpactSummary.useMutation();

  const handleGenerateSummary = async (item: any) => {
    if (aiSummaries[item.id]) {
      // Toggle expand
      setExpandedId(expandedId === item.id ? null : item.id);
      return;
    }
    setLoadingId(item.id);
    setExpandedId(item.id);
    try {
      const result = await generateSummaryMutation.mutateAsync({
        updateId: item.id,
        updateTitle: item.title,
        updateSummary: item.summary,
        regulatoryBody: item.source,
      });
      setAiSummaries(prev => ({ ...prev, [item.id]: result }));
    } catch {
      toast.error('Failed to generate AI summary. Please try again.');
      setExpandedId(null);
    } finally {
      setLoadingId(null);
    }
  };

  const impactColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'action_required': return 'bg-red-100 text-red-700';
      case 'implemented': return 'bg-green-100 text-green-700';
      case 'under_review': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 8) return 'text-red-600';
    if (score >= 6) return 'text-amber-600';
    if (score >= 4) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Rss className="w-8 h-8 text-copper" />
            AI Regulatory Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Live feed of UK regulatory updates with AI-generated impact summaries
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh Feed
        </Button>
      </div>

      {/* Summary Stats */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Rss className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.items.length}</p>
                <p className="text-sm text-muted-foreground">Updates in Feed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.totalHigh}</p>
                <p className="text-sm text-muted-foreground">High/Critical Impact</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {data.lastUpdated
                    ? new Date(data.lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">Last Updated</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-copper" />
            Regulatory Updates Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : !data?.items?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Rss className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="font-medium">No regulatory updates found</p>
              <p className="text-sm mt-1">Updates will appear here as they are added to the system.</p>
            </div>
          ) : (
            data.items.map((item, idx) => (
              <div key={item.id}>
                {idx > 0 && <Separator />}
                <div className="py-3">
                  {/* Item header */}
                  <div className="flex items-start gap-3">
                    <Badge className={`${impactColor(item.impactLevel)} shrink-0 mt-0.5`}>
                      {item.impactLevel}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm leading-snug">{item.title}</h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs">{item.source}</Badge>
                          <Badge className={`${statusColor(item.status)} text-xs`}>
                            {item.status?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>
                      <div className="flex items-center gap-4 mt-2">
                        {item.effectiveDate && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Effective: {new Date(item.effectiveDate).toLocaleDateString('en-GB')}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Added: {new Date(item.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Summary button */}
                  <div className="mt-3 ml-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateSummary(item)}
                      disabled={loadingId === item.id}
                      className="text-xs"
                    >
                      {loadingId === item.id ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Analysing...
                        </>
                      ) : aiSummaries[item.id] ? (
                        expandedId === item.id ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Hide AI Analysis
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Show AI Analysis
                          </>
                        )
                      ) : (
                        <>
                          <Zap className="w-3 h-3 mr-1 text-copper" />
                          Generate AI Impact Summary
                        </>
                      )}
                    </Button>
                  </div>

                  {/* AI Summary panel */}
                  {expandedId === item.id && aiSummaries[item.id] && (
                    <div className="mt-3 p-4 rounded-lg bg-muted/50 border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold flex items-center gap-1">
                          <Zap className="w-4 h-4 text-copper" />
                          AI Impact Analysis
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Impact Score:</span>
                          <span className={`text-lg font-bold ${scoreColor(aiSummaries[item.id].impactScore)}`}>
                            {aiSummaries[item.id].impactScore}/10
                          </span>
                        </div>
                      </div>
                      <p className="text-sm">{aiSummaries[item.id].executiveSummary}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Affected Areas</p>
                          <div className="flex flex-wrap gap-1">
                            {aiSummaries[item.id].affectedAreas?.map((area: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Deadline</p>
                          <p className="text-sm flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {aiSummaries[item.id].deadline}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Immediate Actions Required</p>
                        <ul className="space-y-1">
                          {aiSummaries[item.id].immediateActions?.map((action: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
