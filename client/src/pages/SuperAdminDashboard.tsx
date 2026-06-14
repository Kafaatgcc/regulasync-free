import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Building2, Users, ShieldCheck, Globe, ToggleLeft, Key, Webhook, Palette } from "lucide-react";

const PLAN_COLORS: Record<string, string> = {
  core: "bg-slate-500",
  professional: "bg-blue-600",
  enterprise: "bg-amber-600",
};

const PLAN_LABELS: Record<string, string> = {
  core: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

export default function SuperAdminDashboard() {
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  const { data: stats } = trpc.superAdmin.globalStats.useQuery();
  const { data: orgs, refetch: refetchOrgs } = trpc.superAdmin.listOrgs.useQuery();
  const { data: allUsers } = trpc.superAdmin.listAllUsers.useQuery();
  const { data: featureFlags, refetch: refetchFlags } = trpc.featureFlags.list.useQuery();
  const { data: orgFlags, refetch: refetchOrgFlags } = trpc.featureFlags.getForOrg.useQuery(
    { organizationId: selectedOrgId ?? undefined },
    { enabled: !!selectedOrgId }
  );

  const updateTier = trpc.superAdmin.updateOrgTier.useMutation({
    onSuccess: () => { toast.success("Tier updated"); refetchOrgs(); },
  });

  const toggleOrg = trpc.superAdmin.toggleOrgStatus.useMutation({
    onSuccess: () => { toast.success("Organisation status updated"); refetchOrgs(); },
  });

  const setFlagOverride = trpc.featureFlags.setOrgOverride.useMutation({
    onSuccess: () => { toast.success("Feature flag updated"); refetchOrgFlags(); },
  });

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Super Admin — Global Command Centre</h1>
        <p className="text-muted-foreground mt-1">Manage all organisations, subscription tiers, feature flags, and platform health.</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Organisations", value: stats?.totalOrgs ?? "—", icon: Building2, color: "text-amber-500" },
          { label: "Total Users", value: stats?.totalUsers ?? "—", icon: Users, color: "text-blue-500" },
          { label: "Active Users", value: stats?.activeUsers ?? "—", icon: ShieldCheck, color: "text-green-500" },
          { label: "Platform Status", value: "Operational", icon: Globe, color: "text-emerald-500" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="organisations">
        <TabsList className="bg-muted">
          <TabsTrigger value="organisations">Organisations</TabsTrigger>
          <TabsTrigger value="feature-flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="users">All Users</TabsTrigger>
        </TabsList>

        {/* Organisations Tab */}
        <TabsContent value="organisations" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                All Organisations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 pr-4">Organisation</th>
                      <th className="text-left py-2 pr-4">Industry</th>
                      <th className="text-left py-2 pr-4">Plan</th>
                      <th className="text-left py-2 pr-4">Change Tier</th>
                      <th className="text-left py-2 pr-4">Status</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(orgs ?? []).map((org: any) => (
                      <tr key={org.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-foreground">{org.name}</div>
                          <div className="text-xs text-muted-foreground">{org.slug}</div>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{org.industry ?? "—"}</td>
                        <td className="py-3 pr-4">
                          <Badge className={`${PLAN_COLORS[org.plan]} text-white text-xs`}>
                            {PLAN_LABELS[org.plan]}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <Select
                            defaultValue={org.plan}
                            onValueChange={(val) => updateTier.mutate({ organizationId: org.id, plan: val as any })}
                          >
                            <SelectTrigger className="w-36 h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="core">Starter</SelectItem>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={org.isActive !== false ? "default" : "destructive"} className="text-xs">
                            Active
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => setSelectedOrgId(org.id)}
                          >
                            <ToggleLeft className="w-3 h-3 mr-1" /> Feature Flags
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {(!orgs || orgs.length === 0) && (
                      <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No organisations found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Per-Org Feature Flag Override Panel */}
          {selectedOrgId && (
            <Card className="bg-card border-border mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ToggleLeft className="w-5 h-5 text-amber-500" />
                  Feature Flag Overrides — {orgs?.find((o: any) => o.id === selectedOrgId)?.name}
                  <Button variant="ghost" size="sm" className="ml-auto text-xs" onClick={() => setSelectedOrgId(null)}>
                    Close
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(orgFlags ?? []).map((flag: any) => (
                    <div key={flag.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{flag.label}</p>
                        <p className="text-xs text-muted-foreground">{flag.category}</p>
                      </div>
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={(enabled) =>
                          setFlagOverride.mutate({ organizationId: selectedOrgId, flagKey: flag.key, enabled })
                        }
                        className="ml-3"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Feature Flags Tab */}
        <TabsContent value="feature-flags" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ToggleLeft className="w-5 h-5 text-amber-500" />
                Platform Feature Flags — Tier Defaults
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 pr-4">Feature</th>
                      <th className="text-left py-2 pr-4">Category</th>
                      <th className="text-center py-2 pr-4">Starter</th>
                      <th className="text-center py-2 pr-4">Professional</th>
                      <th className="text-center py-2">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(featureFlags ?? []).map((flag: any) => (
                      <tr key={flag.key} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2 pr-4">
                          <div className="font-medium text-foreground">{flag.label}</div>
                          <div className="text-xs text-muted-foreground">{flag.description}</div>
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant="outline" className="text-xs capitalize">{flag.category}</Badge>
                        </td>
                        {[flag.starterEnabled, flag.professionalEnabled, flag.enterpriseEnabled].map((enabled, i) => (
                          <td key={i} className="py-2 pr-4 text-center">
                            <span className={`inline-block w-2 h-2 rounded-full ${enabled ? "bg-green-500" : "bg-red-400"}`} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Users Tab */}
        <TabsContent value="users" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                All Users ({allUsers?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 pr-4">User</th>
                      <th className="text-left py-2 pr-4">Role</th>
                      <th className="text-left py-2 pr-4">Organisation</th>
                      <th className="text-left py-2 pr-4">Status</th>
                      <th className="text-left py-2">Last Sign In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(allUsers ?? []).map((user: any) => (
                      <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2 pr-4">
                          <div className="font-medium text-foreground">{user.name ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant="outline" className="text-xs capitalize">{user.role?.replace("_", " ")}</Badge>
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground text-xs">{user.organizationId ?? "—"}</td>
                        <td className="py-2 pr-4">
                          <Badge variant={user.isActive ? "default" : "destructive"} className="text-xs">
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-2 text-muted-foreground text-xs">
                          {user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
