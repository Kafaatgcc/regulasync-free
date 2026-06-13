import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Zap,
  Sparkles,
  Upload,
  File,
  Loader2,
  UserCheck,
  PenLine
} from "lucide-react";
import PolicyCreator from "@/components/PolicyCreator";
import { toast } from "sonner";

const policies = [
  {
    id: 1,
    title: "Anti-Money Laundering (AML) Policy",
    category: "compliance",
    status: "active",
    priority: "critical",
    owner: "Sarah Chen",
    department: "Compliance",
    lastUpdated: "2024-12-15",
    complianceScore: 98,
    automationEnabled: true,
  },
  {
    id: 2,
    title: "Data Protection & GDPR Policy",
    category: "data_protection",
    status: "active",
    priority: "high",
    owner: "Michael Brown",
    department: "Legal",
    lastUpdated: "2024-12-10",
    complianceScore: 95,
    automationEnabled: true,
  },
  {
    id: 3,
    title: "Information Security Policy",
    category: "it_security",
    status: "active",
    priority: "high",
    owner: "James Wilson",
    department: "IT",
    lastUpdated: "2024-11-28",
    complianceScore: 92,
    automationEnabled: false,
  },
  {
    id: 4,
    title: "Procurement & Vendor Management",
    category: "operational",
    status: "pending_review",
    priority: "medium",
    owner: "Emma Davis",
    department: "Operations",
    lastUpdated: "2024-12-18",
    complianceScore: 88,
    automationEnabled: false,
  },
  {
    id: 5,
    title: "Employee Code of Conduct",
    category: "hr",
    status: "active",
    priority: "medium",
    owner: "Lisa Johnson",
    department: "HR",
    lastUpdated: "2024-10-05",
    complianceScore: 96,
    automationEnabled: true,
  },
  {
    id: 6,
    title: "Financial Reporting Standards",
    category: "financial",
    status: "draft",
    priority: "high",
    owner: "Robert Taylor",
    department: "Finance",
    lastUpdated: "2024-12-20",
    complianceScore: 0,
    automationEnabled: false,
  },
  {
    id: 7,
    title: "Business Continuity Plan",
    category: "risk_management",
    status: "active",
    priority: "critical",
    owner: "David Lee",
    department: "Operations",
    lastUpdated: "2024-11-15",
    complianceScore: 91,
    automationEnabled: true,
  },
  {
    id: 8,
    title: "Environmental Sustainability Policy",
    category: "environmental",
    status: "pending_review",
    priority: "low",
    owner: "Anna White",
    department: "Operations",
    lastUpdated: "2024-12-01",
    complianceScore: 85,
    automationEnabled: false,
  },
];

const categoryLabels: Record<string, string> = {
  compliance: "Compliance",
  data_protection: "Data Protection",
  it_security: "IT Security",
  operational: "Operational",
  hr: "HR",
  financial: "Financial",
  risk_management: "Risk Management",
  environmental: "Environmental",
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  pending_review: { label: "Pending Review", variant: "secondary" },
  draft: { label: "Draft", variant: "outline" },
  archived: { label: "Archived", variant: "outline" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "text-red-600 bg-red-50" },
  high: { label: "High", color: "text-orange-600 bg-orange-50" },
  medium: { label: "Medium", color: "text-blue-600 bg-blue-50" },
  low: { label: "Low", color: "text-gray-600 bg-gray-50" },
};

// Approvers list
const approvers = [
  { id: "ceo", name: "John Smith", role: "CEO" },
  { id: "cfo", name: "Sarah Chen", role: "CFO" },
  { id: "coo", name: "Michael Brown", role: "COO" },
  { id: "cro", name: "Emma Davis", role: "Chief Risk Officer" },
  { id: "cco", name: "James Wilson", role: "Chief Compliance Officer" },
  { id: "ciso", name: "Lisa Johnson", role: "CISO" },
];

