import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  MessageSquare,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Star,
  StarOff,
  Trash2,
  Download
} from "lucide-react";
import { toast } from 'sonner';

// Demo contact submissions data
const demoContacts = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@barclays.co.uk",
    company: "Barclays PLC",
    phone: "+44 20 7116 1234",
    inquiryType: "demo",
    subject: "Enterprise Demo Request",
    message: "We're looking to implement a governance automation solution across our compliance department. Would like to schedule a demo for our team of 15 compliance officers.",
    status: "new",
    priority: "high",
    createdAt: "2026-01-01T09:30:00Z",
    notes: ""
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "m.chen@hsbc.com",
    company: "HSBC Holdings",
    phone: "+44 20 7991 8888",
    inquiryType: "pricing",
    subject: "Enterprise Pricing Inquiry",
    message: "Interested in understanding the pricing structure for 200+ users. We have multiple entities across the UK and EU that would need access.",
    status: "in_progress",
    priority: "high",
    createdAt: "2025-12-30T14:15:00Z",
    notes: "Scheduled call for Jan 3rd"
  },
  {
    id: 3,
    name: "Emma Williams",
    email: "emma.w@nationwide.co.uk",
    company: "Nationwide Building Society",
    phone: "+44 1onal 123 4567",
    inquiryType: "general",
    subject: "Integration with Existing Systems",
    message: "We currently use ServiceNow for IT service management. Would like to understand how RegulaSync integrates with existing enterprise systems.",
    status: "resolved",
    priority: "medium",
    createdAt: "2025-12-28T11:00:00Z",
    notes: "Sent integration documentation"
  },
  {
    id: 4,
    name: "James Thompson",
    email: "j.thompson@lloyds.com",
    company: "Lloyds Banking Group",
    phone: "+44 20 7626 1500",
    inquiryType: "demo",
    subject: "Pilot Program Interest",
    message: "Saw your early access program. We'd like to be considered as a pilot partner for Q2 2026. Our compliance team has been struggling with manual policy tracking.",
    status: "new",
    priority: "high",
    createdAt: "2026-01-01T08:45:00Z",
    notes: ""
  },
  {
    id: 5,
    name: "Lisa Anderson",
    email: "l.anderson@santander.co.uk",
    company: "Santander UK",
    phone: "+44 800 389 7000",
    inquiryType: "support",
    subject: "Technical Documentation",
    message: "Looking for technical documentation about your API capabilities and security architecture for our IT security review.",
    status: "in_progress",
    priority: "low",
    createdAt: "2025-12-29T16:30:00Z",
    notes: "Sent security whitepaper"
  }
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-700", icon: <AlertCircle className="h-3 w-3" /> },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-700", icon: <Clock className="h-3 w-3" /> },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="h-3 w-3" /> },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: "High", color: "bg-red-100 text-red-700" },
  medium: { label: "Medium", color: "bg-amber-100 text-amber-700" },
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
};

const inquiryTypeConfig: Record<string, string> = {
  demo: "Request a Demo",
  pricing: "Pricing Inquiry",
  general: "General Question",
  support: "Technical Support",
  partnership: "Partnership",
};

export default function AdminContacts() {
  const [contacts, setContacts] = useState(demoContacts);
  const [selectedContact, setSelectedContact] = useState<typeof demoContacts[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [notes, setNotes] = useState("");

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || contact.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || contact.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: contacts.length,
    new: contacts.filter(c => c.status === "new").length,
    inProgress: contacts.filter(c => c.status === "in_progress").length,
    resolved: contacts.filter(c => c.status === "resolved").length,
    highPriority: contacts.filter(c => c.priority === "high").length,
  };

  const handleStatusChange = (contactId: number, newStatus: string) => {
    setContacts(prev => prev.map(c => 
      c.id === contactId ? { ...c, status: newStatus } : c
    ));
    toast.success("Status Updated", {
      description: `Contact status changed to ${statusConfig[newStatus].label}`
    });
  };

  const handlePriorityChange = (contactId: number, newPriority: string) => {
    setContacts(prev => prev.map(c => 
      c.id === contactId ? { ...c, priority: newPriority } : c
    ));
    toast.success("Priority Updated", {
      description: `Contact priority changed to ${priorityConfig[newPriority].label}`
    });
  };

  const handleSaveNotes = () => {
    if (selectedContact) {
      setContacts(prev => prev.map(c => 
        c.id === selectedContact.id ? { ...c, notes } : c
      ));
      toast.success("Notes Saved", {
        description: "Contact notes have been updated"
      });
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Company", "Phone", "Inquiry Type", "Subject", "Status", "Priority", "Date"];
    const rows = contacts.map(c => [
      c.name,
      c.email,
      c.company,
      c.phone,
      inquiryTypeConfig[c.inquiryType],
      c.subject,
      statusConfig[c.status].label,
      priorityConfig[c.priority].label,
      new Date(c.createdAt).toLocaleDateString()
    ]);
    
    const csv = [headers.join(","), ...rows.map(r => r.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contact-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success("Export Complete", {
      description: "Contact submissions exported to CSV"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Contact Submissions
          </h1>
          <p className="text-muted-foreground">Manage and respond to contact form inquiries</p>
        </div>
        <Button onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
              </div>
              <Star className="h-8 w-8 text-red-600/50" />
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
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Inquiries</CardTitle>
          <CardDescription>
            {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Inquiry Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {contact.company}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {inquiryTypeConfig[contact.inquiryType]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusConfig[contact.status].color}>
                      <span className="flex items-center gap-1">
                        {statusConfig[contact.status].icon}
                        {statusConfig[contact.status].label}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityConfig[contact.priority].color}>
                      {priorityConfig[contact.priority].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedContact(contact);
                        setNotes(contact.notes);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Contact Detail Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
            <DialogDescription>
              View and manage contact submission
            </DialogDescription>
          </DialogHeader>
          
          {selectedContact && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{selectedContact.company}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${selectedContact.email}`} className="font-medium text-blue-600 hover:underline">
                    {selectedContact.email}
                  </a>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedContact.phone}</p>
                </div>
              </div>

              {/* Subject & Message */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="font-medium">{selectedContact.subject}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Message</p>
                <p className="text-sm bg-muted/50 p-4 rounded-lg">{selectedContact.message}</p>
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Select 
                    value={selectedContact.status} 
                    onValueChange={(value) => {
                      handleStatusChange(selectedContact.id, value);
                      setSelectedContact({ ...selectedContact, status: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <Select 
                    value={selectedContact.priority} 
                    onValueChange={(value) => {
                      handlePriorityChange(selectedContact.id, value);
                      setSelectedContact({ ...selectedContact, priority: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Internal Notes</p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this contact..."
                  rows={3}
                />
                <Button size="sm" onClick={handleSaveNotes}>
                  Save Notes
                </Button>
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t text-sm text-muted-foreground">
                <p>Submitted: {new Date(selectedContact.createdAt).toLocaleString()}</p>
                <p>Inquiry Type: {inquiryTypeConfig[selectedContact.inquiryType]}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
