import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Users, UserPlus, Mail, Shield, Building2, Briefcase,
  MoreHorizontal, RefreshCw, UserX, UserCheck, Copy, Loader2,
  Crown, AlertCircle, CheckCircle2
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  company_admin: { label: "Company Admin", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  compliance_manager: { label: "Compliance Mgr", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  department_user: { label: "Department User", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  auditor: { label: "Auditor", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  admin: { label: "Admin", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  user: { label: "User", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
};

const DEPARTMENTS = [
  "Compliance", "Legal", "Finance", "Risk Management",
  "HR", "IT Security", "Operations", "Executive", "Audit"
];

export default function UserManagement() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("department_user");
  const [inviteDept, setInviteDept] = useState("");
  const [inviteJobTitle, setInviteJobTitle] = useState("");
  const [inviteResult, setInviteResult] = useState<{ url: string } | null>(null);

  const { data: userList = [], isLoading } = trpc.userManagement.listUsers.useQuery();

  const inviteMutation = trpc.userManagement.inviteUser.useMutation({
    onSuccess: (data) => {
      setInviteResult({ url: data.inviteUrl });
      utils.userManagement.listUsers.invalidate();
      toast.success("Invitation created successfully!");
    },
    onError: (err) => toast.error(err.message),
  });

  const setActiveMutation = trpc.userManagement.setUserActive.useMutation({
    onSuccess: () => {
      utils.userManagement.listUsers.invalidate();
      toast.success("User status updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const resendMutation = trpc.userManagement.resendInvite.useMutation({
    onSuccess: (data) => {
      toast.success("New invite link generated");
      navigator.clipboard.writeText(data.inviteUrl);
      toast.info("Invite link copied to clipboard");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate({
      email: inviteEmail,
      role: inviteRole as any,
      department: inviteDept || undefined,
      jobTitle: inviteJobTitle || undefined,
    });
  };

  const resetInviteForm = () => {
    setInviteEmail("");
    setInviteRole("department_user");
    setInviteDept("");
    setInviteJobTitle("");
    setInviteResult(null);
    setInviteOpen(false);
  };

  const activeUsers = userList.filter(u => u.isActive && !u.inviteToken);
  const pendingUsers = userList.filter(u => u.inviteToken);
  const inactiveUsers = userList.filter(u => !u.isActive && !u.inviteToken);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-amber-500" />
              User Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage team members, roles, and access permissions
            </p>
          </div>
          <Dialog open={inviteOpen} onOpenChange={(open) => { if (!open) resetInviteForm(); else setInviteOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-[#0f172a] font-semibold gap-2">
                <UserPlus className="h-4 w-4" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1e293b] border-white/10 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-amber-500" />
                  Invite Team Member
                </DialogTitle>
              </DialogHeader>

              {inviteResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Invitation created!</span>
                  </div>
                  <p className="text-slate-400 text-sm">Share this link with the invitee. It expires in 7 days.</p>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-2">
                    <code className="text-xs text-amber-400 flex-1 break-all">{inviteResult.url}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { navigator.clipboard.writeText(inviteResult.url); toast.success("Copied!"); }}
                      className="text-slate-400 hover:text-white flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={resetInviteForm} className="w-full bg-amber-500 hover:bg-amber-600 text-[#0f172a]">
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-sm">Email address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        type="email"
                        placeholder="colleague@company.co.uk"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-sm">Role *</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e293b] border-white/10">
                        <SelectItem value="company_admin" className="text-white">Company Admin</SelectItem>
                        <SelectItem value="compliance_manager" className="text-white">Compliance Manager</SelectItem>
                        <SelectItem value="department_user" className="text-white">Department User</SelectItem>
                        <SelectItem value="auditor" className="text-white">Auditor (Read-only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-sm">Department</Label>
                    <Select value={inviteDept} onValueChange={setInviteDept}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white h-10">
                        <SelectValue placeholder="Select department..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e293b] border-white/10">
                        {DEPARTMENTS.map(d => (
                          <SelectItem key={d} value={d} className="text-white">{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-sm">Job Title</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="e.g. Compliance Officer"
                        value={inviteJobTitle}
                        onChange={(e) => setInviteJobTitle(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-10"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={inviteMutation.isPending}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-[#0f172a] font-semibold h-10"
                  >
                    {inviteMutation.isPending ? (
                      <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating invite...</span>
                    ) : "Send Invitation"}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Users", value: activeUsers.length, icon: UserCheck, color: "text-green-400" },
            { label: "Pending Invites", value: pendingUsers.length, icon: Mail, color: "text-amber-400" },
            { label: "Inactive", value: inactiveUsers.length, icon: UserX, color: "text-slate-400" },
          ].map(stat => (
            <Card key={stat.label} className="bg-white/[0.03] border-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Table */}
        <Card className="bg-white/[0.03] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">All Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
              </div>
            ) : userList.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No users yet. Invite your first team member.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs text-slate-400 font-medium px-6 py-3">User</th>
                      <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Role</th>
                      <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Department</th>
                      <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Status</th>
                      <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Last Active</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((u) => {
                      const roleInfo = ROLE_LABELS[u.role] || { label: u.role, color: "bg-slate-500/20 text-slate-300 border-slate-500/30" };
                      const isPending = !!u.inviteToken;
                      const isCurrentUser = u.id === user?.id;
                      return (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#0f172a] font-bold text-xs flex-shrink-0">
                                {u.name ? u.name.charAt(0).toUpperCase() : (u.email?.charAt(0).toUpperCase() || "?")}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white flex items-center gap-1">
                                  {u.name || <span className="text-slate-500 italic">Not set up yet</span>}
                                  {isCurrentUser && <span className="text-xs text-amber-500">(you)</span>}
                                </div>
                                <div className="text-xs text-slate-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
                              {(u.role === "super_admin" || u.role === "company_admin") && <Crown className="h-2.5 w-2.5" />}
                              {roleInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-slate-300">{u.department || <span className="text-slate-500">—</span>}</span>
                          </td>
                          <td className="px-4 py-4">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <Mail className="h-2.5 w-2.5" />
                                Invite Pending
                              </span>
                            ) : u.isActive ? (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                <UserX className="h-2.5 w-2.5" />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-400">
                            {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-4 py-4">
                            {!isCurrentUser && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-white">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-[#1e293b] border-white/10 text-white">
                                  {isPending && (
                                    <DropdownMenuItem
                                      onClick={() => resendMutation.mutate({ userId: u.id })}
                                      className="text-amber-400 hover:bg-white/5 cursor-pointer"
                                    >
                                      <RefreshCw className="h-3.5 w-3.5 mr-2" />
                                      Resend Invite
                                    </DropdownMenuItem>
                                  )}
                                  {!isPending && u.isActive && (
                                    <DropdownMenuItem
                                      onClick={() => setActiveMutation.mutate({ userId: u.id, isActive: false })}
                                      className="text-red-400 hover:bg-white/5 cursor-pointer"
                                    >
                                      <UserX className="h-3.5 w-3.5 mr-2" />
                                      Deactivate
                                    </DropdownMenuItem>
                                  )}
                                  {!isPending && !u.isActive && (
                                    <DropdownMenuItem
                                      onClick={() => setActiveMutation.mutate({ userId: u.id, isActive: true })}
                                      className="text-green-400 hover:bg-white/5 cursor-pointer"
                                    >
                                      <UserCheck className="h-3.5 w-3.5 mr-2" />
                                      Reactivate
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Guide */}
        <Card className="bg-white/[0.03] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              Role Permissions Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { role: "Super Admin", desc: "Full platform access, all companies, billing, platform settings" },
                { role: "Company Admin", desc: "All policies, all departments, user management within their org" },
                { role: "Compliance Manager", desc: "Cross-department policies, gap analysis, reports, audit trail" },
                { role: "Department User", desc: "Own department's policies, alerts, and compliance checks only" },
                { role: "Auditor", desc: "Read-only access to selected documents and audit trail" },
              ].map(r => (
                <div key={r.role} className="flex gap-2">
                  <span className={`flex-shrink-0 font-medium ${ROLE_LABELS[r.role.toLowerCase().replace(/ /g, "_")]?.color.split(" ")[1] || "text-slate-300"}`}>
                    {r.role}:
                  </span>
                  <span className="text-slate-400">{r.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
