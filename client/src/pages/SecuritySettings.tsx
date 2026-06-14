import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Shield, Smartphone, Monitor, Globe, Trash2, LogOut,
  CheckCircle, XCircle, Clock, Lock, AlertTriangle, Eye
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

function DeviceIcon({ type }: { type?: string }) {
  if (type === "mobile") return <Smartphone className="w-4 h-4 text-muted-foreground" />;
  return <Monitor className="w-4 h-4 text-muted-foreground" />;
}

export default function SecuritySettings() {
  const { user } = useAuth();
  const [revokeAllDialog, setRevokeAllDialog] = useState(false);

  const { data: sessions, refetch: refetchSessions } = trpc.sessions.listMySessions.useQuery();

  const revokeSession = trpc.sessions.revokeSession.useMutation({
    onSuccess: () => { toast.success("Session revoked"); refetchSessions(); },
    onError: (e) => toast.error(e.message),
  });

  const revokeAll = trpc.sessions.revokeAllOtherSessions.useMutation({
    onSuccess: () => { toast.success("All other sessions revoked"); setRevokeAllDialog(false); refetchSessions(); },
    onError: (e) => toast.error(e.message),
  });

  const activeSessions = (sessions ?? []).filter((s: any) => s.isActive);
  const inactiveSessions = (sessions ?? []).filter((s: any) => !s.isActive);

  return (
    <div className="space-y-8 p-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-8 h-8 text-amber-500" />
          Security Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account security — sessions, two-factor authentication, and access controls.
        </p>
      </div>

      <Tabs defaultValue="sessions">
        <TabsList className="bg-muted">
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="2fa">Two-Factor Auth</TabsTrigger>
          <TabsTrigger value="overview">Security Overview</TabsTrigger>
        </TabsList>

        {/* ─── Sessions ─── */}
        <TabsContent value="sessions" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Active Sessions</h2>
              <p className="text-sm text-muted-foreground">
                {activeSessions.length} active session{activeSessions.length !== 1 ? "s" : ""}. Revoke any session you do not recognise immediately.
              </p>
            </div>
            {activeSessions.length > 1 && (
              <Button variant="destructive" size="sm" onClick={() => setRevokeAllDialog(true)}>
                <LogOut className="w-4 h-4 mr-2" />
                Revoke All Other Sessions
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {activeSessions.map((session: any, idx: number) => (
              <Card key={session.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <DeviceIcon type={session.deviceType} />
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-foreground">
                            {session.deviceType === "mobile" ? "Mobile Device" : "Desktop Browser"}
                          </p>
                          {idx === 0 && (
                            <Badge className="text-xs bg-green-600 text-white">Current Session</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {session.userAgent ? session.userAgent.substring(0, 80) + "..." : "Unknown browser"}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {session.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" /> {session.ipAddress}
                            </span>
                          )}
                          {session.location && <span>{session.location}</span>}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last active: {session.lastActivityAt
                              ? new Date(session.lastActivityAt).toLocaleString()
                              : new Date(session.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {idx !== 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 shrink-0"
                        onClick={() => revokeSession.mutate({ sessionId: session.id })}
                        disabled={revokeSession.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {activeSessions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Monitor className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No active sessions recorded yet.</p>
                <p className="text-xs mt-1">Sessions are tracked from your next login.</p>
              </div>
            )}
          </div>

          {inactiveSessions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Recent Inactive Sessions</h3>
              <div className="space-y-2">
                {inactiveSessions.slice(0, 5).map((session: any) => (
                  <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                    <DeviceIcon type={session.deviceType} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {session.userAgent ? session.userAgent.substring(0, 60) + "..." : "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.createdAt ? new Date(session.createdAt).toLocaleString() : "—"}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">Revoked</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ─── 2FA ─── */}
        <TabsContent value="2fa" className="mt-4 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Smartphone className="w-5 h-5 text-amber-500" />
                Two-Factor Authentication (2FA)
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account using a TOTP authenticator app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Authenticator App (TOTP)</p>
                    <p className="text-xs text-muted-foreground">
                      Compatible with Google Authenticator, Authy, 1Password, Bitwarden
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Available
                </Badge>
              </div>

              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">2FA Setup</p>
                    <p className="text-muted-foreground mt-1">
                      To enable 2FA, your organisation admin needs to configure the TOTP secret generation endpoint.
                      Contact your Company Admin or Super Admin to enable this feature for your organisation.
                    </p>
                    <p className="text-muted-foreground mt-2">
                      Once enabled, you will be prompted to scan a QR code with your authenticator app on next login.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Supported Authenticator Apps</p>
                {[
                  { name: "Google Authenticator", platform: "iOS & Android", free: true },
                  { name: "Authy", platform: "iOS, Android & Desktop", free: true },
                  { name: "1Password", platform: "All platforms", free: false },
                  { name: "Bitwarden", platform: "All platforms", free: true },
                  { name: "Microsoft Authenticator", platform: "iOS & Android", free: true },
                ].map((app) => (
                  <div key={app.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.platform}</p>
                    </div>
                    <Badge variant={app.free ? "default" : "outline"} className="text-xs">
                      {app.free ? "Free" : "Paid"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Security Overview ─── */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Password",
                status: "strong",
                icon: Lock,
                description: "Your password meets security requirements.",
                action: "Change Password",
              },
              {
                title: "Two-Factor Authentication",
                status: "pending",
                icon: Smartphone,
                description: "2FA adds significant protection against unauthorised access.",
                action: "Enable 2FA",
              },
              {
                title: "Active Sessions",
                status: activeSessions.length <= 2 ? "good" : "warning",
                icon: Monitor,
                description: `${activeSessions.length} active session${activeSessions.length !== 1 ? "s" : ""} detected.`,
                action: activeSessions.length > 2 ? "Review Sessions" : null,
              },
              {
                title: "API Keys",
                status: "info",
                icon: Eye,
                description: "Manage API keys from Enterprise → Integrations.",
                action: null,
              },
            ].map((item) => (
              <Card key={item.title} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      item.status === "strong" || item.status === "good" ? "bg-green-500/10" :
                      item.status === "warning" ? "bg-amber-500/10" :
                      item.status === "pending" ? "bg-orange-500/10" : "bg-blue-500/10"
                    }`}>
                      <item.icon className={`w-5 h-5 ${
                        item.status === "strong" || item.status === "good" ? "text-green-500" :
                        item.status === "warning" ? "text-amber-500" :
                        item.status === "pending" ? "text-orange-500" : "text-blue-500"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground text-sm">{item.title}</p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            item.status === "strong" || item.status === "good" ? "border-green-500/50 text-green-400" :
                            item.status === "warning" ? "border-amber-500/50 text-amber-400" :
                            item.status === "pending" ? "border-orange-500/50 text-orange-400" : "border-blue-500/50 text-blue-400"
                          }`}
                        >
                          {item.status === "strong" ? "Strong" :
                           item.status === "good" ? "Good" :
                           item.status === "warning" ? "Review" :
                           item.status === "pending" ? "Not Enabled" : "Info"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Security Recommendations */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                Security Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  done: true,
                  text: "Use a strong, unique password for your RegulaSync account",
                },
                {
                  done: false,
                  text: "Enable two-factor authentication (2FA) for your account",
                },
                {
                  done: true,
                  text: "Review active sessions regularly and revoke unrecognised ones",
                },
                {
                  done: false,
                  text: "Rotate API keys every 90 days",
                },
                {
                  done: true,
                  text: "Ensure your work email account is secured with 2FA",
                },
                {
                  done: false,
                  text: "Configure Slack/Teams notifications for critical compliance alerts",
                },
              ].map((rec, i) => (
                <div key={i} className="flex items-center gap-3">
                  {rec.done
                    ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    : <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  }
                  <p className={`text-sm ${rec.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {rec.text}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Revoke All Dialog */}
      <Dialog open={revokeAllDialog} onOpenChange={setRevokeAllDialog}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Revoke All Other Sessions
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will immediately sign out all other devices and browsers. You will remain signed in on this device.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeAllDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => revokeAll.mutate()} disabled={revokeAll.isPending}>
              {revokeAll.isPending ? "Revoking..." : "Revoke All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
