import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Bell, 
  Search,
  ExternalLink,
  Calendar,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Bookmark,
  Share2,
  Plus,
  Upload,
  Link,
  Loader2
} from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";

const regulatoryUpdates = [
  {
    id: 1,
    title: "FCA PS24/16: Anti-Money Laundering Amendments",
    summary: "The Financial Conduct Authority has published Policy Statement PS24/16 updating the Money Laundering, Terrorist Financing and Transfer of Funds Regulations. Key changes include enhanced customer due diligence for high-risk third countries, new beneficial ownership verification requirements, and revised suspicious activity reporting thresholds from £10,000 to £5,000 for certain transaction types.",
    regulator: "FCA",
    category: "aml",
    impactLevel: "high",
    publishedDate: "2024-12-15",
    effectiveDate: "2025-03-01",
    status: "action_required",
    affectedAreas: ["Compliance", "Operations", "Customer Service", "KYC"],
    sourceUrl: "https://www.fca.org.uk/publications/policy-statements",
    isBookmarked: true,
  },
  {
    id: 2,
    title: "ICO: UK GDPR AI Accountability Framework",
    summary: "The Information Commissioner's Office has issued comprehensive guidance under the UK General Data Protection Regulation for AI systems processing personal data. Requirements include mandatory algorithmic impact assessments, explainability documentation for automated decision-making under Article 22, and new data subject rights for AI-processed information.",
    regulator: "ICO",
    category: "data_protection",
    impactLevel: "high",
    publishedDate: "2024-12-10",
    effectiveDate: "2025-06-01",
    status: "review_pending",
    affectedAreas: ["IT", "Data Management", "Legal", "AI/ML Teams"],
    sourceUrl: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources",
    isBookmarked: true,
  },
  {
    id: 3,
    title: "PRA SS1/21: Operational Resilience - Final Rules",
    summary: "The Prudential Regulation Authority's Supervisory Statement SS1/21 on operational resilience is now fully in force. Firms must have completed mapping of important business services, set impact tolerances, and demonstrated ability to remain within tolerances during severe but plausible scenarios. Self-assessment reports due by March 2025.",
    regulator: "PRA",
    category: "operational",
    impactLevel: "high",
    publishedDate: "2024-12-05",
    effectiveDate: "2025-03-31",
    status: "action_required",
    affectedAreas: ["Operations", "IT", "Risk Management", "Business Continuity"],
    sourceUrl: "https://www.bankofengland.co.uk/prudential-regulation/publication/2021/march/operational-resilience-ss",
    isBookmarked: true,
  },
  {
    id: 4,
    title: "FCA: Sustainability Disclosure Requirements (SDR)",
    summary: "The FCA's Sustainability Disclosure Requirements and investment labels regime requires firms to use specific sustainability labels, provide detailed pre-contractual disclosures, and publish annual sustainability reports. Anti-greenwashing rule now applies to all FCA-authorised firms making sustainability claims.",
    regulator: "FCA",
    category: "esg",
    impactLevel: "medium",
    publishedDate: "2024-11-28",
    effectiveDate: "2025-07-01",
    status: "monitoring",
    affectedAreas: ["Finance", "Sustainability", "Investor Relations", "Marketing"],
    sourceUrl: "https://www.fca.org.uk/publications/policy-statements/ps23-16-sustainability-disclosure-requirements",
    isBookmarked: false,
  },
  {
    id: 5,
    title: "FCA Consumer Duty: Board Reporting Requirements",
    summary: "Under the Consumer Duty (FG22/5), firms must now produce annual board reports assessing consumer outcomes. The FCA has clarified expectations for evidence-based reporting, including metrics on price and value, consumer understanding, consumer support, and products/services meeting customer needs.",
    regulator: "FCA",
    category: "consumer_protection",
    impactLevel: "high",
    publishedDate: "2024-11-20",
    effectiveDate: "2024-12-01",
    status: "implemented",
    affectedAreas: ["Customer Service", "Product Development", "Marketing", "Board/Governance"],
    sourceUrl: "https://www.fca.org.uk/publications/finalised-guidance/fg22-5-final-non-handbook-guidance-firms-consumer-duty",
    isBookmarked: false,
  },
  {
    id: 6,
    title: "NCSC CAF 3.2: Cyber Assessment Framework Update",
    summary: "The National Cyber Security Centre has released version 3.2 of the Cyber Assessment Framework, mandatory for firms in the financial services sector. Updates include enhanced requirements for supply chain security, zero-trust architecture implementation, and incident reporting within 72 hours to both NCSC and FCA.",
    regulator: "NCSC",
    category: "cyber_security",
    impactLevel: "high",
    publishedDate: "2024-11-15",
    effectiveDate: "2025-04-01",
    status: "review_pending",
    affectedAreas: ["IT", "Security", "Third-Party Management", "Incident Response"],
    sourceUrl: "https://www.ncsc.gov.uk/collection/caf",
    isBookmarked: true,
  },
  {
    id: 7,
    title: "FCA: Senior Managers & Certification Regime Updates",
    summary: "Amendments to the Senior Managers and Certification Regime (SM&CR) introduce new prescribed responsibilities for operational resilience and climate-related financial risks. Firms must update Statements of Responsibilities and ensure appropriate training for certified persons by Q2 2025.",
    regulator: "FCA",
    category: "governance",
    impactLevel: "medium",
    publishedDate: "2024-11-10",
    effectiveDate: "2025-04-01",
    status: "review_pending",
    affectedAreas: ["HR", "Compliance", "Board/Governance", "Training"],
    sourceUrl: "https://www.fca.org.uk/firms/senior-managers-certification-regime",
    isBookmarked: false,
  },
  {
    id: 8,
    title: "PRA: Basel 3.1 Implementation Standards",
    summary: "The PRA has published near-final rules for implementing Basel 3.1 standards in the UK. Changes affect credit risk, market risk, CVA risk, and operational risk calculations. Firms must begin parallel running of new calculations from July 2025 with full implementation by January 2026.",
    regulator: "PRA",
    category: "capital",
    impactLevel: "high",
    publishedDate: "2024-11-05",
    effectiveDate: "2025-07-01",
    status: "monitoring",
    affectedAreas: ["Finance", "Risk Management", "Treasury", "Regulatory Reporting"],
    sourceUrl: "https://www.bankofengland.co.uk/prudential-regulation/publication/2023/december/implementation-of-the-basel-3-1-standards",
    isBookmarked: true,
  },
  {
    id: 9,
    title: "ICO: International Data Transfer Agreement Updates",
    summary: "Following the UK-US Data Bridge adequacy decision, the ICO has updated guidance on international data transfers. New Standard Contractual Clauses (UK SCCs) and International Data Transfer Agreement (IDTA) templates are now available for transfers to non-adequate countries.",
    regulator: "ICO",
    category: "data_protection",
    impactLevel: "medium",
    publishedDate: "2024-10-28",
    effectiveDate: "2025-01-01",
    status: "action_required",
    affectedAreas: ["Legal", "Data Management", "Procurement", "IT"],
    sourceUrl: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers",
    isBookmarked: false,
  },
  {
    id: 10,
    title: "FCA: Appointed Representatives Regime Strengthening",
    summary: "The FCA has introduced enhanced oversight requirements for principal firms under PS22/11. Principals must conduct annual reviews of AR activities, maintain detailed records of AR compliance, and report material AR issues within 7 days. Increased enforcement focus expected in 2025.",
    regulator: "FCA",
    category: "governance",
    impactLevel: "medium",
    publishedDate: "2024-10-20",
    effectiveDate: "2024-12-08",
    status: "implemented",
    affectedAreas: ["Compliance", "Legal", "Operations", "Partner Management"],
    sourceUrl: "https://www.fca.org.uk/publications/policy-statements/ps22-11-improving-appointed-representatives-regime",
    isBookmarked: false,
  },
];

