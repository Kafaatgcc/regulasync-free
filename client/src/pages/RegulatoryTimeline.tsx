import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Calendar, Clock, AlertTriangle, CheckCircle2, FileText,
  ChevronRight, Filter, Download, Bell, Scale, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'regulatory' | 'internal' | 'deadline' | 'milestone';
  source: 'FCA' | 'PRA' | 'ICO' | 'BOE' | 'Internal';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'upcoming' | 'in-progress' | 'completed' | 'overdue';
  affectedPolicies: string[];
  actionRequired: boolean;
}

const timelineEvents: TimelineEvent[] = [
  {
    id: '1',
    title: 'FCA Consumer Duty Annual Board Report',
    description: 'Annual board report on Consumer Duty implementation and outcomes must be submitted to FCA.',
    date: '2026-01-31',
    type: 'deadline',
    source: 'FCA',
    priority: 'critical',
    status: 'upcoming',
    affectedPolicies: ['Consumer Duty Policy', 'Product Governance Framework', 'Vulnerable Customer Policy'],
    actionRequired: true
  },
  {
    id: '2',
    title: 'PRA Operational Resilience Self-Assessment',
    description: 'Complete self-assessment against PRA operational resilience requirements.',
    date: '2026-02-15',
    type: 'regulatory',
    source: 'PRA',
    priority: 'high',
    status: 'upcoming',
    affectedPolicies: ['Business Continuity Policy', 'IT Disaster Recovery Plan'],
    actionRequired: true
  },
  {
    id: '3',
    title: 'Q1 AML Risk Assessment Due',
    description: 'Quarterly anti-money laundering risk assessment and reporting.',
    date: '2026-01-15',
    type: 'internal',
    source: 'Internal',
    priority: 'high',
    status: 'in-progress',
    affectedPolicies: ['AML Policy', 'KYC Procedures', 'Transaction Monitoring Policy'],
    actionRequired: true
  },
  {
    id: '4',
    title: 'ICO Data Protection Impact Assessment Review',
    description: 'Annual review of DPIA processes and documentation.',
    date: '2026-03-01',
    type: 'regulatory',
    source: 'ICO',
    priority: 'medium',
    status: 'upcoming',
    affectedPolicies: ['Data Protection Policy', 'Privacy Notice', 'Data Retention Policy'],
    actionRequired: false
  },
  {
    id: '5',
    title: 'Bank of England Stress Testing Submission',
    description: 'Submit annual stress testing results to Bank of England.',
    date: '2026-03-31',
    type: 'deadline',
    source: 'BOE',
    priority: 'high',
    status: 'upcoming',
    affectedPolicies: ['Capital Adequacy Policy', 'Liquidity Risk Policy'],
    actionRequired: true
  },
  {
    id: '6',
    title: 'FCA SMCR Annual Certification',
    description: 'Complete annual certification of certified persons under SM&CR.',
    date: '2026-04-01',
    type: 'deadline',
    source: 'FCA',
    priority: 'critical',
    status: 'upcoming',
    affectedPolicies: ['SM&CR Policy', 'Fitness and Propriety Policy', 'Conduct Rules Policy'],
    actionRequired: true
  },
  {
    id: '7',
    title: 'Internal Audit - Compliance Function Review',
    description: 'Annual internal audit of compliance function effectiveness.',
    date: '2026-02-28',
    type: 'internal',
    source: 'Internal',
    priority: 'medium',
    status: 'upcoming',
    affectedPolicies: ['Compliance Monitoring Plan', 'Internal Audit Charter'],
    actionRequired: false
  },
  {
    id: '8',
    title: 'FCA Financial Promotions Rules Update',
    description: 'New FCA rules on financial promotions come into effect.',
    date: '2026-04-15',
    type: 'regulatory',
    source: 'FCA',
    priority: 'high',
    status: 'upcoming',
    affectedPolicies: ['Marketing Policy', 'Financial Promotions Approval Process'],
    actionRequired: true
  }
];

