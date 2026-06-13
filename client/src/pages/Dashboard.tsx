import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Shield,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Brain,
  Bell,
  BarChart3,
  Activity,
  Loader2
} from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import LiveComplianceSimulator from "@/components/LiveComplianceSimulator";
import { useLocation } from "wouter";

const complianceData = [
  { month: "Jul", score: 78 },
  { month: "Aug", score: 82 },
  { month: "Sep", score: 85 },
  { month: "Oct", score: 88 },
  { month: "Nov", score: 91 },
  { month: "Dec", score: 94 },
];

const departmentData = [
  { name: "Finance", compliance: 96, risk: "low" },
  { name: "Operations", compliance: 89, risk: "medium" },
  { name: "IT", compliance: 92, risk: "low" },
  { name: "HR", compliance: 87, risk: "medium" },
  { name: "Legal", compliance: 98, risk: "low" },
];

const policyDistribution = [
  { name: "Active", value: 127, color: "#1e3a5f" },
  { name: "Under Review", value: 23, color: "#b87333" },
  { name: "Draft", value: 15, color: "#8b9dc3" },
  { name: "Archived", value: 42, color: "#d1d5db" },
];

const recentActivities = [
  { id: 1, action: "Policy Approved", item: "AML Compliance Policy v3.2", user: "Sarah Chen", time: "2 hours ago", status: "success" },
  { id: 2, action: "Delegation Created", item: "Financial Authority - £50,000", user: "James Wilson", time: "4 hours ago", status: "info" },
  { id: 3, action: "Compliance Alert", item: "Data Retention Policy Review Due", user: "System", time: "6 hours ago", status: "warning" },
  { id: 4, action: "Audit Completed", item: "Q4 Risk Assessment", user: "Michael Brown", time: "1 day ago", status: "success" },
  { id: 5, action: "Policy Updated", item: "GDPR Data Processing Agreement", user: "Emma Davis", time: "1 day ago", status: "info" },
];

const aiRecommendations = [
  { id: 1, title: "Update AML Policy", description: "New FCA guidance requires policy update by Q2 2026", priority: "high", confidence: 92 },
  { id: 2, title: "Review Delegation Limits", description: "3 delegations expiring in the next 30 days", priority: "medium", confidence: 88 },
  { id: 3, title: "Compliance Training", description: "15 employees due for annual compliance training", priority: "medium", confidence: 95 },
];

const chartConfig = {
  score: {
    label: "Compliance Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function Dashboard() {
  const { user } = useAuth();
  
  // Check for demo mode
  const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('demoMode') === 'true';
  const displayName = isDemoMode ? 'Demo User' : (user?.name?.split(' ')[0] || 'User');

  // Compliance Health Scorecard
  const { data: scorecard, isLoading: scorecardLoading } = trpc.healthScorecard.scorecard.useQuery();
  const scorecardScore = scorecard?.overall ?? 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {displayName}</h1>
          <p className="text-muted-foreground">Here's your governance overview for today</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            3 Alerts
          </Button>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            New Policy
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="compliance-score">
        <MetricCard
          title="Overall Compliance"
          value="94%"
          change="+3%"
          trend="up"
          icon={Shield}
          description="vs last month"
          href="/compliance"
        />
        <MetricCard
          title="Active Policies"
          value="127"
          change="+5"
          trend="up"
          icon={FileText}
          description="this quarter"
          href="/policies"
        />
        <MetricCard
          title="Pending Approvals"
          value="12"
          change="-3"
          trend="down"
          icon={Clock}
          description="vs last week"
          href="/delegation"
        />
        <MetricCard
          title="Risk Alerts"
          value="4"
          change="+1"
          trend="up"
          icon={AlertTriangle}
          description="requires attention"
          variant="warning"
          href="/ai-recommendations"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Compliance Score Trend
            </CardTitle>
            <CardDescription>6-month compliance performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <AreaChart data={complianceData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Policy Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={policyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {policyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {policyDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Compliance & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Department Compliance
            </CardTitle>
            <CardDescription>Compliance scores by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentData.map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{dept.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={dept.risk === "low" ? "default" : "secondary"} className="text-xs">
                        {dept.risk} risk
                      </Badge>
                      <span className="text-sm font-semibold">{dept.compliance}%</span>
                    </div>
                  </div>
                  <Progress value={dept.compliance} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card data-tour="ai-recommendations">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
            <CardDescription>Intelligent governance suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiRecommendations.map((rec) => (
                <div key={rec.id} className="p-4 rounded-lg border bg-secondary/30 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={rec.priority === "high" ? "destructive" : "secondary"}>
                        {rec.priority}
                      </Badge>
                      <span className="font-medium text-sm">{rec.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{rec.confidence}% confidence</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    Take Action <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

           {/* Compliance Health Scorecard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-copper" />
            Compliance Health Scorecard
          </CardTitle>
          <CardDescription>Real-time C-suite governance health index</CardDescription>
        </CardHeader>
        <CardContent>
          {scorecardLoading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : scorecard ? (
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="relative flex items-center justify-center h-24 w-24 shrink-0">
                  <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke={scorecardScore >= 90 ? '#22c55e' : scorecardScore >= 70 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="10"
                      strokeDasharray={`${(scorecardScore / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-2xl font-bold leading-none">{scorecardScore}</p>
                    <p className="text-xs text-muted-foreground">/ 100</p>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {scorecard.categories?.map((cat: any) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground truncate">{cat.label}</span>
                        <span className="font-medium">{cat.score}</span>
                      </div>
                      <Progress value={cat.score} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>
              {scorecard.departments && scorecard.departments.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">DEPARTMENT STATUS</p>
                  <div className="flex flex-wrap gap-2">
                    {scorecard.departments.slice(0, 5).map((dept: any) => (
                      <Badge key={dept.id} variant={dept.trend === 'critical' ? 'destructive' : dept.trend === 'warning' ? 'secondary' : 'default'} className="text-xs">
                        {dept.name}: {dept.score}%
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Scorecard data unavailable.</p>
          )}
        </CardContent>
      </Card>

      {/* Live Compliance Simulation (Demo Feature) */}
      <LiveComplianceSimulator />

      {/* Recent Activity */}
      <Card data-tour="activity">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest governance actions across your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  activity.status === 'success' ? 'bg-green-100 text-green-600' :
                  activity.status === 'warning' ? 'bg-amber-100 text-amber-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {activity.status === 'success' ? <CheckCircle2 className="h-5 w-5" /> :
                   activity.status === 'warning' ? <AlertTriangle className="h-5 w-5" /> :
                   <FileText className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{activity.action}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground truncate">{activity.item}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {activity.user} • {activity.time}
                  </div>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  description,
  variant = "default",
  href
}: { 
  title: string; 
  value: string; 
  change: string; 
  trend: "up" | "down"; 
  icon: any; 
  description: string;
  variant?: "default" | "warning";
  href?: string;
}) {
  const [, setLocation] = useLocation();
  
  return (
    <Card 
      className={href ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
      onClick={href ? () => setLocation(href) : undefined}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <div className="flex items-center gap-1">
              {trend === "up" ? (
                <TrendingUp className={`h-4 w-4 ${variant === "warning" ? "text-amber-500" : "text-green-500"}`} />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
              <span className={`text-sm ${variant === "warning" ? "text-amber-500" : "text-green-500"}`}>{change}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </div>
          </div>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
            variant === "warning" ? "bg-amber-100" : "bg-primary/10"
          }`}>
            <Icon className={`h-6 w-6 ${variant === "warning" ? "text-amber-600" : "text-primary"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
