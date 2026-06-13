import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  RefreshCw,
  Zap,
  Shield
} from 'lucide-react';

interface ComplianceEvent {
  id: string;
  type: 'improvement' | 'issue' | 'alert' | 'resolved';
  title: string;
  impact: number;
  timestamp: Date;
  department: string;
}

const simulatedEvents: Omit<ComplianceEvent, 'id' | 'timestamp'>[] = [
  { type: 'improvement', title: 'AML training completed by 15 staff members', impact: 2, department: 'Compliance' },
  { type: 'resolved', title: 'Data retention policy gap addressed', impact: 3, department: 'Legal' },
  { type: 'alert', title: 'New FCA guidance requires policy review', impact: -1, department: 'Risk' },
  { type: 'improvement', title: 'Automated compliance check passed', impact: 1, department: 'IT' },
  { type: 'issue', title: 'Vendor assessment overdue', impact: -2, department: 'Operations' },
  { type: 'resolved', title: 'Security vulnerability patched', impact: 2, department: 'IT Security' },
  { type: 'improvement', title: 'Board approved updated DoA matrix', impact: 3, department: 'Governance' },
  { type: 'alert', title: 'ICO consultation response deadline approaching', impact: 0, department: 'Legal' },
];

export default function LiveComplianceSimulator() {
  const [baseScore, setBaseScore] = useState(94);
  const [currentScore, setCurrentScore] = useState(94);
  const [events, setEvents] = useState<ComplianceEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [animatingScore, setAnimatingScore] = useState(false);

  const addRandomEvent = () => {
    const randomEvent = simulatedEvents[Math.floor(Math.random() * simulatedEvents.length)];
    const newEvent: ComplianceEvent = {
      ...randomEvent,
      id: `evt-${Date.now()}`,
      timestamp: new Date(),
    };
    
    setEvents(prev => [newEvent, ...prev].slice(0, 5));
    
    // Animate score change
    setAnimatingScore(true);
    const newScore = Math.min(100, Math.max(80, currentScore + randomEvent.impact));
    setCurrentScore(newScore);
    
    setTimeout(() => setAnimatingScore(false), 500);
  };

  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(addRandomEvent, 3000);
      return () => clearInterval(interval);
    }
  }, [isSimulating, currentScore]);

  const getEventIcon = (type: ComplianceEvent['type']) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'resolved': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'issue': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
  };

  const getEventBadge = (type: ComplianceEvent['type']) => {
    switch (type) {
      case 'improvement': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Improvement</Badge>;
      case 'resolved': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Resolved</Badge>;
      case 'issue': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Issue</Badge>;
      case 'alert': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Alert</Badge>;
    }
  };

  const scoreColor = currentScore >= 90 ? 'text-green-600' : currentScore >= 80 ? 'text-amber-600' : 'text-red-600';
  const progressColor = currentScore >= 90 ? 'bg-green-500' : currentScore >= 80 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <Card className="border-2 border-dashed border-copper/30 bg-gradient-to-br from-copper/5 to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-copper" />
            Live Compliance Simulation
          </CardTitle>
          <Button 
            size="sm" 
            variant={isSimulating ? "destructive" : "default"}
            onClick={() => setIsSimulating(!isSimulating)}
            className={isSimulating ? "" : "bg-copper hover:bg-copper/90"}
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Stop
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Start Demo
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Live Score Display */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className={`text-5xl font-bold transition-all duration-500 ${scoreColor} ${animatingScore ? 'scale-110' : 'scale-100'}`}>
              {currentScore}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Compliance Score</div>
            {animatingScore && (
              <div className="absolute -top-2 -right-2">
                <span className={`text-sm font-bold ${currentScore > baseScore ? 'text-green-500' : 'text-red-500'} animate-bounce`}>
                  {currentScore > baseScore ? '+' : ''}{currentScore - baseScore}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <Progress 
              value={currentScore} 
              className="h-3"
              style={{ 
                ['--progress-background' as any]: progressColor 
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Target: 95%</span>
              <span>Industry Avg: 87%</span>
            </div>
          </div>
        </div>

        {/* Event Feed */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">Recent Events</div>
          {events.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Click "Start Demo" to see live compliance events</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {events.map((event, index) => (
                <div 
                  key={event.id}
                  className={`flex items-start gap-3 p-2 rounded-lg bg-background border transition-all duration-300 ${
                    index === 0 ? 'animate-slide-in-right border-copper/50' : ''
                  }`}
                >
                  {getEventIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{event.department}</span>
                      {event.impact !== 0 && (
                        <span className={`text-xs font-medium ${event.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {event.impact > 0 ? '+' : ''}{event.impact}%
                        </span>
                      )}
                    </div>
                  </div>
                  {getEventBadge(event.type)}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
