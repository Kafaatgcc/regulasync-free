import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronRight, Copy, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface Endpoint {
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  auth: boolean;
  params?: { name: string; type: string; required: boolean; description: string }[];
  body?: { name: string; type: string; required: boolean; description: string }[];
  response: string;
  example?: string;
}

interface ApiSection {
  title: string;
  description: string;
  endpoints: Endpoint[];
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-blue-600 text-white",
  POST: "bg-green-600 text-white",
  PUT: "bg-amber-600 text-white",
  PATCH: "bg-orange-600 text-white",
  DELETE: "bg-red-600 text-white",
};

const API_SECTIONS: ApiSection[] = [
  {
    title: "Authentication",
    description: "All API requests must include a valid API key in the Authorization header.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/auth/me",
        summary: "Get current user",
        description: "Returns the authenticated user's profile and organisation details.",
        auth: true,
        response: `{ "id": 1, "name": "Jane Smith", "email": "jane@acme.com", "role": "compliance_manager", "organizationId": 5 }`,
      },
    ],
  },
  {
    title: "Compliance Frameworks",
    description: "Manage regulatory frameworks and compliance obligations.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/frameworks",
        summary: "List all frameworks",
        description: "Returns all regulatory frameworks available to the organisation.",
        auth: true,
        params: [
          { name: "status", type: "string", required: false, description: "Filter by status: active | archived" },
          { name: "limit", type: "number", required: false, description: "Number of results (default 50, max 200)" },
          { name: "offset", type: "number", required: false, description: "Pagination offset" },
        ],
        response: `{ "data": [{ "id": 1, "name": "FCA SYSC", "status": "active", "obligationCount": 47, "complianceScore": 82 }], "total": 12 }`,
      },
      {
        method: "GET",
        path: "/api/v1/frameworks/:id",
        summary: "Get framework details",
        description: "Returns a single framework with all obligations and compliance status.",
        auth: true,
        params: [{ name: "id", type: "number", required: true, description: "Framework ID" }],
        response: `{ "id": 1, "name": "FCA SYSC", "obligations": [...], "gapCount": 5, "score": 82 }`,
      },
      {
        method: "POST",
        path: "/api/v1/frameworks",
        summary: "Create framework",
        description: "Creates a new compliance framework for the organisation.",
        auth: true,
        body: [
          { name: "name", type: "string", required: true, description: "Framework name" },
          { name: "description", type: "string", required: false, description: "Framework description" },
          { name: "regulatoryBody", type: "string", required: false, description: "e.g. FCA, PRA, ICO" },
        ],
        response: `{ "id": 15, "name": "DORA", "createdAt": "2026-06-14T10:00:00Z" }`,
      },
    ],
  },
  {
    title: "Policies",
    description: "Create, manage, and version control compliance policies.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/policies",
        summary: "List policies",
        description: "Returns all policies for the organisation with filtering and pagination.",
        auth: true,
        params: [
          { name: "status", type: "string", required: false, description: "draft | active | under_review | archived" },
          { name: "category", type: "string", required: false, description: "Policy category filter" },
          { name: "search", type: "string", required: false, description: "Full-text search" },
        ],
        response: `{ "data": [{ "id": 1, "title": "AML Policy", "status": "active", "version": "2.1", "nextReviewDate": "2026-12-01" }], "total": 28 }`,
      },
      {
        method: "POST",
        path: "/api/v1/policies",
        summary: "Create policy",
        description: "Creates a new policy document. Optionally use AI drafting by providing a prompt.",
        auth: true,
        body: [
          { name: "title", type: "string", required: true, description: "Policy title" },
          { name: "content", type: "string", required: false, description: "Policy content (Markdown)" },
          { name: "aiPrompt", type: "string", required: false, description: "AI drafting prompt — leave content empty to auto-generate" },
          { name: "category", type: "string", required: false, description: "Policy category" },
          { name: "frameworkId", type: "number", required: false, description: "Link to a compliance framework" },
        ],
        response: `{ "id": 42, "title": "Data Retention Policy", "status": "draft", "version": "1.0" }`,
        example: `{
  "title": "Data Retention Policy",
  "aiPrompt": "Draft a GDPR-compliant data retention policy for a UK financial services firm",
  "category": "Data Protection",
  "frameworkId": 3
}`,
      },
      {
        method: "PATCH",
        path: "/api/v1/policies/:id/status",
        summary: "Update policy status",
        description: "Transitions a policy through its lifecycle: draft → active → archived.",
        auth: true,
        params: [{ name: "id", type: "number", required: true, description: "Policy ID" }],
        body: [{ name: "status", type: "string", required: true, description: "New status: active | archived | under_review" }],
        response: `{ "success": true, "status": "active" }`,
      },
    ],
  },
  {
    title: "Risk Management",
    description: "Access risk assessments, scores, and predictive analytics.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/risks",
        summary: "List risk items",
        description: "Returns all risk items with severity scores and mitigation status.",
        auth: true,
        params: [
          { name: "severity", type: "string", required: false, description: "critical | high | medium | low" },
          { name: "status", type: "string", required: false, description: "open | mitigated | accepted | closed" },
        ],
        response: `{ "data": [{ "id": 1, "title": "Third-party data breach", "severity": "high", "score": 78, "status": "open" }], "total": 15 }`,
      },
      {
        method: "GET",
        path: "/api/v1/risks/predictive",
        summary: "Predictive risk analysis",
        description: "Returns AI-generated predictive risk scores and emerging threat analysis.",
        auth: true,
        response: `{ "overallRiskScore": 67, "trend": "increasing", "topRisks": [...], "predictions": [...] }`,
      },
    ],
  },
  {
    title: "Audit Trail",
    description: "Query the immutable audit log for compliance evidence.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/audit",
        summary: "Query audit log",
        description: "Returns audit trail entries with full-text search and date filtering.",
        auth: true,
        params: [
          { name: "query", type: "string", required: false, description: "Full-text search query" },
          { name: "from", type: "string", required: false, description: "ISO date — start of range" },
          { name: "to", type: "string", required: false, description: "ISO date — end of range" },
          { name: "userId", type: "number", required: false, description: "Filter by user" },
          { name: "action", type: "string", required: false, description: "Filter by action type" },
        ],
        response: `{ "data": [{ "id": 1, "action": "policy.approved", "userId": 5, "timestamp": "2026-06-14T09:30:00Z", "details": {...} }], "total": 1247 }`,
      },
      {
        method: "GET",
        path: "/api/v1/audit/export",
        summary: "Export audit log",
        description: "Exports audit log as CSV or PDF for regulatory submission.",
        auth: true,
        params: [
          { name: "format", type: "string", required: true, description: "csv | pdf" },
          { name: "from", type: "string", required: false, description: "ISO date" },
          { name: "to", type: "string", required: false, description: "ISO date" },
        ],
        response: "Binary file download (CSV or PDF)",
      },
    ],
  },
  {
    title: "Webhooks",
    description: "Manage outbound webhooks for real-time event delivery.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/webhooks",
        summary: "List webhooks",
        description: "Returns all configured webhooks for the organisation.",
        auth: true,
        response: `{ "data": [{ "id": 1, "label": "Jira", "url": "https://...", "events": ["compliance.alert"], "isActive": true }] }`,
      },
      {
        method: "POST",
        path: "/api/v1/webhooks",
        summary: "Create webhook",
        description: "Creates a new outbound webhook endpoint.",
        auth: true,
        body: [
          { name: "label", type: "string", required: true, description: "Human-readable label" },
          { name: "url", type: "string", required: true, description: "HTTPS endpoint URL" },
          { name: "events", type: "string[]", required: true, description: "Array of event types to subscribe to" },
        ],
        response: `{ "id": 5, "secret": "whsec_...", "label": "Jira Alerts" }`,
        example: `{
  "label": "Jira Compliance Alerts",
  "url": "https://your-jira.atlassian.net/webhooks/regulasync",
  "events": ["compliance.alert", "risk.high_detected", "audit.completed"]
}`,
      },
    ],
  },
  {
    title: "Users & Organisations",
    description: "Manage users, roles, and organisation settings.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/users",
        summary: "List users",
        description: "Returns all users in the organisation.",
        auth: true,
        response: `{ "data": [{ "id": 1, "name": "Jane Smith", "email": "jane@acme.com", "role": "compliance_manager", "isActive": true }] }`,
      },
      {
        method: "POST",
        path: "/api/v1/users/invite",
        summary: "Invite user",
        description: "Sends an invitation email to a new user.",
        auth: true,
        body: [
          { name: "email", type: "string", required: true, description: "Invitee email address" },
          { name: "role", type: "string", required: true, description: "compliance_manager | department_user | auditor | company_admin" },
          { name: "departmentId", type: "number", required: false, description: "Assign to department" },
        ],
        response: `{ "success": true, "inviteToken": "..." }`,
      },
    ],
  },
];

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
      >
        <Badge className={`${METHOD_COLORS[endpoint.method]} font-mono text-xs w-16 justify-center shrink-0`}>
          {endpoint.method}
        </Badge>
        <code className="text-sm font-mono text-foreground flex-1">{endpoint.path}</code>
        <span className="text-sm text-muted-foreground hidden md:block">{endpoint.summary}</span>
        {endpoint.auth && <Badge variant="outline" className="text-xs shrink-0">Auth</Badge>}
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-border/50 p-4 space-y-4 bg-muted/10">
          <p className="text-sm text-muted-foreground">{endpoint.description}</p>

          {endpoint.params && endpoint.params.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Parameters</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/50">
                    <th className="text-left py-1 pr-3">Name</th>
                    <th className="text-left py-1 pr-3">Type</th>
                    <th className="text-left py-1 pr-3">Required</th>
                    <th className="text-left py-1">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoint.params.map((p) => (
                    <tr key={p.name} className="border-b border-border/30">
                      <td className="py-1.5 pr-3 font-mono text-amber-400">{p.name}</td>
                      <td className="py-1.5 pr-3 text-blue-400">{p.type}</td>
                      <td className="py-1.5 pr-3">{p.required ? <Badge className="text-xs bg-red-600 text-white">required</Badge> : <span className="text-muted-foreground">optional</span>}</td>
                      <td className="py-1.5 text-muted-foreground">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {endpoint.body && endpoint.body.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Request Body</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/50">
                    <th className="text-left py-1 pr-3">Field</th>
                    <th className="text-left py-1 pr-3">Type</th>
                    <th className="text-left py-1 pr-3">Required</th>
                    <th className="text-left py-1">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoint.body.map((b) => (
                    <tr key={b.name} className="border-b border-border/30">
                      <td className="py-1.5 pr-3 font-mono text-amber-400">{b.name}</td>
                      <td className="py-1.5 pr-3 text-blue-400">{b.type}</td>
                      <td className="py-1.5 pr-3">{b.required ? <Badge className="text-xs bg-red-600 text-white">required</Badge> : <span className="text-muted-foreground">optional</span>}</td>
                      <td className="py-1.5 text-muted-foreground">{b.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {endpoint.example && (
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Example Request Body</p>
              <div className="relative">
                <pre className="bg-muted p-3 rounded text-xs font-mono text-green-400 overflow-x-auto">{endpoint.example}</pre>
                <Button variant="ghost" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => { navigator.clipboard.writeText(endpoint.example!); toast.success("Copied!"); }}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Response</p>
            <div className="relative">
              <pre className="bg-muted p-3 rounded text-xs font-mono text-blue-300 overflow-x-auto">{endpoint.response}</pre>
              <Button variant="ghost" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0"
                onClick={() => { navigator.clipboard.writeText(endpoint.response); toast.success("Copied!"); }}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiDocumentation() {
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const filtered = API_SECTIONS.map((section) => ({
    ...section,
    endpoints: section.endpoints.filter(
      (e) =>
        !search ||
        e.path.toLowerCase().includes(search.toLowerCase()) ||
        e.summary.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((s) => s.endpoints.length > 0);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">API Documentation</h1>
        <p className="text-muted-foreground mt-1">
          RESTful API reference for integrating RegulaSync with your enterprise systems.
        </p>
      </div>

      {/* Quick Start */}
      <Card className="bg-card border-amber-500/20 border">
        <CardHeader>
          <CardTitle className="text-base text-amber-500">Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Base URL</p>
            <pre className="bg-muted p-2 rounded font-mono text-xs text-foreground">https://your-domain.com/api/v1</pre>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Authentication</p>
            <pre className="bg-muted p-2 rounded font-mono text-xs text-foreground">Authorization: Bearer rsk_live_your_api_key_here</pre>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Content Type</p>
            <pre className="bg-muted p-2 rounded font-mono text-xs text-foreground">Content-Type: application/json</pre>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            {[
              { label: "Rate Limit", value: "1,000 req/min (Enterprise)" },
              { label: "Response Format", value: "JSON (UTF-8)" },
              { label: "API Version", value: "v1 (stable)" },
            ].map((item) => (
              <div key={item.label} className="p-2 rounded bg-muted/30 border border-border/50">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Generate API keys from <a href="/enterprise/integrations" className="text-amber-500 underline">Enterprise → Integrations</a>.
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search endpoints..."
          className="pl-9 bg-muted/30 border-border"
        />
      </div>

      {/* Endpoint Sections */}
      <div className="space-y-6">
        {filtered.map((section) => (
          <div key={section.title}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
              <Badge variant="outline" className="text-xs">{section.endpoints.length} endpoints</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
            <div className="space-y-2">
              {section.endpoints.map((endpoint) => (
                <EndpointCard key={`${endpoint.method}-${endpoint.path}`} endpoint={endpoint} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Error Codes */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Error Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 pr-4">Code</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                { code: "UNAUTHORIZED", status: 401, desc: "Missing or invalid API key" },
                { code: "FORBIDDEN", status: 403, desc: "Insufficient permissions for this operation" },
                { code: "NOT_FOUND", status: 404, desc: "Resource does not exist" },
                { code: "BAD_REQUEST", status: 400, desc: "Invalid request parameters or body" },
                { code: "RATE_LIMITED", status: 429, desc: "Too many requests — back off and retry" },
                { code: "INTERNAL_SERVER_ERROR", status: 500, desc: "Unexpected server error — contact support" },
              ].map((e) => (
                <tr key={e.code} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-mono text-xs text-red-400">{e.code}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{e.status}</td>
                  <td className="py-2 text-muted-foreground text-xs">{e.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