export default function Policies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAICreatorOpen, setIsAICreatorOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [demoPolicies, setDemoPolicies] = useState<any[]>([]);
  const [createTab, setCreateTab] = useState<string>("scratch");
  const [selectedApprover, setSelectedApprover] = useState<string>("");

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  // Process uploaded document
  const processUpload = async () => {
    if (!uploadedFile) return;
    
    setIsUploading(true);
    
    // Simulate processing (in production, this would upload to S3 and analyze)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a new policy from the uploaded document
    const newPolicy = {
      id: Date.now(),
      title: uploadedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      category: "compliance",
      status: "draft",
      priority: "medium",
      owner: "Demo User",
      department: "Compliance",
      lastUpdated: new Date().toISOString().split('T')[0],
      complianceScore: 0,
      automationEnabled: false,
      source: "uploaded",
      fileName: uploadedFile.name,
    };
    
    setDemoPolicies(prev => [...prev, newPolicy]);
    setIsUploading(false);
    setUploadedFile(null);
    setIsCreateOpen(false);
    setSelectedApprover("");
    
    const approverName = approvers.find(a => a.id === selectedApprover)?.name || "pending assignment";
    toast.success('Document uploaded successfully!', {
      description: `"${newPolicy.title}" has been added and assigned to ${approverName} for approval.`
    });
  };

  // Combine static policies with demo-created policies
  const allPolicies = [...policies, ...demoPolicies];
  
  const filteredPolicies = allPolicies.filter(policy =>
    policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    policy.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: allPolicies.length,
    active: allPolicies.filter(p => p.status === "active").length,
    pendingReview: allPolicies.filter(p => p.status === "pending_review").length,
    draft: allPolicies.filter(p => p.status === "draft").length,
    automated: allPolicies.filter(p => p.automationEnabled).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Policy Management
          </h1>
          <p className="text-muted-foreground">Create, manage, and automate organizational policies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAICreatorOpen(true)}>
            <Sparkles className="h-4 w-4 mr-2 text-copper" />
            AI Create
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setUploadedFile(null);
              setSelectedApprover("");
              setCreateTab("scratch");
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Policy
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Policy</DialogTitle>
              <DialogDescription>
                Create a new policy from scratch or upload an existing document
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={createTab} onValueChange={setCreateTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="scratch" className="flex items-center gap-2">
                  <PenLine className="h-4 w-4" />
                  Create from Scratch
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </TabsTrigger>
              </TabsList>
              
              {/* Create from Scratch Tab */}
              <TabsContent value="scratch" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Policy Title</Label>
                  <Input id="title" placeholder="Enter policy title" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Enter policy description" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department Scope</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="owner">Policy Owner</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sarah">Sarah Chen</SelectItem>
                        <SelectItem value="michael">Michael Brown</SelectItem>
                        <SelectItem value="james">James Wilson</SelectItem>
                        <SelectItem value="emma">Emma Davis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Approver Selection */}
                <div className="grid gap-2 pt-2 border-t">
                  <Label htmlFor="approver" className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Assign Approver
                  </Label>
                  <Select value={selectedApprover} onValueChange={setSelectedApprover}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select who will approve this policy" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvers.map((approver) => (
                        <SelectItem key={approver.id} value={approver.id}>
                          {approver.name} - {approver.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">The selected approver will be notified to review and approve this policy.</p>
                </div>
              </TabsContent>
              
              {/* Upload Document Tab */}
              <TabsContent value="upload" className="space-y-4 mt-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="policy-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.md"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="policy-upload" className="cursor-pointer">
                    {uploadedFile ? (
                      <div className="space-y-2">
                        <File className="h-10 w-10 mx-auto text-primary" />
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); setUploadedFile(null); }}>
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="font-medium">Click to upload or drag and drop</p>
                        <p className="text-sm text-muted-foreground">
                          PDF, Word, or text files up to 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                
                {/* Category and Priority for uploaded docs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Approver Selection for uploaded docs */}
                <div className="grid gap-2 pt-2 border-t">
                  <Label className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Assign Approver
                  </Label>
                  <Select value={selectedApprover} onValueChange={setSelectedApprover}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select who will approve this policy" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvers.map((approver) => (
                        <SelectItem key={approver.id} value={approver.id}>
                          {approver.name} - {approver.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">The selected approver will be notified to review and approve this policy.</p>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              {createTab === "scratch" ? (
                <Button onClick={() => {
                  setIsCreateOpen(false);
                  const approverName = approvers.find(a => a.id === selectedApprover)?.name;
                  toast.success('Policy created successfully!', {
                    description: approverName ? `Assigned to ${approverName} for approval.` : 'Policy saved as draft.'
                  });
                }}>Create Policy</Button>
              ) : (
                <Button onClick={processUpload} disabled={!uploadedFile || isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Upload & Analyze'
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Policies</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pendingReview}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Automated</p>
                <p className="text-2xl font-bold text-primary">{stats.automated}</p>
              </div>
              <Zap className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Policies</CardTitle>
              <CardDescription>Manage and monitor your organizational policies</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  className="pl-9 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Automation</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{policy.title}</p>
                      <p className="text-xs text-muted-foreground">Updated {policy.lastUpdated}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{categoryLabels[policy.category]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[policy.status].variant}>
                      {statusConfig[policy.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[policy.priority].color}`}>
                      {priorityConfig[policy.priority].label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{policy.owner}</p>
                      <p className="text-xs text-muted-foreground">{policy.department}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {policy.complianceScore > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              policy.complianceScore >= 90 ? 'bg-green-500' :
                              policy.complianceScore >= 70 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${policy.complianceScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{policy.complianceScore}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {policy.automationEnabled ? (
                      <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
                        <Zap className="h-3 w-3 mr-1" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Disabled
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Policy
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileCheck className="h-4 w-4 mr-2" />
                          Review Compliance
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* AI Policy Creator */}
      <PolicyCreator 
        open={isAICreatorOpen} 
        onOpenChange={setIsAICreatorOpen}
        onPolicyCreated={(policy) => {
          setDemoPolicies(prev => [...prev, {
            id: Date.now(),
            title: policy.name,
            category: policy.category,
            status: 'draft',
            priority: 'high',
            owner: policy.owner,
            department: policy.owner,
            lastUpdated: new Date().toISOString().split('T')[0],
            complianceScore: policy.complianceScore,
            automationEnabled: false,
          }]);
        }}
      />
    </div>
  );
}