const regulatorConfig: Record<string, { name: string; color: string }> = {
  FCA: { name: "Financial Conduct Authority", color: "bg-blue-100 text-blue-700" },
  PRA: { name: "Prudential Regulation Authority", color: "bg-purple-100 text-purple-700" },
  ICO: { name: "Information Commissioner's Office", color: "bg-green-100 text-green-700" },
  NCSC: { name: "National Cyber Security Centre", color: "bg-red-100 text-red-700" },
};

const categoryConfig: Record<string, string> = {
  aml: "Anti-Money Laundering",
  data_protection: "Data Protection",
  operational: "Operational",
  esg: "ESG & Sustainability",
  consumer_protection: "Consumer Protection",
  cyber_security: "Cyber Security",
  governance: "Governance",
  capital: "Capital Requirements",
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  action_required: { label: "Action Required", variant: "destructive", icon: AlertTriangle },
  review_pending: { label: "Review Pending", variant: "secondary", icon: Clock },
  monitoring: { label: "Monitoring", variant: "outline", icon: Bell },
  implemented: { label: "Implemented", variant: "default", icon: CheckCircle2 },
};

const impactConfig: Record<string, { label: string; color: string }> = {
  high: { label: "High Impact", color: "text-red-600 bg-red-50" },
  medium: { label: "Medium Impact", color: "text-amber-600 bg-amber-50" },
  low: { label: "Low Impact", color: "text-green-600 bg-green-50" },
};

