import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Wand2,
  Shield,
  Clock,
  Users,
  Upload,
  PenLine,
  File,
  UserCheck
} from 'lucide-react';

interface PolicyCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPolicyCreated?: (policy: CreatedPolicy) => void;
}

interface CreatedPolicy {
  id: string;
  name: string;
  category: string;
  description: string;
  owner: string;
  reviewCycle: string;
  complianceScore: number;
  aiSuggestions: string[];
}

const policyTemplates = [
  { value: 'aml', label: 'Anti-Money Laundering (AML)', icon: Shield },
  { value: 'data-protection', label: 'Data Protection & GDPR', icon: Shield },
  { value: 'operational-resilience', label: 'Operational Resilience', icon: Clock },
  { value: 'conduct-risk', label: 'Conduct Risk', icon: Users },
  { value: 'cyber-security', label: 'Cyber Security', icon: Shield },
  { value: 'custom', label: 'Custom Policy', icon: FileText },
];

const existingPolicies = [
  { id: 'pol-1', name: 'Anti-Money Laundering (AML) Policy', category: 'compliance' },
  { id: 'pol-2', name: 'Data Protection & GDPR Policy', category: 'data_protection' },
  { id: 'pol-3', name: 'Information Security Policy', category: 'it_security' },
  { id: 'pol-4', name: 'Procurement & Vendor Management', category: 'operational' },
  { id: 'pol-5', name: 'Employee Code of Conduct', category: 'hr' },
  { id: 'pol-6', name: 'Financial Reporting Standards', category: 'financial' },
  { id: 'pol-7', name: 'Business Continuity Plan', category: 'risk_management' },
];

const departments = [
  'Compliance',
  'Risk Management',
  'Legal',
  'Operations',
  'IT Security',
  'Finance',
  'HR',
];

const approvers = [
  { id: 'ceo', name: 'CEO - John Smith', role: 'Chief Executive Officer' },
  { id: 'cfo', name: 'CFO - Sarah Chen', role: 'Chief Financial Officer' },
  { id: 'cco', name: 'CCO - Michael Brown', role: 'Chief Compliance Officer' },
  { id: 'cro', name: 'CRO - Emma Davis', role: 'Chief Risk Officer' },
  { id: 'ciso', name: 'CISO - James Wilson', role: 'Chief Information Security Officer' },
  { id: 'legal', name: 'General Counsel - Robert Taylor', role: 'Head of Legal' },
];

const reviewCycles = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi-annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' },
];

