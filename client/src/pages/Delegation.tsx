import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GitBranch, 
  Plus, 
  Search,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Building2,
  FileText,
  ShieldCheck
} from "lucide-react";

const delegations = [
  {
    id: 1,
    title: "Financial Approval Authority",
    type: "financial",
    delegator: "CEO - John Smith",
    delegatee: "CFO - Sarah Chen",
    threshold: "£500,000",
    status: "active",
    effectiveFrom: "2024-01-01",
    effectiveTo: "2025-12-31",
    conditions: "All expenditures above £100,000 require board notification",
  },
  {
    id: 2,
    title: "Contract Signing Authority",
    type: "contractual",
    delegator: "CFO - Sarah Chen",
    delegatee: "Head of Procurement - Emma Davis",
    threshold: "£100,000",
    status: "active",
    effectiveFrom: "2024-03-15",
    effectiveTo: "2025-03-14",
    conditions: "Vendor contracts only, excluding employment contracts",
  },
  {
    id: 3,
    title: "IT Procurement Authority",
    type: "procurement",
    delegator: "CFO - Sarah Chen",
    delegatee: "CTO - James Wilson",
    threshold: "£50,000",
    status: "active",
    effectiveFrom: "2024-06-01",
    effectiveTo: "2025-05-31",
    conditions: "Technology and software purchases only",
  },
  {
    id: 4,
    title: "HR Hiring Authority",
    type: "hr",
    delegator: "CEO - John Smith",
    delegatee: "HR Director - Lisa Johnson",
    threshold: "£75,000 annual salary",
    status: "pending",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2025-12-31",
    conditions: "Non-executive positions only",
  },
  {
    id: 5,
    title: "Compliance Exception Authority",
    type: "compliance",
    delegator: "Board of Directors",
    delegatee: "Chief Compliance Officer - Michael Brown",
    threshold: "N/A",
    status: "active",
    effectiveFrom: "2024-01-01",
    effectiveTo: "2025-12-31",
    conditions: "Minor compliance exceptions only, major exceptions require board approval",
  },
];

const pendingApprovals = [
  {
    id: 1,
    title: "Software License Renewal - Microsoft 365",
    type: "procurement",
    requester: "IT Department",
    amount: "£45,000",
    status: "pending",
    dueDate: "2024-12-28",
    priority: "high",
  },
  {
    id: 2,
    title: "Marketing Campaign Budget",
    type: "financial",
    requester: "Marketing Department",
    amount: "£125,000",
    status: "pending",
    dueDate: "2024-12-30",
    priority: "medium",
  },
  {
    id: 3,
    title: "New Hire - Senior Developer",
    type: "hr",
    requester: "Engineering Department",
    amount: "£85,000 annual",
    status: "escalated",
    dueDate: "2025-01-05",
    priority: "high",
  },
];

const authorityMatrix = [
  { role: "CEO", financial: "Unlimited", contracts: "Unlimited", hr: "All positions", procurement: "Unlimited" },
  { role: "CFO", financial: "£500,000", contracts: "£250,000", hr: "Finance team", procurement: "£100,000" },
  { role: "CTO", financial: "£50,000", contracts: "£50,000", hr: "Tech team", procurement: "£50,000" },
  { role: "Department Heads", financial: "£25,000", contracts: "£10,000", hr: "Own team", procurement: "£25,000" },
  { role: "Managers", financial: "£5,000", contracts: "N/A", hr: "N/A", procurement: "£5,000" },
];

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  financial: { label: "Financial", icon: DollarSign, color: "text-green-600 bg-green-50" },
  contractual: { label: "Contractual", icon: FileText, color: "text-blue-600 bg-blue-50" },
  procurement: { label: "Procurement", icon: Building2, color: "text-purple-600 bg-purple-50" },
  hr: { label: "HR", icon: Users, color: "text-orange-600 bg-orange-50" },
  compliance: { label: "Compliance", icon: ShieldCheck, color: "text-red-600 bg-red-50" },
};

