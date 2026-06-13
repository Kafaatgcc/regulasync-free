import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  History, 
  Search,
  Download,
  Eye,
  FileText,
  Users,
  Shield,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Hash,
  Link2,
  RefreshCw,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Copy,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Action configuration for display
const actionConfig: Record<string, { label: string; icon: any; color: string }> = {
  create: { label: "Created", icon: FileText, color: "text-green-600 bg-green-50" },
  update: { label: "Updated", icon: FileText, color: "text-blue-600 bg-blue-50" },
  delete: { label: "Deleted", icon: Shield, color: "text-red-600 bg-red-50" },
  approve: { label: "Approved", icon: CheckCircle2, color: "text-green-600 bg-green-50" },
  reject: { label: "Rejected", icon: AlertTriangle, color: "text-red-600 bg-red-50" },
  view: { label: "Viewed", icon: Eye, color: "text-gray-600 bg-gray-50" },
  export: { label: "Exported", icon: Download, color: "text-purple-600 bg-purple-50" },
};

// Entity type configuration
const entityConfig: Record<string, { label: string; icon: any }> = {
  policy: { label: "Policy", icon: FileText },
  delegation: { label: "Delegation", icon: GitBranch },
  compliance: { label: "Compliance", icon: Shield },
  user: { label: "User", icon: Users },
  system: { label: "System", icon: History },
};