export default function PolicyCreator({ open, onOpenChange, onPolicyCreated }: PolicyCreatorProps) {
  const [activeTab, setActiveTab] = useState('create');
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedApprover, setSelectedApprover] = useState('');
  const [selectedExistingPolicy, setSelectedExistingPolicy] = useState('');
  const [enhanceInstructions, setEnhanceInstructions] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    template: '',
    name: '',
    description: '',
    owner: '',
    reviewCycle: 'quarterly',
  });
  const [generatedPolicy, setGeneratedPolicy] = useState<CreatedPolicy | null>(null);

  const handleTemplateSelect = (template: string) => {
    setFormData(prev => ({ ...prev, template }));
    
    // Auto-fill based on template
    const templateNames: Record<string, string> = {
      'aml': 'Anti-Money Laundering Policy',
      'data-protection': 'Data Protection & Privacy Policy',
      'operational-resilience': 'Operational Resilience Framework',
      'conduct-risk': 'Conduct Risk Management Policy',
      'cyber-security': 'Cyber Security Policy',
      'custom': '',
    };
    
    const templateDescriptions: Record<string, string> = {
      'aml': 'Comprehensive policy for detecting, preventing, and reporting money laundering activities in compliance with UK regulations.',
      'data-protection': 'Framework for handling personal data in accordance with UK GDPR and Data Protection Act 2018.',
      'operational-resilience': 'Policy ensuring critical business services can withstand and recover from operational disruptions.',
      'conduct-risk': 'Guidelines for managing risks arising from employee and firm conduct that could harm customers or market integrity.',
      'cyber-security': 'Security controls and procedures to protect information assets from cyber threats.',
      'custom': '',
    };
    
    setFormData(prev => ({
      ...prev,
      template,
      name: templateNames[template] || '',
      description: templateDescriptions[template] || '',
    }));
    
    setStep(2);
  };

  const handleGeneratePolicy = async () => {
    setIsGenerating(true);
    
    // Simulate AI policy generation
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const aiSuggestions = [
      'Add specific reporting thresholds aligned with FCA requirements',
      'Include escalation procedures for high-risk scenarios',
      'Reference latest regulatory guidance from Q4 2025',
      'Add training requirements for relevant staff',
      'Include metrics for measuring policy effectiveness',
    ];
    
    const policy: CreatedPolicy = {
      id: `POL-${Date.now()}`,
      name: formData.name,
      category: formData.template,
      description: formData.description,
      owner: formData.owner,
      reviewCycle: formData.reviewCycle,
      complianceScore: Math.floor(Math.random() * 15) + 85, // 85-100
      aiSuggestions: aiSuggestions.slice(0, 3),
    };
    
    setGeneratedPolicy(policy);
    setIsGenerating(false);
    setStep(3);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!uploadedFile) return;
    
    setIsUploading(true);
    
    // Simulate upload and AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const policy: CreatedPolicy = {
      id: `POL-${Date.now()}`,
      name: uploadedFile.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      category: 'uploaded',
      description: 'Policy uploaded and analyzed by AI for regulatory compliance.',
      owner: formData.owner || 'Compliance',
      reviewCycle: 'quarterly',
      complianceScore: Math.floor(Math.random() * 20) + 75, // 75-95
      aiSuggestions: [
        'Update section 3.2 to align with latest FCA guidance',
        'Add explicit reference to PRA operational resilience requirements',
        'Include data retention periods as per UK GDPR',
      ],
    };
    
    setGeneratedPolicy(policy);
    setIsUploading(false);
    setStep(3);
    
    toast.success('Document analyzed successfully!', {
      description: 'AI has reviewed your policy and identified improvement areas.',
    });
  };

  const handleEnhancePolicy = async () => {
    if (!selectedExistingPolicy) return;
    
    setIsGenerating(true);
    
    // Simulate AI enhancement
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const existingPolicy = existingPolicies.find(p => p.id === selectedExistingPolicy);
    
    const policy: CreatedPolicy = {
      id: `POL-${Date.now()}`,
      name: `${existingPolicy?.name} (Enhanced)`,
      category: existingPolicy?.category || 'enhanced',
      description: enhanceInstructions || 'Policy enhanced with AI recommendations for improved regulatory compliance.',
      owner: formData.owner || 'Compliance',
      reviewCycle: 'quarterly',
      complianceScore: Math.floor(Math.random() * 10) + 90, // 90-100
      aiSuggestions: [
        'Added new sections for emerging regulatory requirements',
        'Updated language to reflect current best practices',
        'Enhanced risk assessment criteria based on latest guidance',
      ],
    };
    
    setGeneratedPolicy(policy);
    setIsGenerating(false);
    setStep(3);
    
    toast.success('Policy enhanced successfully!', {
      description: 'AI has improved your existing policy with latest regulatory insights.',
    });
  };

  const handleComplete = () => {
    if (generatedPolicy) {
      onPolicyCreated?.(generatedPolicy);
      toast.success('Policy created successfully!', {
        description: `${generatedPolicy.name} has been added to your policy library.`,
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setActiveTab('create');
    setFormData({
      template: '',
      name: '',
      description: '',
      owner: '',
      reviewCycle: 'quarterly',
    });
    setGeneratedPolicy(null);
    setUploadedFile(null);
    setSelectedApprover('');
    setSelectedExistingPolicy('');
    setEnhanceInstructions('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-copper" />
            AI Policy Creator
          </DialogTitle>
          <DialogDescription>
            Create new policies, upload existing documents, or enhance current policies with AI assistance.
          </DialogDescription>
        </DialogHeader>

        {step < 3 && (
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setStep(1); }} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <PenLine className="h-4 w-4" />
                Create New
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Document
              </TabsTrigger>
              <TabsTrigger value="enhance" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Enhance Existing
              </TabsTrigger>
            </TabsList>

            {/* CREATE NEW TAB */}
            <TabsContent value="create" className="mt-4">
              {/* Step 1: Template Selection */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Select a template or create a custom policy with AI assistance.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {policyTemplates.map((template) => {
                      const Icon = template.icon;
                      return (
                        <Card 
                          key={template.value}
                          className={`cursor-pointer transition-all hover:border-copper hover:shadow-md ${
                            formData.template === template.value ? 'border-copper bg-copper/5' : ''
                          }`}
                          onClick={() => handleTemplateSelect(template.value)}
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-navy/10">
                              <Icon className="w-5 h-5 text-navy" />
                            </div>
                            <span className="font-medium text-sm">{template.label}</span>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Policy Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Policy Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter policy name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the policy purpose and scope"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="owner">Policy Owner</Label>
                      <Select 
                        value={formData.owner} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, owner: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reviewCycle">Review Cycle</Label>
                      <Select 
                        value={formData.reviewCycle} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, reviewCycle: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {reviewCycles.map((cycle) => (
                            <SelectItem key={cycle.value} value={cycle.value}>{cycle.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
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
                            {approver.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">The selected approver will be notified to review and approve this policy.</p>
                  </div>

                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-3 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800">AI Enhancement</p>
                        <p className="text-amber-700">Our AI will analyze your policy against current UK regulations and suggest improvements.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* UPLOAD DOCUMENT TAB */}
            <TabsContent value="upload" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Upload an existing policy document for AI analysis and enhancement.</p>
                
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-copper transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <File className="h-12 w-12 text-copper" />
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">PDF, Word, or text files up to 10MB</p>
                    </div>
                  )}
                </div>

                {uploadedFile && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={formData.template} onValueChange={(v) => setFormData(prev => ({ ...prev, template: v }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {policyTemplates.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Policy Owner</Label>
                        <Select value={formData.owner} onValueChange={(v) => setFormData(prev => ({ ...prev, owner: v }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select owner" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
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
                              {approver.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-3 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800">AI Document Analysis</p>
                      <p className="text-blue-700">Our AI will extract key information, check regulatory compliance, and suggest improvements.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ENHANCE EXISTING TAB */}
            <TabsContent value="enhance" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Select an existing policy to enhance with AI-powered recommendations.</p>
                
                <div className="space-y-2">
                  <Label>Select Policy to Enhance</Label>
                  <Select value={selectedExistingPolicy} onValueChange={setSelectedExistingPolicy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an existing policy" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingPolicies.map((policy) => (
                        <SelectItem key={policy.id} value={policy.id}>
                          {policy.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedExistingPolicy && (
                  <>
                    <div className="space-y-2">
                      <Label>Enhancement Instructions (Optional)</Label>
                      <Textarea
                        value={enhanceInstructions}
                        onChange={(e) => setEnhanceInstructions(e.target.value)}
                        placeholder="Describe specific areas to improve or update (e.g., 'Update to comply with latest FCA guidance on operational resilience')"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Assign Approver for Enhanced Version
                      </Label>
                      <Select value={selectedApprover} onValueChange={setSelectedApprover}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select who will approve the enhanced policy" />
                        </SelectTrigger>
                        <SelectContent>
                          {approvers.map((approver) => (
                            <SelectItem key={approver.id} value={approver.id}>
                              {approver.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-3 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-purple-800">AI Policy Enhancement</p>
                      <p className="text-purple-700">Our AI will analyze your policy against current regulations and suggest targeted improvements.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Step 3: Generated Policy (shared across all tabs) */}
        {step === 3 && generatedPolicy && (
          <div className="space-y-4 py-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Policy Generated Successfully</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Policy ID:</span>
                    <span className="font-mono">{generatedPolicy.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{generatedPolicy.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner:</span>
                    <span>{generatedPolicy.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Review Cycle:</span>
                    <Badge variant="outline">{generatedPolicy.reviewCycle}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Initial Compliance Score:</span>
                    <Badge className="bg-green-600">{generatedPolicy.complianceScore}%</Badge>
                  </div>
                  {selectedApprover && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Assigned Approver:</span>
                      <span>{approvers.find(a => a.id === selectedApprover)?.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-copper" />
                  <span className="font-semibold">AI Recommendations</span>
                </div>
                <ul className="space-y-2">
                  {generatedPolicy.aiSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          {step === 1 && activeTab === 'create' && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {step === 2 && activeTab === 'create' && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button 
                onClick={handleGeneratePolicy}
                disabled={!formData.name || !formData.owner || isGenerating}
                className="bg-copper hover:bg-copper/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
            </>
          )}
          {activeTab === 'upload' && step < 3 && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button 
                onClick={handleUploadAndAnalyze}
                disabled={!uploadedFile || isUploading}
                className="bg-copper hover:bg-copper/90"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Analyze
                  </>
                )}
              </Button>
            </>
          )}
          {activeTab === 'enhance' && step < 3 && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button 
                onClick={handleEnhancePolicy}
                disabled={!selectedExistingPolicy || isGenerating}
                className="bg-copper hover:bg-copper/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Enhance with AI
                  </>
                )}
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button variant="outline" onClick={() => setStep(activeTab === 'create' ? 2 : 1)}>Edit Details</Button>
              <Button onClick={handleComplete} className="bg-navy hover:bg-navy/90">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Add to Policy Library
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