function LiveChangeTrackerSection() {
  const { data, isLoading } = trpc.changeTracker.timeline.useQuery();

  const impactColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-copper" />
            Live Regulatory Change Tracker
          </CardTitle>
          {data?.summary && (
            <div className="flex gap-3 text-sm">
              <span className="text-muted-foreground">Last 12 months:</span>
              <Badge variant="outline">{data.summary.total} changes</Badge>
              {(data.summary.actionRequired ?? 0) > 0 && (
                <Badge className="bg-amber-100 text-amber-700">{data.summary.actionRequired} action required</Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : !data?.events?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No regulatory changes recorded in the last 12 months.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Monthly summary bar */}
            {data.byMonth && data.byMonth.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {Object.entries(data.summary.byBody).map(([body, count]) =>
                  (count as number) > 0 ? (
                    <div key={body} className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold">{count as number}</p>
                      <p className="text-xs text-muted-foreground">{body}</p>
                    </div>
                  ) : null
                )}
              </div>
            )}
            <Separator />
            {/* Recent events list */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {data.events.slice(0, 10).map((event: any) => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                  <Badge className={`${impactColor(event.impactLevel)} shrink-0 mt-0.5`}>
                    {event.impactLevel}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{event.summary}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{event.regulatoryBody}</span>
                      {event.effectiveDate && (
                        <span className="text-xs text-muted-foreground">• Effective: {new Date(event.effectiveDate).toLocaleDateString('en-GB')}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {event.status?.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RegulatoryTimeline() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'action-required'>('all');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');

  const filteredEvents = timelineEvents.filter(event => {
    if (filter === 'critical') return event.priority === 'critical';
    if (filter === 'action-required') return event.actionRequired;
    return true;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-amber-500';
      case 'medium': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'FCA': return '🏛️';
      case 'PRA': return '🏦';
      case 'ICO': return '🔒';
      case 'BOE': return '💷';
      default: return '📋';
    }
  };

  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [reminderEvent, setReminderEvent] = useState<TimelineEvent | null>(null);
  const [reminderTime, setReminderTime] = useState<'1_hour' | '1_day' | '3_days' | '1_week'>('1_day');
  const [reminderType, setReminderType] = useState<'email' | 'notification' | 'both'>('both');
  const [reminderSuccess, setReminderSuccess] = useState(false);

  const setReminderMutation = trpc.reminders.setReminder.useMutation({
    onSuccess: (data) => {
      toast.success('Reminder Set!', {
        description: data.message,
      });
      setReminderDialogOpen(false);
    },
    onError: (error) => {
      // In demo mode, show success anyway since backend requires auth
      const isDemo = window.location.search.includes('demo=true');
      if (isDemo && reminderEvent) {
        const reminderTimeText = {
          '1_hour': '1 hour',
          '1_day': '1 day',
          '3_days': '3 days',
          '1_week': '1 week',
        }[reminderTime];
        toast.success('Reminder Set! (Demo Mode)', {
          description: `You will be notified ${reminderTimeText} before "${reminderEvent.title}". In production, this would send an email notification.`,
        });
        setReminderDialogOpen(false);
      } else {
        toast.error('Failed to set reminder', {
          description: error.message,
        });
      }
    },
  });

  const handleSetReminder = (event: TimelineEvent) => {
    setReminderEvent(event);
    setReminderSuccess(false);
    setReminderDialogOpen(true);
  };

  const confirmSetReminder = () => {
    if (!reminderEvent) {
      return;
    }
    
    // Check if in demo mode
    const isDemo = window.location.search.includes('demo=true');
    if (isDemo) {
      // In demo mode, show success state in dialog
      setReminderSuccess(true);
    } else {
      // In production mode, call the backend
      setReminderMutation.mutate({
        eventTitle: reminderEvent.title,
        eventDate: reminderEvent.date,
        eventDescription: reminderEvent.description,
        reminderTime,
        reminderType,
      });
    }
  };

  const handleExportCalendar = () => {
    // Generate ICS file content
    const icsContent = generateICSContent(filteredEvents);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'regulatory-timeline.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Calendar Exported', {
      description: 'Regulatory timeline exported to .ics format'
    });
  };

  // Generate ICS file content
  const generateICSContent = (events: TimelineEvent[]) => {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RegulaSync//Regulatory Timeline//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    events.forEach(event => {
      const eventDate = new Date(event.date);
      const dateStr = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      lines.push('BEGIN:VEVENT');
      lines.push(`DTSTART:${dateStr}`);
      lines.push(`DTEND:${dateStr}`);
      lines.push(`SUMMARY:${event.title}`);
      lines.push(`DESCRIPTION:${event.description}\\n\\nSource: ${event.source}\\nPriority: ${event.priority}\\nAffected Policies: ${event.affectedPolicies.join(', ')}`);
      lines.push(`UID:${event.id}@regulasync.com`);
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter(event => event.date === dateStr);
  };

  // Get dates that have events
  const eventDates = filteredEvents.map(event => new Date(event.date));

  // Handle date selection in calendar
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const eventsOnDate = getEventsForDate(date);
      if (eventsOnDate.length > 0) {
        setSelectedEvent(eventsOnDate[0]);
      } else {
        setSelectedEvent(null);
      }
    }
  };

  // Group events by month
  const eventsByMonth = filteredEvents.reduce((acc, event) => {
    const month = new Date(event.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  // Custom day content for calendar to show event indicators
  const modifiers = {
    hasEvent: eventDates,
    critical: filteredEvents.filter(e => e.priority === 'critical').map(e => new Date(e.date)),
    high: filteredEvents.filter(e => e.priority === 'high').map(e => new Date(e.date)),
  };

  const modifiersStyles = {
    hasEvent: { fontWeight: 'bold' },
    critical: { backgroundColor: 'rgb(254 226 226)', color: 'rgb(185 28 28)' },
    high: { backgroundColor: 'rgb(254 243 199)', color: 'rgb(180 83 9)' },
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Calendar className="w-8 h-8 text-copper" />
            Regulatory Timeline
          </h1>
          <p className="text-muted-foreground mt-1">
            Track upcoming regulatory deadlines and compliance milestones
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'timeline' ? 'default' : 'outline'} 
            onClick={() => setViewMode('timeline')}
          >
            Timeline View
          </Button>
          <Button 
            variant={viewMode === 'calendar' ? 'default' : 'outline'} 
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </Button>
          <Button variant="outline" onClick={handleExportCalendar}>
            <Download className="w-4 h-4 mr-2" />
            Export Calendar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{timelineEvents.filter(e => e.priority === 'critical').length}</p>
              <p className="text-sm text-muted-foreground">Critical Deadlines</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{timelineEvents.filter(e => getDaysUntil(e.date) <= 30 && getDaysUntil(e.date) > 0).length}</p>
              <p className="text-sm text-muted-foreground">Due This Month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{timelineEvents.filter(e => e.actionRequired).length}</p>
              <p className="text-sm text-muted-foreground">Action Required</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{timelineEvents.filter(e => e.status === 'completed').length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All Events ({timelineEvents.length})</TabsTrigger>
          <TabsTrigger value="critical">Critical Only ({timelineEvents.filter(e => e.priority === 'critical').length})</TabsTrigger>
          <TabsTrigger value="action-required">Action Required ({timelineEvents.filter(e => e.actionRequired).length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main Content - Timeline or Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {viewMode === 'calendar' ? (
          <>
            {/* Calendar View */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Regulatory Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                    className="rounded-md border"
                  />
                </CardContent>
                {/* Events for selected date */}
                {selectedDate && (
                  <CardContent className="pt-0">
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">
                        Events on {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </h4>
                      {getEventsForDate(selectedDate).length > 0 ? (
                        <div className="space-y-2">
                          {getEventsForDate(selectedDate).map(event => (
                            <div 
                              key={event.id}
                              className={`p-3 rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedEvent?.id === event.id ? 'ring-2 ring-copper' : 'bg-secondary/30'}`}
                              onClick={() => setSelectedEvent(event)}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getSourceIcon(event.source)}</span>
                                <span className="font-medium">{event.title}</span>
                                <Badge className={getPriorityColor(event.priority) + ' text-white ml-auto'}>{event.priority}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No events scheduled for this date</p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </>
        ) : (
          <>
            {/* Timeline View */}
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(eventsByMonth).map(([month, events]) => (
                <div key={month}>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {month}
                  </h3>
                  <div className="space-y-3">
                    {events.map((event) => {
                      const daysUntil = getDaysUntil(event.date);
                      return (
                        <Card 
                          key={event.id} 
                          className={`cursor-pointer transition-all hover:shadow-md ${selectedEvent?.id === event.id ? 'ring-2 ring-copper' : ''}`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Priority Indicator */}
                              <div className={`w-1 h-full min-h-[80px] rounded-full ${getPriorityColor(event.priority)}`} />
                              
                              {/* Content */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-lg">{getSourceIcon(event.source)}</span>
                                      <h4 className="font-semibold">{event.title}</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </div>
                                
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                  <Badge variant="outline">{event.source}</Badge>
                                  <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                                  {event.actionRequired && (
                                    <Badge className="bg-amber-100 text-amber-700">Action Required</Badge>
                                  )}
                                  <span className="text-sm text-muted-foreground ml-auto">
                                    {daysUntil > 0 ? `${daysUntil} days left` : daysUntil === 0 ? 'Today' : `${Math.abs(daysUntil)} days overdue`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Event Details Panel */}
        <div className="lg:col-span-1">
          {selectedEvent ? (
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getSourceIcon(selectedEvent.source)}</span>
                  <div>
                    <CardTitle className="text-lg">{selectedEvent.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedEvent.source}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm mt-1">{selectedEvent.description}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedEvent.date).toLocaleDateString('en-GB', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <Badge className={`${getPriorityColor(selectedEvent.priority)} text-white mt-1`}>
                    {selectedEvent.priority.charAt(0).toUpperCase() + selectedEvent.priority.slice(1)}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Affected Policies</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedEvent.affectedPolicies.map((policy, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{policy}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={() => handleSetReminder(selectedEvent)}>
                    <Bell className="w-4 h-4 mr-2" />
                    Set Reminder
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Scale className="w-4 h-4 mr-2" />
                    View Policies
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-6">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select an event to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Live Regulatory Change Tracker — DB-powered 12-month view */}
      <LiveChangeTrackerSection />

      {/* Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setReminderSuccess(false);
        }
        setReminderDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          {reminderSuccess ? (
            // Success state
            <div className="py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-700 mb-2">Reminder Set!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You will be notified {{
                  '1_hour': '1 hour',
                  '1_day': '1 day',
                  '3_days': '3 days',
                  '1_week': '1 week',
                }[reminderTime]} before "{reminderEvent?.title}".
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  {reminderType === 'email' ? 'Email notification' : 
                   reminderType === 'notification' ? 'In-app notification' : 
                   'Email and in-app notification'}
                </span>
              </p>
              <p className="text-xs text-amber-600 mt-4 bg-amber-50 p-2 rounded">
                Demo Mode: In production, this would send actual notifications.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => {
                  setReminderDialogOpen(false);
                  setReminderSuccess(false);
                }}
              >
                Close
              </Button>
            </div>
          ) : (
            // Form state
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Set Reminder
                </DialogTitle>
                <DialogDescription>
                  Configure when and how you want to be reminded about this event.
                </DialogDescription>
              </DialogHeader>
              
              {reminderEvent && (
                <div className="space-y-4 py-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm">{reminderEvent.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {new Date(reminderEvent.date).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder-time">Remind me</Label>
                    <Select value={reminderTime} onValueChange={(v) => setReminderTime(v as typeof reminderTime)}>
                      <SelectTrigger id="reminder-time">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1_hour">1 hour before</SelectItem>
                        <SelectItem value="1_day">1 day before</SelectItem>
                        <SelectItem value="3_days">3 days before</SelectItem>
                        <SelectItem value="1_week">1 week before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder-type">Notification method</Label>
                    <Select value={reminderType} onValueChange={(v) => setReminderType(v as typeof reminderType)}>
                      <SelectTrigger id="reminder-type">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email only</SelectItem>
                        <SelectItem value="notification">In-app notification only</SelectItem>
                        <SelectItem value="both">Email and in-app notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setReminderDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmSetReminder} disabled={setReminderMutation.isPending}>
                  {setReminderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting...
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Set Reminder
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