export default function Delegation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [demoDelegations, setDemoDelegations] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    threshold: '',
    delegator: '',
    delegatee: '',
    effectiveFrom: '',
    effectiveTo: '',
  });

  // Combine static delegations with demo-created ones
  const allDelegations = [...delegations, ...demoDelegations];

  const filteredDelegations = allDelegations.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.delegatee.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="h-6 w-6" />
            Delegation of Authority
          </h1>
          <p className="text-muted-foreground">Manage approval chains and authority matrices</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Delegation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Delegation</DialogTitle>
              <DialogDescription>
                Define a new delegation of authority
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Delegation Title</Label>
                <Input id="title" placeholder="Enter delegation title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Authority Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Threshold Amount</Label>
                  <Input placeholder="e.g., £50,000" value={formData.threshold} onChange={(e) => setFormData(prev => ({ ...prev, threshold: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Delegator (From)</Label>
                  <Select value={formData.delegator} onValueChange={(value) => setFormData(prev => ({ ...prev, delegator: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delegator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CEO - John Smith">CEO - John Smith</SelectItem>
                      <SelectItem value="CFO - Sarah Chen">CFO - Sarah Chen</SelectItem>
                      <SelectItem value="CTO - James Wilson">CTO - James Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Delegatee (To)</Label>
                  <Select value={formData.delegatee} onValueChange={(value) => setFormData(prev => ({ ...prev, delegatee: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delegatee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CFO - Sarah Chen">CFO - Sarah Chen</SelectItem>
                      <SelectItem value="CTO - James Wilson">CTO - James Wilson</SelectItem>
                      <SelectItem value="HR Director - Lisa Johnson">HR Director - Lisa Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Effective From</Label>
                  <Input type="date" value={formData.effectiveFrom} onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Effective To</Label>
                  <Input type="date" value={formData.effectiveTo} onChange={(e) => setFormData(prev => ({ ...prev, effectiveTo: e.target.value }))} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                if (formData.title && formData.type) {
                  setDemoDelegations(prev => [...prev, {
                    id: Date.now(),
                    title: formData.title || 'New Delegation',
                    type: formData.type || 'financial',
                    delegator: formData.delegator || 'CEO - John Smith',
                    delegatee: formData.delegatee || 'CFO - Sarah Chen',
                    threshold: formData.threshold || '£25,000',
                    status: 'active',
                    effectiveFrom: formData.effectiveFrom || new Date().toISOString().split('T')[0],
                    effectiveTo: formData.effectiveTo || '2026-12-31',
                    conditions: 'Demo delegation created via form',
                  }]);
                  setFormData({ title: '', type: '', threshold: '', delegator: '', delegatee: '', effectiveFrom: '', effectiveTo: '' });
                }
                setIsCreateOpen(false);
              }}>Create Delegation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Delegations</p>
                <p className="text-2xl font-bold text-green-600">{delegations.filter(d => d.status === "active").length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold text-amber-600">{pendingApprovals.length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Escalated</p>
                <p className="text-2xl font-bold text-red-600">{pendingApprovals.filter(a => a.status === "escalated").length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Authority Levels</p>
                <p className="text-2xl font-bold">{authorityMatrix.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="delegations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="delegations">Delegations</TabsTrigger>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="matrix">Authority Matrix</TabsTrigger>
        </TabsList>

        {/* Delegations Tab */}
        <TabsContent value="delegations">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Active Delegations</CardTitle>
                  <CardDescription>View and manage delegation of authority records</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search delegations..."
                    className="pl-9 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDelegations.map((delegation) => {
                  const TypeIcon = typeConfig[delegation.type]?.icon || FileText;
                  return (
                    <div key={delegation.id} className="p-4 border rounded-lg hover:bg-secondary/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${typeConfig[delegation.type]?.color}`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{delegation.title}</h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <span>{delegation.delegator}</span>
                              <ArrowRight className="h-3 w-3" />
                              <span>{delegation.delegatee}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">{delegation.conditions}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={delegation.status === "active" ? "default" : "secondary"}>
                            {delegation.status}
                          </Badge>
                          <p className="text-sm font-semibold mt-2">{delegation.threshold}</p>
                          <p className="text-xs text-muted-foreground">
                            {delegation.effectiveFrom} - {delegation.effectiveTo}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Approvals Tab */}
        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Requests awaiting your approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((approval) => {
                  const TypeIcon = typeConfig[approval.type]?.icon || FileText;
                  return (
                    <div key={approval.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${typeConfig[approval.type]?.color}`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{approval.title}</h3>
                            <p className="text-sm text-muted-foreground">{approval.requester}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={approval.status === "escalated" ? "destructive" : "secondary"}>
                                {approval.status}
                              </Badge>
                              <Badge variant={approval.priority === "high" ? "destructive" : "outline"}>
                                {approval.priority} priority
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{approval.amount}</p>
                          <p className="text-xs text-muted-foreground">Due: {approval.dueDate}</p>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline">Reject</Button>
                            <Button size="sm">Approve</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authority Matrix Tab */}
        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle>Authority Matrix</CardTitle>
              <CardDescription>Approval thresholds by role and category</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Financial</TableHead>
                    <TableHead>Contracts</TableHead>
                    <TableHead>HR/Hiring</TableHead>
                    <TableHead>Procurement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authorityMatrix.map((row) => (
                    <TableRow key={row.role}>
                      <TableCell className="font-medium">{row.role}</TableCell>
                      <TableCell>{row.financial}</TableCell>
                      <TableCell>{row.contracts}</TableCell>
                      <TableCell>{row.hr}</TableCell>
                      <TableCell>{row.procurement}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
