import { useState } from 'react';
import { trpc } from '@/lib/trpc';
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

type ContactRecord = {
  id: number; name: string; email: string; company: string; phone: string;
  inquiryType: string; subject: string; message: string;
  status: "new" | "read" | "replied" | "resolved" | "archived";
  priority: "high" | "medium" | "low"; createdAt: Date; notes: string;
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-700", icon: <AlertCircle className="h-3 w-3" /> },
  read: { label: "Read", color: "bg-amber-100 text-amber-700", icon: <Clock className="h-3 w-3" /> },
  replied: { label: "Replied", color: "bg-purple-100 text-purple-700", icon: <Mail className="h-3 w-3" /> },
  archived: { label: "Archived", color: "bg-gray-100 text-gray-700", icon: <CheckCircle2 className="h-3 w-3" /> },
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
  media: "Media & Press",
};

export default function AdminContacts() {
  const query = trpc.contact.list.useQuery({ limit: 100 }, { retry: false });
  const utils = trpc.useUtils();
  const contacts: ContactRecord[] = (query.data ?? []).map(contact => ({ ...contact,
    company: contact.company ?? "", phone: contact.phone ?? "", notes: contact.notes ?? "" }));
  const [selectedContact, setSelectedContact] = useState<ContactRecord | null>(null);
  const updateContact = trpc.contact.update.useMutation({
    onSuccess: () => { void utils.contact.list.invalidate(); toast.success("Inquiry updated"); },
    onError: error => toast.error(error.message || "Unable to save inquiry changes"),
  });
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
    inProgress: contacts.filter(c => c.status === "read" || c.status === "replied").length,
    resolved: contacts.filter(c => c.status === "resolved").length,
    highPriority: contacts.filter(c => c.priority === "high").length,
  };

  const handleStatusChange = async (contactId: number, newStatus: string) => {
    const status = newStatus as ContactRecord["status"];
    try { await updateContact.mutateAsync({ id: contactId, status });
      setSelectedContact(current => current?.id === contactId ? { ...current, status } : current);
    } catch { /* Mutation displays the error; do not pretend it saved. */ }
  };
  const handlePriorityChange = async (contactId: number, newPriority: string) => {
    const priority = newPriority as ContactRecord["priority"];
    try { await updateContact.mutateAsync({ id: contactId, priority });
      setSelectedContact(current => current?.id === contactId ? { ...current, priority } : current);
    } catch { /* Mutation displays the error. */ }
  };
  const handleSaveNotes = () => {
    if (selectedContact) updateContact.mutate({ id: selectedContact.id, notes });
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

    const csvCell = (cell: unknown) => { const value = String(cell ?? ""); return `"${(/^[=+@\-]/.test(value) ? "'" : "") + value.replaceAll('"', '""')}"`; };
    const csv = [headers.join(","), ...rows.map(r => r.map(csvCell).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contact-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

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
          <p className="text-muted-foreground">Manage saved contact and guided-demo inquiries (latest 100 records).</p>
        </div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}>Refresh</Button><Button onClick={handleExportCSV} disabled={!contacts.length}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button></div>
      </div>

      {query.isLoading && <p role="status">Loading saved inquiries…</p>}
      {query.error && <p role="alert" className="text-red-600">Unable to load saved inquiries: {query.error.message}</p>}
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
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
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
              {!query.isLoading && !query.error && !filteredContacts.length && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No saved inquiries match these filters.</TableCell></TableRow>}
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
                      aria-label={`View inquiry from ${contact.name}`}
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
                    disabled={updateContact.isPending}
                    value={selectedContact.status}
                    onValueChange={(value) => {
                      void handleStatusChange(selectedContact.id, value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <Select
                    disabled={updateContact.isPending}
                    value={selectedContact.priority}
                    onValueChange={(value) => {
                      void handlePriorityChange(selectedContact.id, value);
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
                <Button size="sm" disabled={updateContact.isPending} onClick={handleSaveNotes}>
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
