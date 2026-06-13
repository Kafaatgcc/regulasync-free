import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RefreshCw, Bell, Shield, Scale, Database, Building2, Wifi, WifiOff, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface RegulatoryUpdate {
  id: string;
  title: string;
  source: 'FCA' | 'PRA' | 'ICO' | 'BOE' | 'GOVUK';
  category: string;
  date: string;
  summary: string;
  url: string;
  priority: 'high' | 'medium' | 'low';
}

interface SourceStatus {
  name: 'FCA' | 'PRA' | 'BOE';
  url: string;
  status: 'success' | 'failed';
}

// Fallback demo data (used when live feed is unavailable)
const fallbackUpdates: RegulatoryUpdate[] = [
  {
    id: 'demo-1',
    title: 'FCA publishes final rules on Sustainability Disclosure Requirements',
    source: 'FCA',
    category: 'Sustainability',
    date: '2025-12-30',
    summary: 'New anti-greenwashing rule and investment labels regime to help consumers navigate sustainable investment products.',
    url: 'https://www.fca.org.uk/news',
    priority: 'high'
  },
  {
    id: 'demo-2',
    title: 'PRA updates operational resilience expectations for firms',
    source: 'PRA',
    category: 'Operational Resilience',
    date: '2025-12-28',
    summary: 'Firms must demonstrate they can remain within impact tolerances for important business services.',
    url: 'https://www.bankofengland.co.uk/prudential-regulation',
    priority: 'high'
  },
  {
    id: 'demo-3',
    title: 'ICO issues guidance on AI and data protection compliance',
    source: 'ICO',
    category: 'Data Protection',
    date: '2025-12-27',
    summary: 'New framework for organisations using AI systems to process personal data under UK GDPR.',
    url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/',
    priority: 'high'
  },
  {
    id: 'demo-4',
    title: 'Bank of England announces stress testing requirements for 2026',
    source: 'BOE',
    category: 'Stress Testing',
    date: '2025-12-24',
    summary: 'Annual cyclical scenario for major UK banks and building societies with new climate risk components.',
    url: 'https://www.bankofengland.co.uk/stress-testing',
    priority: 'medium'
  },
  {
    id: 'demo-5',
    title: 'Consumer Duty: FCA reminds firms of ongoing obligations',
    source: 'FCA',
    category: 'Consumer Protection',
    date: '2025-12-22',
    summary: 'Firms must continue to assess and evidence they are delivering good outcomes for retail customers.',
    url: 'https://www.fca.org.uk/firms/consumer-duty',
    priority: 'medium'
  },
  {
    id: 'demo-6',
    title: 'UK Government updates Economic Crime Plan 2',
    source: 'GOVUK',
    category: 'Financial Crime',
    date: '2025-12-20',
    summary: 'Enhanced measures to combat money laundering and fraud with new public-private partnership initiatives.',
    url: 'https://www.gov.uk/government/publications/economic-crime-plan-2',
    priority: 'medium'
  }
];

const sourceConfig = {
  FCA: { 
    color: 'bg-blue-600', 
    icon: Scale,
    fullName: 'Financial Conduct Authority'
  },
  PRA: { 
    color: 'bg-purple-600', 
    icon: Building2,
    fullName: 'Prudential Regulation Authority'
  },
  ICO: { 
    color: 'bg-green-600', 
    icon: Shield,
    fullName: 'Information Commissioner\'s Office'
  },
  BOE: { 
    color: 'bg-red-600', 
    icon: Database,
    fullName: 'Bank of England'
  },
  GOVUK: { 
    color: 'bg-gray-700', 
    icon: Bell,
    fullName: 'UK Government'
  }
};

const priorityColors = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-green-500'
};