export default function AuditTrail() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string>("all");
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch audit trail from database
  const { data: auditLogs, isLoading: isLoadingLogs, refetch: refetchLogs } = trpc.audit.list.useQuery({ limit: 100 });
  
  // Fetch chain verification status
  const { data: chainVerification, isLoading: isVerifyingChain, refetch: refetchVerification } = trpc.audit.verifyChain.useQuery();
  
  // Fetch chain statistics
  const { data: chainStats } = trpc.audit.statistics.useQuery();
  
  // Rebuild chain mutation
  const rebuildMutation = trpc.admin.rebuildAuditChain.useMutation({
    onSuccess: (data) => {
      toast.success('Audit chain rebuilt!', {
        description: data.message || `${data.count} entries created with valid hash chain`
      });
      refetchLogs();
      refetchVerification();
    },
    onError: (error) => {
      toast.error('Rebuild failed', { description: error.message });
    }
  });

  // Export mutation
  const exportMutation = trpc.audit.exportVerified.useMutation({
    onSuccess: (data) => {
      // Create CSV content with verification data
      const headers = ['ID', 'Timestamp', 'Entity Type', 'Entity ID', 'Action', 'User', 'Hash', 'Previous Hash', 'Verified'];
      const rows = data.entries.map(entry => [
        entry.id,
        entry.createdAt,
        entry.entityType,
        entry.entityId,
        entry.action,
        entry.userName || 'System',
        entry.hashValue || 'N/A',
        entry.previousHashValue || 'GENESIS',
        entry.verified ? 'Yes' : 'No'
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Add verification metadata
      const metadata = `\n\n# Export Metadata\n# Chain Integrity: ${data.chainIntegrity}\n# Exported At: ${data.exportedAt}\n# Verification Hash: ${data.verificationHash}`;
      
      const blob = new Blob([csvContent + metadata], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_trail_verified_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Audit trail exported with verification data!', {
        description: `Chain integrity: ${data.chainIntegrity.toUpperCase()}`
      });
    },
    onError: (error) => {
      toast.error('Export failed', { description: error.message });
    }
  });

  // Handle manual verification
  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      await refetchVerification();
      toast.success('Chain verification complete!');
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  // Copy hash to clipboard
  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success('Hash copied to clipboard');
  };

  // Filter logs
  const filteredLogs = (auditLogs || []).filter(log => {
    const matchesSearch = 
      log.id.toString().includes(searchQuery) ||
      (log.userName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEntity = selectedEntity === "all" || log.entityType === selectedEntity;
    return matchesSearch && matchesEntity;
  });

  // Calculate stats
  const totalEntries = auditLogs?.length || 0;
  const createActions = auditLogs?.filter(l => l.action === 'create').length || 0;
  const updateActions = auditLogs?.filter(l => l.action === 'update').length || 0;
  const deleteActions = auditLogs?.filter(l => l.action === 'delete').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            Self-Validating Audit Cache
          </h1>
          <p className="text-muted-foreground">Cryptographically verified, immutable audit trail</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleVerifyChain}
            disabled={isVerifying || isVerifyingChain}
          >
            {(isVerifying || isVerifyingChain) ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4 mr-2" />
            )}
            Verify Chain
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Verified
          </Button>
        </div>
      </div>

      {/* Chain Integrity Status */}
      <Card className={`border-2 ${
        chainVerification?.chainIntegrity === 'intact' 
          ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' 
          : chainVerification?.chainIntegrity === 'broken'
          ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
          : 'border-primary/20 bg-primary/5'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${
              chainVerification?.chainIntegrity === 'intact'
                ? 'bg-green-100 dark:bg-green-900'
                : chainVerification?.chainIntegrity === 'broken'
                ? 'bg-red-100 dark:bg-red-900'
                : 'bg-primary/10'
            }`}>
              {chainVerification?.chainIntegrity === 'intact' ? (
                <ShieldCheck className="h-6 w-6 text-green-600" />
              ) : chainVerification?.chainIntegrity === 'broken' ? (
                <ShieldAlert className="h-6 w-6 text-red-600" />
              ) : (
                <Link2 className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Self-Validating Audit Cache (SVAC)</h3>
                {chainVerification && (
                  <Badge variant={chainVerification.chainIntegrity === 'intact' ? 'default' : 'destructive'}>
                    {chainVerification.chainIntegrity === 'intact' ? 'Chain Verified' : 
                     chainVerification.chainIntegrity === 'broken' ? 'Chain Broken' : 'Empty Chain'}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Every audit entry is cryptographically hashed using SHA-256 and linked to the previous entry, 
                creating an immutable blockchain-style chain of evidence. Any tampering is immediately detectable.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                {chainVerification?.chainIntegrity === 'intact' && (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">
                      {chainVerification.verifiedEntries} / {chainVerification.totalEntries} entries verified
                    </span>
                  </div>
                )}
                {chainVerification?.chainIntegrity === 'broken' && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">
                      Chain broken at entry #{chainVerification.firstInvalidAt}
                    </span>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => rebuildMutation.mutate()}
                      disabled={rebuildMutation.isPending}
                      className="ml-2"
                    >
                      {rebuildMutation.isPending ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      Rebuild Chain
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {totalEntries} entries in chain
                  </span>
                </div>
                {chainVerification?.verificationTime && (
                  <div className="flex items-center gap-1">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Verified in {chainVerification.verificationTime}ms
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{totalEntries}</p>
              </div>
              <History className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-2xl font-bold text-green-600">{createActions}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Updated</p>
                <p className="text-2xl font-bold text-blue-600">{updateActions}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deleted</p>
                <p className="text-2xl font-bold text-red-600">{deleteActions}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Audit Log Entries</CardTitle>
              <CardDescription>
                Complete cryptographically verified history of all governance activities
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  className="pl-9 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {Object.entries(entityConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => refetchLogs()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No audit entries yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Audit entries will appear here as actions are performed in the system.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const ActionIcon = actionConfig[log.action]?.icon || History;
                  const EntityIcon = entityConfig[log.entityType]?.icon || FileText;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">#{log.id}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded flex items-center justify-center ${actionConfig[log.action]?.color || 'bg-gray-50'}`}>
                            <ActionIcon className="h-3 w-3" />
                          </div>
                          <span className="text-sm">{actionConfig[log.action]?.label || log.action}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <EntityIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm capitalize">{log.entityType}</p>
                            <p className="text-xs text-muted-foreground">ID: {log.entityId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{log.userName || 'System'}</p>
                      </TableCell>
                      <TableCell>
                        {log.hashValue ? (
                          <div className="flex items-center gap-1">
                            <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                              {log.hashValue.substring(0, 8)}...
                            </code>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => copyHash(log.hashValue!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No hash</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Audit Entry Details</DialogTitle>
                              <DialogDescription>
                                Complete cryptographic verification for entry #{log.id}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Entry ID</p>
                                  <p className="font-mono text-sm">#{log.id}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Timestamp</p>
                                  <p className="text-sm">{new Date(log.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">User</p>
                                  <p className="text-sm">{log.userName || 'System'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">IP Address</p>
                                  <p className="font-mono text-sm">{log.ipAddress || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Action</p>
                                  <p className="text-sm capitalize">{log.action}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Entity</p>
                                  <p className="text-sm capitalize">{log.entityType} (ID: {log.entityId})</p>
                                </div>
                              </div>
                              
                              {/* Hash Chain Information */}
                              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <Link2 className="h-4 w-4" />
                                  Cryptographic Hash Chain
                                </h4>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Previous Hash (Link)</p>
                                  <div className="flex items-center gap-2">
                                    <code className="text-xs bg-background px-2 py-1 rounded font-mono break-all flex-1">
                                      {log.previousHashValue || 'GENESIS (First Entry)'}
                                    </code>
                                    {log.previousHashValue && (
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 shrink-0"
                                        onClick={() => copyHash(log.previousHashValue!)}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Current Entry Hash (SHA-256)</p>
                                  <div className="flex items-center gap-2">
                                    <code className="text-xs bg-background px-2 py-1 rounded font-mono break-all flex-1">
                                      {log.hashValue || 'Not computed'}
                                    </code>
                                    {log.hashValue && (
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 shrink-0"
                                        onClick={() => copyHash(log.hashValue!)}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  This hash is computed from: entityType + entityId + action + userId + timestamp + previousHash. 
                                  Any modification to the data will produce a different hash, making tampering detectable.
                                </p>
                              </div>

                              {/* Value Changes */}
                              {Boolean(log.previousValue || log.newValue) && (
                                <div className="space-y-2">
                                  <h4 className="font-semibold">Value Changes</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    {Boolean(log.previousValue) && (
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Previous Value</p>
                                        <pre className="text-xs bg-red-50 dark:bg-red-950/20 p-2 rounded overflow-auto max-h-32">
                                          {JSON.stringify(log.previousValue, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                    {Boolean(log.newValue) && (
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">New Value</p>
                                        <pre className="text-xs bg-green-50 dark:bg-green-950/20 p-2 rounded overflow-auto max-h-32">
                                          {JSON.stringify(log.newValue, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
