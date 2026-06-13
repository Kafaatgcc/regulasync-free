import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, GraduationCap, Plus, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  prospect: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  negotiating: "bg-yellow-100 text-yellow-800",
  inactive: "bg-red-100 text-red-800",
};

export default function UniversityPartnership() {
  
  
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    institutionName: "",
    country: "United Kingdom",
    contactName: "",
    contactEmail: "",
    department: "",
    programType: "research" as const,
    notes: "",
  });

  const { data: partnerships = [], isLoading, refetch } = trpc.universities.list.useQuery();
  const { data: stats } = trpc.universities.stats.useQuery();

  const createPartnership = trpc.universities.create.useMutation({
    onSuccess: () => {
      refetch();
      setAddOpen(false);
      setForm({ institutionName: "", country: "United Kingdom", contactName: "", contactEmail: "", department: "", programType: "research", notes: "" });
      toast.success("Partnership added", { description: "University partnership has been registered." });
    },
    onError: (e) => toast.error(e.message),
  });

  const updateStatus = trpc.universities.updateStatus.useMutation({
    onSuccess: () => { refetch(); toast.success("Status updated"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-blue-600" /> University Partnerships
          </h1>
          <p className="text-gray-500 mt-1">Academic collaboration programme — building the next generation of RegTech talent</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" /> Add Partnership
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Register University Partnership</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>University Name *</Label>
                <Input value={form.institutionName} onChange={e => setForm(f => ({ ...f, institutionName: e.target.value }))} placeholder="e.g. University of London" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  <Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Law / Finance / CS" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact Name</Label>
                  <Input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} placeholder="Prof. Jane Smith" />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} placeholder="j.smith@uni.ac.uk" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Partnership Type</Label>
                  <Select               value={form.programType} onValueChange={v => setForm(f => ({ ...f, programType: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="curriculum">Curriculum</SelectItem>
                      <SelectItem value="student_access">Student Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
  
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
              </div>
              <Button className="w-full"               onClick={() => createPartnership.mutate(form)} disabled={!form.institutionName || createPartnership.isPending}>
                {createPartnership.isPending ? "Saving..." : "Register Partnership"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Partners", value: stats.total || 0, icon: GraduationCap, color: "text-blue-600" },
            { label: "Active", value: stats.active || 0, icon: BookOpen, color: "text-green-600" },
            { label: "Pending", value: stats.pending || 0, icon: Users, color: "text-yellow-500" },
            { label: "Student Seats", value: stats.totalStudentSeats || 0, icon: GraduationCap, color: "text-purple-600" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <s.icon className={`h-8 w-8 ${s.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Partnership List */}
      <Card>
        <CardHeader>
          <CardTitle>University Partners</CardTitle>
          <CardDescription>Academic institutions collaborating with RegulaSync on research, internships, and curriculum development</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading partnerships...</div>
          ) : partnerships.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No university partnerships yet</p>
              <p className="text-sm mt-1">Add your first academic partner to build the RegTech talent pipeline</p>
            </div>
          ) : (
            <div className="space-y-3">
              {partnerships.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{p.institutionName}</p>
                      <p className="text-sm text-gray-500">
                        {p.programType?.replace(/_/g, " ") || "General"} · {p.country || "UK"}
                        {p.contactName && ` · ${p.contactName}`}
                      </p>
                      {p.createdAt && (
                        <p className="text-xs text-gray-400">Added {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">{p.programType?.replace(/_/g, " ")}</Badge>
                    <Select value={p.status} onValueChange={v => updateStatus.mutate({ id: p.id, status: v as "pending" | "active" | "expired" | "suspended" })}>
                      <SelectTrigger className="w-32 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