export default function RegulatoryFeed() {
  const [updates, setUpdates] = useState<RegulatoryUpdate[]>(fallbackUpdates);
  const [sourceStatuses, setSourceStatuses] = useState<SourceStatus[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [filter, setFilter] = useState<string | null>(null);

  // Fetch live regulatory updates from multiple sources
  const { data: liveData, refetch, isLoading: isRefreshing, isError } = trpc.regulatoryFeed.fetchLive.useQuery(undefined, {
    enabled: false, // Manual fetch only
  });

  // Handle live data updates
  useEffect(() => {
    if (liveData) {
      if (liveData.success && liveData.items.length > 0) {
        // Merge live data with fallback data from sources not fetched
        const liveSourceNames = liveData.sources.filter(s => s.status === 'success').map(s => s.name);
        const otherSourceUpdates = fallbackUpdates.filter(u => !liveSourceNames.includes(u.source as any));
        const mergedUpdates = [...liveData.items, ...otherSourceUpdates].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setUpdates(mergedUpdates);
        setSourceStatuses(liveData.sources);
        setIsLive(true);
        setLastUpdated(new Date());
        
        // Show success toast with source summary
        const successCount = liveData.sources.filter(s => s.status === 'success').length;
        toast.success('Live Feed Updated', {
          description: `Connected to ${successCount}/${liveData.sources.length} regulatory sources. ${liveData.summary.total} updates fetched.`
        });
      } else {
        setIsLive(false);
      }
    }
  }, [liveData]);

  // Handle errors
  useEffect(() => {
    if (isError) {
      setIsLive(false);
      toast.error('Live Feed Error', {
        description: 'Could not connect to regulatory feeds'
      });
    }
  }, [isError]);

  const handleRefresh = () => {
    refetch();
  };

  // Auto-fetch on mount
  useEffect(() => {
    refetch();
  }, []);

  const filteredUpdates = filter 
    ? updates.filter(u => u.source === filter)
    : updates;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const liveSourceCount = sourceStatuses.filter(s => s.status === 'success').length;

  return (
    <section className="py-20 bg-slate-50" id="regulatory-feed">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-navy/10 text-navy hover:bg-navy/20">
            <span className="flex items-center gap-2">
              {isLive ? (
                <>
                  <Wifi className="w-3 h-3 text-green-500" />
                  Live Multi-Source Regulatory Intelligence
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-500" />
                  Regulatory Intelligence (Cached)
                </>
              )}
            </span>
          </Badge>
          <h2 className="text-4xl font-bold text-navy mb-4">
            UK Regulatory Updates
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isLive ? (
              <>Real-time monitoring from {liveSourceCount} UK regulatory bodies. 
              RegulaSync automatically analyzes impact on your policies.</>
            ) : (
              <>Monitoring announcements from UK regulatory bodies. 
              Click refresh to fetch live updates from FCA, PRA, and Bank of England.</>
            )}
          </p>
        </div>

        {/* Source Status Indicators */}
        {isLive && sourceStatuses.length > 0 && (
          <div className="flex justify-center gap-4 mb-8">
            {sourceStatuses.map((source) => (
              <div 
                key={source.name}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                  source.status === 'success' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {source.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {source.name}
                <span className="text-xs opacity-70">
                  {source.status === 'success' ? 'Connected' : 'Offline'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Source Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Button
            variant={filter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(null)}
            className={filter === null ? "bg-navy hover:bg-navy/90" : ""}
          >
            All Sources
          </Button>
          {Object.entries(sourceConfig).map(([key, config]) => {
            const Icon = config.icon;
            const count = updates.filter(u => u.source === key).length;
            return (
              <Button
                key={key}
                variant={filter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(key)}
                className={filter === key ? `${config.color} hover:opacity-90` : ""}
              >
                <Icon className="w-4 h-4 mr-1" />
                {key}
                {count > 0 && (
                  <span className="ml-1 text-xs opacity-70">({count})</span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Last Updated & Refresh */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </p>
            {isLive && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                <Wifi className="w-3 h-3 mr-1" />
                {liveSourceCount} Sources Live
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Fetching from FCA, PRA, BOE...' : 'Refresh All Feeds'}
          </Button>
        </div>

        {/* Updates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUpdates.slice(0, 9).map((update, index) => {
            const SourceIcon = sourceConfig[update.source]?.icon || Bell;
            const sourceColor = sourceConfig[update.source]?.color || 'bg-gray-600';
            const isLiveSource = sourceStatuses.find(s => s.name === update.source)?.status === 'success';
            return (
              <Card 
                key={update.id} 
                className={`border-l-4 ${priorityColors[update.priority]} hover:shadow-lg transition-all duration-300 animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Badge className={`${sourceColor} text-white text-xs`}>
                        <SourceIcon className="w-3 h-3 mr-1" />
                        {update.source}
                      </Badge>
                      {isLiveSource && (
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live data" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(update.date)}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-semibold leading-tight line-clamp-2">
                    {update.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {update.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {update.category}
                    </Badge>
                    <a 
                      href={update.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-copper hover:underline flex items-center gap-1"
                    >
                      View Source <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Integration CTA */}
        <div className="mt-12 text-center">
          <Card className="inline-block bg-gradient-to-r from-navy to-navy/80 text-white p-6 max-w-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-full">
                <Bell className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Automated Impact Analysis</h3>
                <p className="text-sm text-white/80">
                  RegulaSync automatically maps regulatory updates to your policies and alerts you to required changes.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
