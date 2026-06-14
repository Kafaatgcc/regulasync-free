import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Key, Webhook, Bell, Plus, Trash2, Play, Copy, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const WEBHOOK_EVENTS = [
  "policy.created", "policy.approved", "policy.archived",
  "compliance.alert", "audit.completed", "risk.high_detected",
  "delegation.expiring", "regulatory.update", "user.invited",
];

const NOTIF_EVENTS = [
  "compliance.alert", "risk.critical", "delegation.expiring",
  "regulatory.update", "audit.completed", "policy.pending_review",
];

export default function EnterpriseIntegrations() {
  const { user } = useAuth();
  const orgId = user?.organizationId as number | undefined;

  // API Keys
  const { data: apiKeys, refetch: refetchKeys } = trpc.orgApiKeys.list.useQuery({ organizationId: orgId });
  const [newKeyDialog, setNewKeyDialog] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeyExpiry, setNewKeyExpiry] = useState("365");
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(["read"]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const createKey = trpc.orgApiKeys.create.useMutation({
    onSuccess: (data) => {
      setCreatedKey(data.apiKey);
      refetchKeys();
    },
    onError: (e) => toast.error(e.message),
  });

  const revokeKey = trpc.orgApiKeys.revoke.useMutation({
    onSuccess: () => { toast.success("API key revoked"); refetchKeys(); },
  });

  // Webhooks
  const { data: webhookList, refetch: refetchWebhooks } = trpc.webhooks.list.useQuery({ organizationId: orgId });
  const [webhookDialog, setWebhookDialog] = useState(false);
  const [webhookLabel, setWebhookLabel] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>(["compliance.alert"]);

  const createWebhook = trpc.webhooks.create.useMutation({
    onSuccess: () => { toast.success("Webhook created"); setWebhookDialog(false); refetchWebhooks(); },
    onError: (e) => toast.error(e.message),
  });

  const toggleWebhook = trpc.webhooks.toggle.useMutation({
    onSuccess: () => refetchWebhooks(),
  });

  const deleteWebhook = trpc.webhooks.delete.useMutation({
    onSuccess: () => { toast.success("Webhook deleted"); refetchWebhooks(); },
  });

  const testWebhook = trpc.webhooks.test.useMutation({
    onSuccess: (data) => {
      if (data.success) toast.success(`Webhook test passed (${data.statusCode}) in ${data.durationMs}ms`);
      else toast.error(`Webhook test failed: ${(data as any).error ?? data.statusCode}`);
      refetchWebhooks();
    },
  });

  // Notification Integrations
  const { data: notifList, refetch: refetchNotif } = trpc.notificationIntegrations.list.useQuery({ organizationId: orgId });
  const [notifDialog, setNotifDialog] = useState(false);
  const [notifType, setNotifType] = useState<"slack" | "teams" | "email" | "pagerduty">("slack");
  const [notifLabel, setNotifLabel] = useState("");
  const [notifUrl, setNotifUrl] = useState("");
  const [notifEvents, setNotifEvents] = useState<string[]>(["compliance.alert"]);

  const createNotif = trpc.notificationIntegrations.create.useMutation({
    onSuccess: () => { toast.success("Integration added"); setNotifDialog(false); refetchNotif(); },
    onError: (e) => toast.error(e.message),
  });

  const testNotif = trpc.notificationIntegrations.test.useMutation({
    onSuccess: (data) => {
      if (data.success) toast.success("Test notification sent successfully!");
      else toast.error(`Test failed: ${(data as any).error ?? "Unknown error"}`);
    },
  });

  const deleteNotif = trpc.notificationIntegrations.delete.useMutation({
    onSuccess: () => { toast.success("Integration removed"); refetchNotif(); },
  });

  const toggleEvent = (arr: string[], setArr: (v: string[]) => void, event: string) => {
    setArr(arr.includes(event) ? arr.filter((e) => e !== event) : [...arr, event]);
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Enterprise Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect RegulaSync to your enterprise systems via API keys, webhooks, and notification channels.
        </p>
      </div>

      <Tabs defaultValue="api-keys">
        <TabsList className="bg-muted">
          <TabsTrigger value="api-keys" className="flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" /> API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-1.5">
            <Webhook className="w-3.5 h-3.5" /> Webhooks
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* ─── API Keys ─── */}
        <TabsContent value="api-keys" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">API Keys</h2>
              <p className="text-sm text-muted-foreground">Machine-to-machine authentication for your integrations.</p>
            </div>
            <Button onClick={() => { setNewKeyDialog(true); setCreatedKey(null); }} className="bg-amber-600 hover:bg-amber-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Generate API Key
            </Button>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left p-4">Label</th>
                    <th className="text-left p-4">Key Prefix</th>
                    <th className="text-left p-4">Permissions</th>
                    <th className="text-left p-4">Last Used</th>
                    <th className="text-left p-4">Expires</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(apiKeys ?? []).map((key: any) => (
                    <tr key={key.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{key.label}</td>
                      <td className="p-4 font-mono text-xs text-muted-foreground">{key.keyPrefix}</td>
                      <td className="p-4">
                        {(key.permissions ?? ["read"]).map((p: string) => (
                          <Badge key={p} variant="outline" className="text-xs mr-1 capitalize">{p}</Badge>
                        ))}
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : "Never"}
                      </td>
                      <td className="p-4">
                        <Badge variant={key.isActive ? "default" : "destructive"} className="text-xs">
                          {key.isActive ? "Active" : "Revoked"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {key.isActive && (
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 h-7 px-2"
                            onClick={() => revokeKey.mutate({ id: key.id })}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!apiKeys || apiKeys.length === 0) && (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No API keys yet. Generate one to get started.</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* API Key Info */}
          <Card className="bg-muted/20 border-border/50">
            <CardContent className="p-4 text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">How to authenticate</p>
              <p>Include your API key in the <code className="bg-muted px-1 rounded text-xs">Authorization</code> header:</p>
              <pre className="bg-muted p-2 rounded text-xs font-mono mt-2">Authorization: Bearer rsk_live_...</pre>
              <p className="mt-2">Base URL: <code className="bg-muted px-1 rounded text-xs">https://your-domain.com/api/v1</code></p>
              <p>See the <a href="/docs/api" className="text-amber-500 underline">API Documentation</a> for full endpoint reference.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Webhooks ─── */}
        <TabsContent value="webhooks" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Outbound Webhooks</h2>
              <p className="text-sm text-muted-foreground">Push compliance events to your systems in real time.</p>
            </div>
            <Button onClick={() => setWebhookDialog(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Webhook
            </Button>
          </div>

          <div className="space-y-3">
            {(webhookList ?? []).map((wh: any) => (
              <Card key={wh.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground">{wh.label}</p>
                        <Badge variant={wh.isActive ? "default" : "secondary"} className="text-xs">
                          {wh.isActive ? "Active" : "Paused"}
                        </Badge>
                        {wh.lastStatusCode && (
                          <Badge variant={wh.lastStatusCode < 300 ? "default" : "destructive"} className="text-xs">
                            {wh.lastStatusCode}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate">{wh.url}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(wh.events ?? []).map((e: string) => (
                          <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={wh.isActive} onCheckedChange={(v) => toggleWebhook.mutate({ id: wh.id, isActive: v })} />
                      <Button variant="outline" size="sm" className="h-7 text-xs"
                        onClick={() => testWebhook.mutate({ id: wh.id })}
                        disabled={testWebhook.isPending}>
                        <Play className="w-3 h-3 mr-1" /> Test
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-red-400 hover:text-red-300"
                        onClick={() => deleteWebhook.mutate({ id: wh.id })}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!webhookList || webhookList.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <Webhook className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No webhooks configured. Add one to start receiving real-time events.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Notifications ─── */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Notification Channels</h2>
              <p className="text-sm text-muted-foreground">Send compliance alerts to Slack, Teams, or other channels.</p>
            </div>
            <Button onClick={() => setNotifDialog(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Channel
            </Button>
          </div>

          <div className="space-y-3">
            {(notifList ?? []).map((n: any) => (
              <Card key={n.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground">{n.label}</p>
                        <Badge variant="outline" className="text-xs capitalize">{n.type}</Badge>
                        <Badge variant={n.isActive ? "default" : "secondary"} className="text-xs">
                          {n.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate">{n.webhookUrl}</p>
                      {n.lastTestedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last tested: {new Date(n.lastTestedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="h-7 text-xs"
                        onClick={() => testNotif.mutate({ id: n.id })}
                        disabled={testNotif.isPending}>
                        <Play className="w-3 h-3 mr-1" /> Test
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-red-400 hover:text-red-300"
                        onClick={() => deleteNotif.mutate({ id: n.id })}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!notifList || notifList.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No notification channels configured.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Create API Key Dialog ─── */}
      <Dialog open={newKeyDialog} onOpenChange={(o) => { setNewKeyDialog(o); if (!o) setCreatedKey(null); }}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Generate API Key</DialogTitle>
          </DialogHeader>
          {!createdKey ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Label</Label>
                <Input value={newKeyLabel} onChange={(e) => setNewKeyLabel(e.target.value)}
                  placeholder="e.g. Production Integration" className="bg-muted/30 border-border" />
              </div>
              <div className="space-y-1.5">
                <Label>Expires In</Label>
                <Select value={newKeyExpiry} onValueChange={setNewKeyExpiry}>
                  <SelectTrigger className="bg-muted/30 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="0">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                {["read", "write", "admin"].map((p) => (
                  <div key={p} className="flex items-center gap-2">
                    <Checkbox
                      checked={newKeyPermissions.includes(p)}
                      onCheckedChange={() => toggleEvent(newKeyPermissions, setNewKeyPermissions, p)}
                    />
                    <span className="text-sm capitalize">{p}</span>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewKeyDialog(false)}>Cancel</Button>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={!newKeyLabel || createKey.isPending}
                  onClick={() => createKey.mutate({
                    organizationId: orgId,
                    label: newKeyLabel,
                    permissions: newKeyPermissions,
                    expiresInDays: newKeyExpiry === "0" ? undefined : Number(newKeyExpiry),
                  })}>
                  Generate
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-sm text-green-400">API key generated. Copy it now — it will not be shown again.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Your API Key</Label>
                <div className="flex items-center gap-2">
                  <Input value={createdKey} readOnly className="font-mono text-xs bg-muted/30 border-border" />
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(createdKey); toast.success("Copied!"); }}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => { setNewKeyDialog(false); setCreatedKey(null); setNewKeyLabel(""); }}>
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Create Webhook Dialog ─── */}
      <Dialog open={webhookDialog} onOpenChange={setWebhookDialog}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Label</Label>
              <Input value={webhookLabel} onChange={(e) => setWebhookLabel(e.target.value)}
                placeholder="e.g. Jira Compliance Alerts" className="bg-muted/30 border-border" />
            </div>
            <div className="space-y-1.5">
              <Label>Endpoint URL</Label>
              <Input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-system.com/webhooks/regulasync" className="bg-muted/30 border-border" />
            </div>
            <div className="space-y-2">
              <Label>Events to Subscribe</Label>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                {WEBHOOK_EVENTS.map((e) => (
                  <div key={e} className="flex items-center gap-2">
                    <Checkbox
                      checked={webhookEvents.includes(e)}
                      onCheckedChange={() => toggleEvent(webhookEvents, setWebhookEvents, e)}
                    />
                    <span className="text-xs text-muted-foreground">{e}</span>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWebhookDialog(false)}>Cancel</Button>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white"
                disabled={!webhookLabel || !webhookUrl || createWebhook.isPending}
                onClick={() => createWebhook.mutate({ organizationId: orgId, label: webhookLabel, url: webhookUrl, events: webhookEvents })}>
                Add Webhook
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Add Notification Channel Dialog ─── */}
      <Dialog open={notifDialog} onOpenChange={setNotifDialog}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Add Notification Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Channel Type</Label>
              <Select value={notifType} onValueChange={(v) => setNotifType(v as any)}>
                <SelectTrigger className="bg-muted/30 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="email">Email Webhook</SelectItem>
                  <SelectItem value="pagerduty">PagerDuty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Label</Label>
              <Input value={notifLabel} onChange={(e) => setNotifLabel(e.target.value)}
                placeholder="e.g. #compliance-alerts" className="bg-muted/30 border-border" />
            </div>
            <div className="space-y-1.5">
              <Label>Webhook URL</Label>
              <Input value={notifUrl} onChange={(e) => setNotifUrl(e.target.value)}
                placeholder={notifType === "slack" ? "https://hooks.slack.com/services/..." : "https://outlook.office.com/webhook/..."}
                className="bg-muted/30 border-border" />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {NOTIF_EVENTS.map((e) => (
                  <div key={e} className="flex items-center gap-2">
                    <Checkbox
                      checked={notifEvents.includes(e)}
                      onCheckedChange={() => toggleEvent(notifEvents, setNotifEvents, e)}
                    />
                    <span className="text-xs text-muted-foreground">{e}</span>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNotifDialog(false)}>Cancel</Button>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white"
                disabled={!notifLabel || !notifUrl || createNotif.isPending}
                onClick={() => createNotif.mutate({ organizationId: orgId, type: notifType, label: notifLabel, webhookUrl: notifUrl, events: notifEvents })}>
                Add Channel
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
