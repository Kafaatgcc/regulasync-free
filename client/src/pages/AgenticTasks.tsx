import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bot, CheckCircle, Clock, Play, Plus, ThumbsDown, ThumbsUp, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  running: "bg-blue-100 text-blue-800",
  awaiting_approval: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  failed: "bg-gray-100 text-gray-800",
};

const taskTypeLabels: Record<string, string> = {
  policy_draft: "Policy Draft",
  policy_update: "Policy Update",
  gap_remediation: "Gap Remediation",
  evidence_collection: "Evidence Collection",
  report_generation: "Report Generation",
  notification_send: "Notification",
};

export default function AgenticTasks() {
  const [addOpen, setAddOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [form, setForm] = useState({
    taskType: "policy_draft" as const,
    title: "",
    description: "",
    triggeredBy: "manual" as const,
    priority: "medium" as const,
  });

  const { data: tasks = [], isLoading, refetch } = trpc.agenticTasks.list.useQuery(
    statusFilter !== "all" ? { status: statusFilter as any } : {}
  );

  const createTask = trpc.agenticTasks.create.useMutation({
    onSuccess: () => {
      refetch();
      setAddOpen(false);
      setForm({ taskType: "policy_draft", title: "", description: "", triggeredBy: "manual", priority: "medium" });
      toast.success("Task created", { description: "Agentic AI task has been queued for execution." });
    },
    onError: (e) => toast.error(e.message),
  });

  const executeTask = trpc.agenticTasks.execute.useMutation({
    onSuccess: () => { refetch(); toast.success("Task executed", { description: "AI has processed the task and is awaiting your approval." }); },
    onError: (e) => toast.error(e.message),
  });

  const approveTask = trpc.agenticTasks.approve.useMutation({
    onSuccess: () => { refetch(); toast.success("Task approved"); },
    onError: (e) => toast.error(e.message),
  });

  const rejectTask = trpc.agenticTasks.reject.useMutation({
    onSuccess: () => { refetch(); toast.success("Task rejected"); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = statusFilter === "all" ? tasks : tasks.filter((t: any) => t.status === statusFilter);

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t: any) => t.status === "pending").length,
    awaiting: tasks.filter((t: any) => t.status === "awaiting_approval").length,
    completed: tasks.filter((t: any) => t.status === "completed").length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Bot className="h-7 w-7 text-blue-600" /> Agentic AI</h1>
          <p className="text-gray-500 mt-1">Autonomous AI tasks for policy drafting, gap remediation, and compliance automation</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" /> New Task</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Agentic AI Task</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Task Type</Label>
                <Select value={form.taskType} onValueChange={v => setForm(f => ({ ...f, taskType: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(taskTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Draft GDPR Data Retention Policy" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Triggered By</Label>
                  <Select value={form.triggeredBy} onValueChange={v => setForm(f => ({ ...f, triggeredBy: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="ai_recommendation">AI Recommendation</SelectItem>
                      <SelectItem value="regulatory_update">Regulatory Update</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={() => createTask.mutate(form)} disabled={!form.title || createTask.isPending}>
                {createTask.isPending ? "Creating..." : "Create & Queue Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: stats.total, icon: Zap, color: "text-blue-600" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-500" },
          { label: "Awaiting Approval", value: stats.awaiting, icon: Bot, color: "text-purple-600" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-green-600" },
        ].map(s => (
          <Card key={s.label}><CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "running", "awaiting_approval", "completed", "rejected"].map(s => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)} className="capitalize">
            {s.replace(/_/g, " ")}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>AI Task Queue</CardTitle><CardDescription>All autonomous AI tasks with their current status and generated outputs</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading tasks...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No tasks found</p>
              <p className="text-sm mt-1">Create a new agentic task to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((task: any) => (
                <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{taskTypeLabels[task.taskType] || task.taskType}</Badge>
                        <Badge className={statusColors[task.status] || "bg-gray-100 text-gray-800"}>{task.status?.replace(/_/g, " ")}</Badge>
                        {task.priority === "urgent" && <Badge className="bg-red-100 text-red-800">URGENT</Badge>}
                      </div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                      {task.aiGeneratedContent && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs font-medium text-blue-700 mb-1">AI Generated Output:</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">{task.aiGeneratedContent}</p>
                        </div>
                      )}
                      {task.createdAt && <p className="text-xs text-gray-400 mt-2">Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</p>}
                    </div>
                    <div className="flex flex-col gap-2 min-w-fit">
                      {task.status === "pending" && (
                        <Button size="sm" onClick={() => executeTask.mutate({ taskId: task.id })} disabled={executeTask.isPending}>
                          <Play className="h-3 w-3 mr-1" /> Execute
                        </Button>
                      )}
                      {task.status === "awaiting_approval" && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approveTask.mutate({ taskId: task.id })}>
                            <ThumbsUp className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => rejectTask.mutate({ taskId: task.id })}>
                            <ThumbsDown className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
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