export default function RegulatoryUpdates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegulator, setSelectedRegulator] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<typeof regulatoryUpdates[0] | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  
  // Bookmarks state
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set([1, 2, 3, 6, 8]));
  
  // Configure alerts state
  const [isConfigureAlertsOpen, setIsConfigureAlertsOpen] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    emailAlerts: true,
    highImpactOnly: false,
    regulators: ['FCA', 'PRA', 'ICO'],
    frequency: 'immediate'
  });
  
  // Manual regulatory upload state
  const [isAddManualOpen, setIsAddManualOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualUpdates, setManualUpdates] = useState<any[]>([]);
  const [manualForm, setManualForm] = useState({
    title: "",
    summary: "",
    regulator: "",
    category: "",
    impactLevel: "medium",
    sourceUrl: "",
    effectiveDate: "",
  });

  // Handle manual regulatory update submission
  const handleManualSubmit = async () => {
    if (!manualForm.title || !manualForm.regulator || !manualForm.category) {
      toast.error("Missing required fields", {
        description: "Please fill in title, regulator, and category."
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newUpdate = {
      id: Date.now(),
      title: manualForm.title,
      summary: manualForm.summary || "Manual entry - no summary provided",
      regulator: manualForm.regulator,
      category: manualForm.category,
      impactLevel: manualForm.impactLevel,
      publishedDate: new Date().toISOString().split('T')[0],
      effectiveDate: manualForm.effectiveDate || "TBD",
      status: "review_pending",
      affectedAreas: ["To be assessed"],
      sourceUrl: manualForm.sourceUrl || "#",
      isBookmarked: false,
      isManual: true,
    };
    
    setManualUpdates(prev => [newUpdate, ...prev]);
    setIsSubmitting(false);
    setIsAddManualOpen(false);
    setManualForm({
      title: "",
      summary: "",
      regulator: "",
      category: "",
      impactLevel: "medium",
      sourceUrl: "",
      effectiveDate: "",
    });
    
    toast.success("Regulatory update added", {
      description: `"${newUpdate.title}" has been added for review.`
    });
  };

  const handleSourceClick = (sourceUrl: string, title: string) => {
    window.open(sourceUrl, '_blank', 'noopener,noreferrer');
    toast.info("Opening Source", {
      description: `Opening regulatory source for: ${title}`,
    });
  };

  const handleReviewClick = (update: typeof regulatoryUpdates[0]) => {
    setSelectedUpdate(update);
    setReviewNotes("");
    setReviewDialogOpen(true);
  };
  
  // Handle bookmark toggle
  const handleBookmarkToggle = (updateId: number, title: string) => {
    setBookmarkedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(updateId)) {
        newSet.delete(updateId);
        toast.success("Removed from bookmarks", {
          description: `"${title}" has been removed from your saved items.`
        });
      } else {
        newSet.add(updateId);
        toast.success("Added to bookmarks", {
          description: `"${title}" has been saved for quick access.`
        });
      }
      return newSet;
    });
  };
  
  // Handle share
  const handleShare = async (update: typeof regulatoryUpdates[0]) => {
    const shareData = {
      title: update.title,
      text: `${update.title} - ${update.regulator} regulatory update effective ${update.effectiveDate}`,
      url: update.sourceUrl
    };
    
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully");
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(update);
        }
      }
    } else {
      copyToClipboard(update);
    }
  };
  
  const copyToClipboard = (update: typeof regulatoryUpdates[0]) => {
    const text = `${update.title}\n\nRegulator: ${update.regulator}\nEffective: ${update.effectiveDate}\nImpact: ${impactConfig[update.impactLevel]?.label}\n\nSource: ${update.sourceUrl}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", {
      description: "Regulatory update details have been copied to your clipboard."
    });
  };
  
  // Handle save alert settings
  const handleSaveAlertSettings = () => {
    toast.success("Alert settings saved", {
      description: `You will receive ${alertSettings.frequency} alerts for ${alertSettings.regulators.length} regulators.`
    });
    setIsConfigureAlertsOpen(false);
  };

  const handleSubmitReview = () => {
    if (selectedUpdate) {
      toast.success("Review Submitted", {
        description: `Your review for "${selectedUpdate.title}" has been recorded.`,
      });
      setReviewDialogOpen(false);
      setSelectedUpdate(null);
      setReviewNotes("");
    }
  };

  // Combine static and manual updates
  const allUpdates = [...manualUpdates, ...regulatoryUpdates];
  
  const filteredUpdates = allUpdates.filter(update => {
    const matchesSearch = update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         update.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegulator = selectedRegulator === "all" || update.regulator === selectedRegulator;
    const matchesStatus = selectedStatus === "all" || update.status === selectedStatus;
    return matchesSearch && matchesRegulator && matchesStatus;
  });

  const stats = {
    total: regulatoryUpdates.length,
    actionRequired: regulatoryUpdates.filter(u => u.status === "action_required").length,
    highImpact: regulatoryUpdates.filter(u => u.impactLevel === "high").length,
    thisMonth: regulatoryUpdates.filter(u => u.publishedDate.startsWith("2024-12")).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Regulatory Updates
          </h1>
          <p className="text-muted-foreground">Stay informed about regulatory changes affecting your business</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isConfigureAlertsOpen} onOpenChange={setIsConfigureAlertsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Configure Alerts
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configure Alert Settings
                </DialogTitle>
                <DialogDescription>
                  Set up notifications for regulatory updates that matter to your organization.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive email notifications for new updates</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={alertSettings.emailAlerts}
                    onChange={(e) => setAlertSettings(prev => ({ ...prev, emailAlerts: e.target.checked }))}
                    className="h-5 w-5 rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">High Impact Only</Label>
                    <p className="text-sm text-muted-foreground">Only notify for high-impact regulatory changes</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={alertSettings.highImpactOnly}
                    onChange={(e) => setAlertSettings(prev => ({ ...prev, highImpactOnly: e.target.checked }))}
                    className="h-5 w-5 rounded border-gray-300"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Alert Frequency</Label>
                  <Select 
                    value={alertSettings.frequency} 
                    onValueChange={(value) => setAlertSettings(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Regulators to Monitor</Label>
                  <div className="flex flex-wrap gap-2">
                    {['FCA', 'PRA', 'ICO', 'NCSC', 'BOE'].map(reg => (
                      <Badge 
                        key={reg}
                        variant={alertSettings.regulators.includes(reg) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setAlertSettings(prev => ({
                            ...prev,
                            regulators: prev.regulators.includes(reg)
                              ? prev.regulators.filter(r => r !== reg)
                              : [...prev.regulators, reg]
                          }));
                        }}
                      >
                        {reg}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConfigureAlertsOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveAlertSettings}>Save Settings</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddManualOpen} onOpenChange={setIsAddManualOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Manual Update
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Add Manual Regulatory Update
                </DialogTitle>
                <DialogDescription>
                  Manually add a government policy, regulatory statement, or new regulation that isn't captured by automated feeds.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="manual-title">Title *</Label>
                  <Input 
                    id="manual-title" 
                    placeholder="e.g., FCA PS24/XX: New Regulation Title"
                    value={manualForm.title}
                    onChange={(e) => setManualForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Source/Regulator *</Label>
                    <Select 
                      value={manualForm.regulator} 
                      onValueChange={(value) => setManualForm(prev => ({ ...prev, regulator: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select regulator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FCA">FCA - Financial Conduct Authority</SelectItem>
                        <SelectItem value="PRA">PRA - Prudential Regulation Authority</SelectItem>
                        <SelectItem value="ICO">ICO - Information Commissioner's Office</SelectItem>
                        <SelectItem value="NCSC">NCSC - National Cyber Security Centre</SelectItem>
                        <SelectItem value="BOE">Bank of England</SelectItem>
                        <SelectItem value="HMRC">HMRC</SelectItem>
                        <SelectItem value="GOV">UK Government</SelectItem>
                        <SelectItem value="EU">EU Regulatory Body</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Category *</Label>
                    <Select 
                      value={manualForm.category} 
                      onValueChange={(value) => setManualForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="manual-summary">Summary</Label>
                  <Textarea 
                    id="manual-summary" 
                    placeholder="Brief description of the regulatory update and its implications..."
                    rows={3}
                    value={manualForm.summary}
                    onChange={(e) => setManualForm(prev => ({ ...prev, summary: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Impact Level</Label>
                    <Select 
                      value={manualForm.impactLevel} 
                      onValueChange={(value) => setManualForm(prev => ({ ...prev, impactLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select impact" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Impact</SelectItem>
                        <SelectItem value="medium">Medium Impact</SelectItem>
                        <SelectItem value="low">Low Impact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="manual-effective">Effective Date</Label>
                    <Input 
                      id="manual-effective" 
                      type="date"
                      value={manualForm.effectiveDate}
                      onChange={(e) => setManualForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="manual-url" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Source URL
                  </Label>
                  <Input 
                    id="manual-url" 
                    placeholder="https://www.fca.org.uk/publications/..."
                    value={manualForm.sourceUrl}
                    onChange={(e) => setManualForm(prev => ({ ...prev, sourceUrl: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Link to the official regulatory document or announcement</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddManualOpen(false)}>Cancel</Button>
                <Button onClick={handleManualSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Regulatory Update'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Updates</p>
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
                <p className="text-sm text-muted-foreground">Action Required</p>
                <p className="text-2xl font-bold text-red-600">{stats.actionRequired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Impact</p>
                <p className="text-2xl font-bold text-amber-600">{stats.highImpact}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search regulatory updates..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedRegulator} onValueChange={setSelectedRegulator}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Regulators" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regulators</SelectItem>
                {Object.keys(regulatorConfig).map(key => (
                  <SelectItem key={key} value={key}>{key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Updates List */}
      <div className="space-y-4">
        {filteredUpdates.map((update) => {
          const StatusIcon = statusConfig[update.status]?.icon || Bell;
          return (
            <Card key={update.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${regulatorConfig[update.regulator]?.color}`}>
                            {update.regulator}
                          </span>
                          <Badge variant={statusConfig[update.status]?.variant}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[update.status]?.label}
                          </Badge>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${impactConfig[update.impactLevel]?.color}`}>
                            {impactConfig[update.impactLevel]?.label}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg">{update.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={bookmarkedIds.has(update.id) ? "text-amber-500" : ""}
                          onClick={() => handleBookmarkToggle(update.id, update.title)}
                          title={bookmarkedIds.has(update.id) ? "Remove from bookmarks" : "Add to bookmarks"}
                        >
                          <Bookmark className={`h-4 w-4 ${bookmarkedIds.has(update.id) ? "fill-current" : ""}`} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleShare(update)}
                          title="Share this update"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-2">{update.summary}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Published: {update.publishedDate}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Effective: {update.effectiveDate}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="text-xs text-muted-foreground">Affected Areas:</span>
                      {update.affectedAreas.map((area: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex md:flex-col gap-2 md:w-32">
                    <Button size="sm" className="flex-1" onClick={() => handleReviewClick(update)}>
                      Review
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSourceClick(update.sourceUrl, update.title)}>
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Source
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Regulatory Update</DialogTitle>
            <DialogDescription>
              {selectedUpdate?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Regulator:</span>
                <span className="ml-2 font-medium">{selectedUpdate?.regulator}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Impact:</span>
                <span className="ml-2 font-medium">{selectedUpdate?.impactLevel}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Published:</span>
                <span className="ml-2 font-medium">{selectedUpdate?.publishedDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Effective:</span>
                <span className="ml-2 font-medium">{selectedUpdate?.effectiveDate}</span>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-4">{selectedUpdate?.summary}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-notes">Review Notes</Label>
              <Textarea
                id="review-notes"
                placeholder="Add your review notes, action items, or comments..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Mark as</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success("Marked as Reviewed", { description: "Update status changed to reviewed" });
                  setReviewDialogOpen(false);
                }}>Reviewed</Button>
                <Button variant="outline" size="sm" onClick={() => {
                  toast.info("Action Required", { description: "Update flagged for action" });
                  setReviewDialogOpen(false);
                }}>Action Required</Button>
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success("Implemented", { description: "Update marked as implemented" });
                  setReviewDialogOpen(false);
                }}>Implemented</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitReview}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
